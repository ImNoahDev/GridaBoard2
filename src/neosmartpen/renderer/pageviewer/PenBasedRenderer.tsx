import React from "react";
// import React, { Component } from 'react';
// import PropTypes from "prop-types";
import { InkStorage, PenEventName } from "../..";

import { PLAYSTATE, IRenderWorkerOption, ZoomFitEnum } from "./RenderWorkerBase";
import PenBasedRenderWorker from "./PenBasedRenderWorker";
// import { Paper } from "@material-ui/core";
import { NeoSmartpen, PenManager } from "../../index";
import * as UTIL from "../../utils/UtilsFunc";


import { IPageSOBP, ISize } from "../../DataStructure/Structures";
import { TransformParameters } from "../../../NcodePrintLib/Coordinates";
import { withResizeDetector } from 'react-resize-detector';
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { BoxProps } from "@material-ui/core";
import { IPenToViewerEvent } from "../../pencomm/neosmartpen";
import NeoPdfDocument from "../../../NcodePrintLib/NeoPdf/NeoPdfDocument";

export { PLAYSTATE };


/**
 * Properties
 */
interface Props extends BoxProps {
  pageInfo: IPageSOBP,
  inkStorage?: InkStorage,
  playState?: PLAYSTATE,
  pens?: NeoSmartpen[],

  baseScale?: number,
  width?: number,
  height?: number,

  viewFit?: ZoomFitEnum;

  /** viewFit을 맞출 때의 마진 pixel 단위 */
  fitMargin?: number,
  fixed?,

  pdfSize: { width: number, height: number };

  pdfUrl: string;

  /**
   * @param pageInfo 
   * @param isFromEveryPgInfo - 매번 page info가 나올때마다 불려진 것인가? 아니면 페이지가 바뀔때 불려진 것인가?
   */
  onNcodePageChanged: (arg: IPageSOBP, isFromEveryPgInfo: boolean) => void;

  onCanvasShapeChanged: (arg: { offsetX: number, offsetY: number, zoom: number }) => void;

  /** canvas rotation, 0: portrait, 90: landscape */
  rotation: number;


  /** transform matrix it can be undefined */
  h: TransformParameters;
  position: { offsetX: number, offsetY: number, zoom: number },


}


/**
 * State
 */
interface State {

  sizeUpdate: number,
  penEventCount: number,
  strokeCount: number,
  liveDotCount: number,

  pageInfo: {
    section: number,
    owner: number,
    book: number,
    page: number
  },

  viewFit: ZoomFitEnum,
  pens: NeoSmartpen[],
  playState: PLAYSTATE,

  renderCount: number,

}

/**
 * TO DO: 2020/11/05
 *    1)  Pen에서 Event를 받아 실시간 rendering만 하는 component로 만들것
 *
 */
class PenBasedRenderer_module extends React.Component<Props, State> {
  state: State = {
    sizeUpdate: 0,
    penEventCount: 0,
    strokeCount: 0,
    liveDotCount: 0,

    pageInfo: {
      section: -1,
      owner: -1,
      book: -1,
      page: -1,
    },

    viewFit: ZoomFitEnum.ACTUAL,

    /** @type {Array.<NeoSmartpen>} */
    pens: [],

    playState: PLAYSTATE.live,

    renderCount: 0,
  };

  renderer: PenBasedRenderWorker;

  propsSize: { scale: number, width: number, height: number } = { scale: 1, width: 0, height: 0 };
  size: ISize = { width: 0, height: 0 };

  mainDiv: HTMLDivElement = null;
  canvasId = "";
  canvas: HTMLCanvasElement = null;

  inkStorage: InkStorage = null;

  fitMargin = 0;
  fixed = false;
  shouldSendPageInfo = false;

  setMainDivRef = (div: HTMLDivElement) => {
    this.mainDiv = div;
  };

  setCanvasRef = (canvas: HTMLCanvasElement) => {
    this.canvas = canvas;
  }

  subscribedPens = [] as NeoSmartpen[];

