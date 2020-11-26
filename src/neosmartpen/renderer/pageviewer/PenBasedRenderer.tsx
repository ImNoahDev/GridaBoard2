import React from "react";
// import React, { Component } from 'react';
// import PropTypes from "prop-types";
import { InkStorage, PenEventName } from "../..";

import { ZoomFitEnum, PLAYSTATE, IRenderWorkerOption } from "./RenderWorkerBase";
import PenBasedRenderWorker from "./PenBasedRenderWorker";
// import { Paper } from "@material-ui/core";
import { NeoSmartpen, PenManager } from "../../index";
import * as UTIL from "../../utils/UtilsFunc";

import { Size } from "../../types";
import { IPageSOBP } from "../../DataStructure/Structures";
// import { Util } from "pdfjs-dist";

export { PLAYSTATE };


/**
 * Properties
 */
type IPenBasedRendererProps = {
  pageInfo: IPageSOBP,
  inkStorage?: InkStorage,
  playState?: PLAYSTATE,
  pens?: NeoSmartpen[],

  scale?: number,
  width?: number;
  height?: number;

  viewFit?: ZoomFitEnum;

  onNcodePageChanged: Function;
  onCanvasShapeChanged: Function;
}


/**
 * State
 */
interface IPenBasedRendererState {
  renderer: PenBasedRenderWorker | null,

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

  scale: number,
  playState: PLAYSTATE,

  renderCount: number,

}

/**
 * TO DO: 2020/11/05
 *    1)  Pen에서 Event를 받아 실시간 rendering만 하는 component로 만들것
 *
 */
export default class PenBasedRenderer extends React.Component<IPenBasedRendererProps, IPenBasedRendererState> {
  state: IPenBasedRendererState = {
    renderer: null,
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
    scale: 1,

    playState: PLAYSTATE.live,

    renderCount: 0,
  };

  propsSize: { scale: number, width: number, height: number } = { scale: 1, width: 0, height: 0 };
  size: Size = { width: 0, height: 0 };

  canvasId: string = "";
  canvasRef: React.RefObject<HTMLCanvasElement> = null;
  myRef: React.RefObject<HTMLDivElement> = null;

  inkStorage: InkStorage = null;
  curr_pens: NeoSmartpen[] = new Array(0);

  constructor(props: IPenBasedRendererProps) {
    super(props);
    // kitty
    this.canvasRef = React.createRef();
    this.myRef = React.createRef();

    let { pageInfo, inkStorage, scale, playState, width, height, pens, viewFit } = props;
    this.inkStorage = inkStorage ? inkStorage : InkStorage.getInstance();

    this.state.pageInfo = pageInfo ? pageInfo : this.state.pageInfo;
    this.state.scale = scale ? scale : this.state.scale;
    this.state.playState = playState ? playState : this.state.playState;
    this.state.viewFit = viewFit ? viewFit : this.state.viewFit;

    this.canvasId = UTIL.uuidv4();

    this.curr_pens = pens;
    this.propsSize = { scale, width, height };
  }