  constructor(props: Props) {
    super(props);

    const { pageInfo, inkStorage, baseScale, playState, fitMargin, width, height, fixed, pdfSize, viewFit } = props;
    this.inkStorage = inkStorage ? inkStorage : InkStorage.getInstance();

    this.canvasId = UTIL.uuidv4();
    this.canvasId = "fabric canvas";

    this.propsSize = { scale: baseScale, ...pdfSize };

    if (fixed !== undefined) this.fixed = fixed;
    if (fitMargin !== undefined) this.fitMargin = fitMargin;
    if (pageInfo !== undefined) this.state.pageInfo = pageInfo;
    if (playState !== undefined) this.state.playState = playState;
    if (viewFit !== undefined) this.state.viewFit = viewFit;
  }


  /**
   * @private
   * @param {NeoSmartpen} pen
   */
  private subscribePenEvent = (pen: NeoSmartpen) => {
    if (!this.subscribedPens.includes(pen)) {
      pen.addEventListener(PenEventName.ON_PEN_DOWN, this.onLivePenDown);
      pen.addEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo);
      pen.addEventListener(PenEventName.ON_PEN_MOVE, this.onLivePenMove);
      pen.addEventListener(PenEventName.ON_PEN_UP, this.onLivePenUp);
      pen.addEventListener(PenEventName.ON_HOVER_MOVE, this.onLiveHoverMove);
      pen.addEventListener(PenEventName.ON_PEN_HOVER_PAGEINFO, this.onLiveHoverPageInfo);

      // virual pen down/up은, 펜 스트로크가 이어지고 있음에도 페이지가 바뀌는 경우에 발생한다
      pen.addEventListener(PenEventName.ON_PEN_DOWN_VIRTUAL, this.onLivePenDown);
      pen.addEventListener(PenEventName.ON_PEN_UP_VIRTUAL, this.onLivePenUp);

      this.subscribedPens.push(pen);

      if (this.renderer) {
        this.renderer.createHoverCursor(pen);
      }
    }
  }

  /**
   * @private
   * @param {NeoSmartpen} pen
   */
  private unsubscribePenEvent = (pen: NeoSmartpen) => {
    if (this.subscribedPens.includes(pen)) {
      pen.removeEventListener(PenEventName.ON_PEN_DOWN, this.onLivePenDown);
      pen.removeEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo);
      pen.removeEventListener(PenEventName.ON_PEN_MOVE, this.onLivePenMove);
      pen.removeEventListener(PenEventName.ON_PEN_UP, this.onLivePenUp);
      pen.removeEventListener(PenEventName.ON_HOVER_MOVE, this.onLiveHoverMove);

      pen.removeEventListener(PenEventName.ON_PEN_DOWN_VIRTUAL, this.onLivePenDown);
      pen.removeEventListener(PenEventName.ON_PEN_UP_VIRTUAL, this.onLivePenUp);

      const index = this.subscribedPens.indexOf(pen);
      this.subscribedPens.splice(index, 1);

      if (this.renderer) {
        this.renderer.removeHoverCursor(pen);
      }
    }
  }

  private unsubscribeAllPensEvent = () => {
    this.subscribedPens.forEach(pen => {
      this.unsubscribePenEvent(pen);
    });
  }

  /** pen array를 제외하고는 event listening을 하지 않도록 */
  private makeUpPenEvents = (pens: NeoSmartpen[]) => {
    // 먼저 이벤트 리스닝을 해제할 것은 하고
    const needToUnsubscribe = this.subscribedPens.filter(pen => !pens.includes(pen));
    needToUnsubscribe.forEach(pen => {
      this.unsubscribePenEvent(pen);
    });

    const needToSubscribe = pens.filter(pen => !this.subscribedPens.includes(pen));
    needToSubscribe.forEach(pen => {
      this.subscribePenEvent(pen);
    });

  }


  /**
   * @override
   * @public
   */
  componentDidMount() {
    const { pens } = this.props;
    console.log(`PenBasedRenderer: size ${this.propsSize.width}, ${this.propsSize.height}`);

    console.log("Renderer Inited");
    this.initRenderer(this.propsSize);
    this.makeUpPenEvents(pens);
  }


  /**
   * @override
   * @public
   */
  shouldComponentUpdate(nextProps: Props, nextState: State) {
    let ret_val = true;

    if (nextProps.pens !== this.props.pens) {
      console.log(`PenBasedRenderer: shouldComponentUpdate, EventSubscribing`);
      this.makeUpPenEvents(nextProps.pens);
      ret_val = true;
    }

    if (nextProps.rotation !== this.props.rotation) {
      this.renderer.setRotation(nextProps.rotation);
      ret_val = false;
    }

    if (nextProps.h !== this.props.h) {
      this.renderer.setTransformParameters(nextProps.h);
      ret_val = false;
    }


    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      this.onResized({ width: nextProps.width, height: nextProps.height });
      ret_val = true;
    }

    if (nextProps.pdfUrl !== this.props.pdfUrl) {
      this.shouldSendPageInfo = true;
      ret_val = true;
    }

    return ret_val;
  }

  initRenderer(size: { width: number, height: number }) {
    /** @type {{width:number, height:number}} */
    const { width, height } = size;

    const options: IRenderWorkerOption = {
      canvasId: this.canvasId,
      canvas: this.canvas,
      width,
      height,
      mouseAction: !this.fixed,
      viewFit: this.state.viewFit,
      fitMargin: this.fitMargin,
      onCanvasShapeChanged: this.props.onCanvasShapeChanged,
      rotation: this.props.rotation,
    };

    const renderer = new PenBasedRenderWorker(options);
    this.renderer = renderer;
  }

  onResized = ({ width, height }) => {
    const rect = { x: 0, y: 0, width, height };
    const scale = this.propsSize.scale;

    // this.size = this.getSize(scale, rect);

    if (this.renderer) {
      this.renderer.onViewSizeChanged(width, height);
    }
  }


  resizeListener = (e) => {
    this.setState({ sizeUpdate: this.state.sizeUpdate + 1 });

    // const { classes, scaleType, scale } = this.props;

    let { width, height } = this.propsSize;

    const node = this.mainDiv;

    if (node) {
      const parentHeight = node.offsetHeight;
      const parentWidth = node.offsetWidth;

      width = parentWidth;
      height = parentHeight;

      // console.log(`boundary check, Parent window (width, height) = (${parentWidth}, ${parentHeight})`);
    }
    this.onResized({ width, height });
  };





  /**
   * @override
   * @public
   */
  componentWillUnmount() {
    /** @type {Array.<NeoSmartpen>} */
    const pens = this.props.pens;
    pens.forEach(pen => this.unsubscribePenEvent(pen));

    // this.renderer.stopInterval();
    window.removeEventListener("resize", this.resizeListener);

    // penManager에 연결 해제
    const penManager = PenManager.getInstance();
    penManager.unregisterRenderContainer(this);
  }





  /**
   *
   * @param {{strokeKey:string, mac:string, time:number, stroke:NeoStroke}} event
   */
  onLivePenDown = (event: IPenToViewerEvent) => {
    // console.log(event);
    if (this.renderer) {
      this.renderer.createLiveStroke(event);
    }
  }


  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, section:number, owner:number, book:number, page:number}} event
   */
  onLivePenPageInfo = (event: IPenToViewerEvent) => {
    const { penEventCount } = this.state;
    const { section, owner, book, page } = event;

    const prevPageInfo = this.state.pageInfo;
    if (UTIL.isSamePage(prevPageInfo, event as IPageSOBP) && (!this.shouldSendPageInfo)) {
      return;
    }
    this.shouldSendPageInfo = false;

    /** 내부 상태를 바꾼다. */
    this.setState({
      penEventCount: penEventCount + 1,
      pageInfo: { section, owner, book, page }
    });

    /** 테스트용 */
    const inkStorage = this.inkStorage;
    if (inkStorage) {
      const pageStrokesCount = inkStorage.getPageStrokes(event as IPageSOBP).length;
      this.setState({ strokeCount: pageStrokesCount });
    }

    /** 잉크 렌더러의 페이지를 바꾼다 */
    if (this.renderer) {
      this.renderer.changePage(section, owner, book, page, false);
    }

    /** pdf pageNo를 바꿀 수 있게, container에게 전달한다. */
    this.props.onNcodePageChanged({ section, owner, book, page }, true);
  }


  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, dot:NeoDot}} event
   */

  onLivePenMove = (event: IPenToViewerEvent) => {
    if (this.renderer) {
      this.renderer.pushLiveDot(event);
    }
    // const { liveDotCount } = this.state;

    // this.setState({ liveDotCount: liveDotCount + 1 });
    // console.log(event);
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke, section:number, owner:number, book:number, page:number}} event
   */
  onLivePenUp = (event: IPenToViewerEvent) => {
    console.log("Pen Up");
    if (this.renderer) {
      this.renderer.closeLiveStroke(event);
    }

    // const { penEventCount, inkStorage } = this.state;
    // this.setState({ penEventCount: penEventCount + 1 });
    // if (inkStorage) {
    //   let pageStrokesCount = inkStorage.getPageStrokes(event).length;
    //   this.setState({ strokeCount: pageStrokesCount });
    // }
    // console.log(event);
  }

  onLiveHoverPageInfo = (event: IPenToViewerEvent) => {
    if (this.renderer) {
      // this.renderer.addHoverPoints(event);
    }
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, dot:NeoDot}} event
   */

  onLiveHoverMove = (event: IPenToViewerEvent) => {
    if (this.renderer) {
      this.renderer.moveHoverPoint(event);
    }
    // const { liveDotCount } = this.state;

    // this.setState({ liveDotCount: liveDotCount + 1 });
    // console.log(event);
  }

  getSize = (scale, rect) => {
    const size = {
      width: rect.width,
      height: rect.height,
    };

    return size;
  };


  render() {
    // const { classes, scaleType, scale } = this.props;
    const { pens } = this.props;
    const { scale, width, height } = this.propsSize;
    const { section, owner, book, page } = this.state.pageInfo;
    let { zoom } = this.props.position;

    const rect = { x: 0, y: 0, width, height };
    // const { rect } = this.state;
    const { penEventCount } = this.state;
    this.size = this.getSize(scale, rect);

    // const manager = PenManager.getInstance();
    // let connected_pens = manager.getConnectedPens();

    const cssWidth = this.props.pdfSize.width * zoom;
    const cssHeight = this.props.pdfSize.height * zoom;

    zoom = 1;

    const inkContainerDiv: CSSProperties = {
      position: "absolute",
      zoom: zoom,
      left: this.props.position.offsetX / zoom,
      top: this.props.position.offsetY / zoom,
      zIndex: 3,
    }

    const inkCanvas: CSSProperties = {
      position: "absolute",
      zoom: 1,
      left: 0,
      top: 0,
      zIndex: 3,
    }


    return (
      <div id="pen-based-renderer" ref={this.setMainDivRef} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}>
          <div id="pen-information">
            <ul>
              {pens.map((pen, i) => (
                <li key={i}>{pen.mac}</li>
              ))}
            </ul>
          </div>
          <div style={{ fontSize: "20px", fontWeight: "bold", color: "rgba(255,0,0,255)" }}>
            PenBasedRenderer{section}.{owner}.{book}.{page}:{penEventCount}
          </div>
        </div>

        {/* <Paper style={{ height: this.size.height, width: this.size.width }}> */}
        <div id="ink-container" style={inkContainerDiv} >
          <canvas id={this.canvasId} width={cssWidth} height={cssHeight} style={inkCanvas} ref={this.setCanvasRef} />
        </div>
        {/* </Paper> */}
      </div >
    );
  }
}

const AdaptiveWithDetector = withResizeDetector(PenBasedRenderer_module);

const PenBasedRenderer = (props: Props) => {
  return (
    <React.Fragment>
      <AdaptiveWithDetector {...props} />
    </React.Fragment>
  )
}

export default PenBasedRenderer;