  /**
   * @private
   * @param {NeoSmartpen} pen
   */
  private subscribePenEvent = (pen: NeoSmartpen) => {
    pen.addEventListener(PenEventName.ON_PEN_DOWN, this.onLivePenDown);
    pen.addEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo);
    pen.addEventListener(PenEventName.ON_PEN_MOVE, this.onLivePenMove);
    pen.addEventListener(PenEventName.ON_PEN_UP, this.onLivePenUp);
    pen.addEventListener(PenEventName.ON_HOVER_MOVE, this.onLiveHoverMove);
    pen.addEventListener(PenEventName.ON_PEN_HOVER_PAGEINFO, this.onLiveHoverPageInfo);
  }

  /**
   * @private
   * @param {NeoSmartpen} pen
   */
  private unsubscribePenEvent = (pen: NeoSmartpen) => {
    pen.removeEventListener(PenEventName.ON_PEN_DOWN, this.onLivePenDown);
    pen.removeEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo);
    pen.removeEventListener(PenEventName.ON_PEN_MOVE, this.onLivePenMove);
    pen.removeEventListener(PenEventName.ON_PEN_UP, this.onLivePenUp);
    pen.removeEventListener(PenEventName.ON_HOVER_MOVE, this.onLiveHoverMove);

  }


  /**
   * @override
   * @public
   */
  componentDidMount() {
    let { pens } = this.props;
    let { width, height } = this.propsSize;

    const node = this.myRef.current;
    if (node) {
      let parentHeight = node.offsetHeight;
      let parentWidth = node.offsetWidth;

      console.log(`Parent window (width, height) = (${parentWidth}, ${parentHeight})`);

      if (!width || !height) {
        width = parentWidth;
        height = parentHeight;
        this.propsSize = { width, height, scale: this.propsSize.scale };

        const renderCount = this.state.renderCount;
        this.setState({ renderCount: renderCount + 1 });
      }
    }

    // let size = this.size;

    /** @type {{pageId:number, width:number, height:number, pens:Array.<NeoSmartpen> }} */

    // let rect = { x: 0, y: 0, width, height };

    // const page = pages.filter((p) => p.pageNumber === pageId)[0];
    // console.log("Draw Stroke size", pageId, "canvas size", size, "rect", rect);

    console.log(`PenBasedRenderer: size ${this.propsSize.width}, ${this.propsSize.height}`);

    console.log("Renderer Inited");
    this.initRenderer(this.propsSize);
    window.addEventListener("resize", this.resizeListener);

    // subscribe all event from pen
    pens.forEach(pen => {
      console.log(`PenBasedRenderer: componentDidMount, EventSubscribing`);
      this.subscribePenEvent(pen)
    });
  }


  /**
   * @override
   * @public
   */
  shouldComponentUpdate(nextProps: IPenBasedRendererProps, nextState: IPenBasedRendererState) {
    let ret_val = true;

    if (nextProps.pens !== this.curr_pens) {
      /** @type {Array<NeoSmartpen>} */
      const new_pens = nextProps.pens;

      /** @type {Array<NeoSmartpen>} */
      const curr_pens = this.curr_pens;

      // subscribe all event from pen
      new_pens.forEach(pen => {
        console.log(`PenBasedRenderer: shouldComponentUpdate, EventSubscribing`);
        const index = curr_pens.indexOf(pen);
        if (index < 0) {
          this.subscribePenEvent(pen)
        }
      });

      this.curr_pens = nextProps.pens;

      ret_val = true;
    }

    return ret_val;
  }

  /**
   * @override
   * @public
   */
  componentWillUnmount() {
    /** @type {Array.<NeoSmartpen>} */
    const pens = this.props.pens;
    pens.forEach(pen => this.unsubscribePenEvent(pen));

    // this.state.renderer.stopInterval();
    window.removeEventListener("resize", this.resizeListener);

    // penManager에 연결 해제
    let penManager = PenManager.getInstance();
    penManager.unregisterRenderContainer(this);
  }


  resizeListener = () => {
    this.setState({ sizeUpdate: this.state.sizeUpdate + 1 });

    // const { classes, scaleType, scale } = this.props;

    const { scale, width, height } = this.propsSize;


    const rect = { x: 0, y: 0, width, height };
    // const { rect } = this.state;
    // const { penEventCount } = this.state;
    this.size = this.getSize(scale, rect);

    if (this.state.renderer) {
      // console.log("render resize", this.size)
      this.state.renderer.resize(this.size);
    }
  };



  initRenderer(size: { width: number, height: number }) {
    /** @type {{width:number, height:number}} */
    const { width, height } = size;

    // const rect = { x: 0, y: 0, width, height };
    // const { rect } = this.state;
    // const page = pages.filter((p) => p.pageNumber === pageId)[0];

    // const inkStorage = this.inkStorage;
    const options: IRenderWorkerOption = {
      canvasId: this.canvasId,
      canvasRef: this.canvasRef,
      width,
      height,
      viewFit: this.state.viewFit,
      onCanvasShapeChanged: this.props.onCanvasShapeChanged,
    };

    let renderer = new PenBasedRenderWorker(options);
    this.setState({ renderer: renderer });
  }



  /**
   *
   * @param {{strokeKey:string, mac:string, time:number, stroke:NeoStroke}} event
   */
  onLivePenDown = (event) => {
    // console.log(event);
    if (this.state.renderer) {
      this.state.renderer.createLiveStroke(event);
    }
  }


  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, section:number, owner:number, book:number, page:number}} event
   */
  onLivePenPageInfo = (event) => {
    const { penEventCount } = this.state;
    const { section, owner, book, page } = event;

    const prevPageInfo = this.state.pageInfo;
    if (UTIL.isSamePage(prevPageInfo, event)) {
      return;
    }

    /** 내부 상태를 바꾼다. */
    this.setState({
      penEventCount: penEventCount + 1,
      pageInfo: { section, owner, book, page }
    });

    /** 테스트용 */
    const inkStorage = this.inkStorage;
    if (inkStorage) {
      let pageStrokesCount = inkStorage.getPageStrokes(event).length;
      this.setState({ strokeCount: pageStrokesCount });
    }

    /** 잉크 렌더러의 페이지를 바꾼다 */
    if (this.state.renderer) {
      this.state.renderer.changePage(section, owner, book, page, false);
    }

    /** pdf pageNo를 바꿀 수 있게, container에게 전달한다. */
    this.props.onNcodePageChanged({ section, owner, book, page });
  }


  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, dot:NeoDot}} event
   */

  onLivePenMove = (event) => {
    if (this.state.renderer) {
      this.state.renderer.pushLiveDot(event);
    }
    // const { liveDotCount } = this.state;

    // this.setState({ liveDotCount: liveDotCount + 1 });
    // console.log(event);
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke, section:number, owner:number, book:number, page:number}} event
   */
  onLivePenUp = (event) => {
    console.log("Pen Up");
    if (this.state.renderer) {
      this.state.renderer.closeLiveStroke(event);
    }

    // const { penEventCount, inkStorage } = this.state;
    // this.setState({ penEventCount: penEventCount + 1 });
    // if (inkStorage) {
    //   let pageStrokesCount = inkStorage.getPageStrokes(event).length;
    //   this.setState({ strokeCount: pageStrokesCount });
    // }
    // console.log(event);
  }

  onLiveHoverPageInfo = (event) => {
    if (this.state.renderer) {
      this.state.renderer.addHoverPoints(event);
    }
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, dot:NeoDot}} event
   */

  onLiveHoverMove = (event) => {
    if (this.state.renderer) {
      this.state.renderer.moveHoverPoint(event);
    }
    // const { liveDotCount } = this.state;

    // this.setState({ liveDotCount: liveDotCount + 1 });
    // console.log(event);
  }

  getSize = (scale, rect) => {
    let size = {
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

    const rect = { x: 0, y: 0, width, height };
    // const { rect } = this.state;
    const { penEventCount } = this.state;
    this.size = this.getSize(scale, rect);

    // const manager = PenManager.getInstance();
    // let connected_pens = manager.getConnectedPens();

    const dpr = UTIL.getDisplayRatio();
    // const windowWidth = window.innerWidth / dpr;
    const windowHeight = window.innerHeight / dpr;
    const aWidth = document.body.clientWidth;
    // const aWidth2 = document.body.scrollWidth;
    const aHeight = windowHeight;

    const statusBarHeight = 400;

    return (
      <div id="replayContainer" ref={this.myRef} style={{ position: "relative" }}>
        <div style={{
          zIndex: 99,
          display: "flex", flexDirection: "column",
        }}>

          <div style={{
            height: statusBarHeight + "px",
            display: "flex", flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}>
            <div>
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

        </div>


        <div style={{
          zIndex: 5,
          position: "relative",
          left: "0px",
          top: -statusBarHeight + "px",
        }}>
          {/* <Paper style={{ height: this.size.height, width: this.size.width }}> */}
          <canvas id={this.canvasId} ref={this.canvasRef}
            style={{
              width: width ? width : aWidth,
              height: height ? height : aHeight
            }} />
          {/* </Paper> */}
        </div>
      </div >
    );
  }
}

