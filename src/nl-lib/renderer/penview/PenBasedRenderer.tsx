import React from "react";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { Typography } from "@material-ui/core";

import { IRenderWorkerOption } from "./RenderWorkerBase";
import PenBasedRenderWorker from "./PenBasedRenderWorker";
import { MixedViewProps } from "../MixedPageView";

import { PenEventName, PLAYSTATE, ZoomFitEnum } from "../../common/enums";
import { IPageSOBP, ISize } from "../../common/structures";
import { isSamePage, makeNPageIdStr, uuidv4 } from "../../common/util";

import { IPenToViewerEvent } from "../../common/neopen";
import { MappingStorage } from "../../common/mapper";
import PenManager from "../../neosmartpen/PenManager";
import { InkStorage } from "../../common/penstorage";
import { NeoSmartpen } from "../../neosmartpen";


/**
 * Properties
 */
interface Props extends MixedViewProps {
  baseScale?: number,

  pdfSize: { width: number, height: number };

  onNcodePageChanged: (arg: IPageSOBP) => void;

  onCanvasPositionChanged: (arg: { offsetX: number, offsetY: number, zoom: number }) => void;

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
class PenBasedRenderer extends React.Component<Props, State> {
  state: State = {
    sizeUpdate: 0,
    penEventCount: 0,
    strokeCount: 0,
    liveDotCount: 0,

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

    const { pageInfo, baseScale, playState, fitMargin, width, height, fixed, pdfSize, viewFit } = props;
    this.inkStorage = InkStorage.getInstance();

    this.canvasId = uuidv4();
    // this.canvasId = "fabric canvas";

    this.propsSize = { scale: baseScale, ...pdfSize };

    if (fixed !== undefined) this.fixed = fixed;
    if (fitMargin !== undefined) this.fitMargin = fitMargin;
    if (playState !== undefined) this.state.playState = playState;
    if (viewFit !== undefined) this.state.viewFit = viewFit;
  }

  private subScriptStorageEvent = () => {
    const inkStorage = this.inkStorage;
    // console.log(`Renderer(${this.props.parentName}): subScriptStorageEvent`);

    if (inkStorage) {
      const filter = { mac: null };
      inkStorage.addEventListener(PenEventName.ON_PEN_DOWN, this.onLivePenDown_byStorage, filter);
      inkStorage.addEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo_byStorage, filter);
      inkStorage.addEventListener(PenEventName.ON_PEN_MOVE, this.onLivePenMove_byStorage, filter);
      inkStorage.addEventListener(PenEventName.ON_PEN_UP, this.onLivePenUp_byStorage, filter);
    }
  }


  private unsubScriptStorageEvent = () => {
    const inkStorage = this.inkStorage;
    if (inkStorage) {
      inkStorage.removeEventListener(PenEventName.ON_PEN_DOWN, this.onLivePenDown_byStorage);
      inkStorage.removeEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo_byStorage);
      inkStorage.removeEventListener(PenEventName.ON_PEN_MOVE, this.onLivePenMove_byStorage);
      inkStorage.removeEventListener(PenEventName.ON_PEN_UP, this.onLivePenUp_byStorage);
    }
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
    // console.log(`PenBasedRenderer: size ${this.propsSize.width}, ${this.propsSize.height}`);
    // console.log("Renderer Inited");

    this.initRenderer(this.propsSize);

    const transform = MappingStorage.getInstance().getNPageTransform(this.props.pageInfo);
    this.renderer.setTransformParameters(transform.h);

    this.makeUpPenEvents(pens);

    if (this.props.fromStorage) {
      // console.log(`Renderer(${this.props.parentName}): componentDidMount`);
      this.subScriptStorageEvent();
    }
  }


  /**
   * @override
   * @public
   */
  shouldComponentUpdate(nextProps: Props, nextState: State) {
    let ret_val = true;

    if (nextProps.pens !== this.props.pens) {
      // console.log(`PenBasedRenderer: shouldComponentUpdate, EventSubscribing`);
      this.makeUpPenEvents(nextProps.pens);
      ret_val = true;
    }

    if (nextProps.rotation !== this.props.rotation) {
      this.renderer.setRotation(nextProps.rotation);
      ret_val = false;
    }

    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      this.onViewResized({ width: nextProps.width, height: nextProps.height });
      ret_val = true;
    }

    if (nextProps.pdfUrl !== this.props.pdfUrl) {
      this.shouldSendPageInfo = true;
      ret_val = true;
    }

    if (nextProps.pdfSize.width !== this.props.pdfSize.width || nextProps.pdfSize.height !== this.props.pdfSize.height) {
      this.onPaperResized({ width: nextProps.pdfSize.width, height: nextProps.pdfSize.height });
      ret_val = true;
    }

    if (!isSamePage(nextProps.pageInfo, this.props.pageInfo)) {
      if (this.renderer) {
        const { section, owner, book, page } = nextProps.pageInfo;
        this.renderer.changePage(section, owner, book, page, false);
        const transform = MappingStorage.getInstance().getNPageTransform(nextProps.pageInfo);
        this.renderer.setTransformParameters(transform.h);
        ret_val = true;
      }
    }

    // if (!isSamePage(nextProps.pageInfo, this.props.pageInfo)) {
    //   if (!nextProps.autoPageChange) {
    //     this.setState({ pageInfo: { ...nextProps.pageInfo } });

    //     /** 잉크 렌더러의 페이지를 바꾼다 */
    //     const { section, owner, book, page } = nextProps.pageInfo;
    //     if (this.renderer) {
    //       this.renderer.changePage(section, owner, book, page, false);
    //     }
    //   }

    //   ret_val = true;
    // }

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
      onCanvasPositionChanged: this.props.onCanvasPositionChanged,
      rotation: this.props.rotation,
    };

    const renderer = new PenBasedRenderWorker(options);
    this.renderer = renderer;
  }


  onPaperResized = ({ width, height }) => {
    this.propsSize = { scale: this.propsSize.scale, width, height };


    if (this.renderer) {
      this.renderer.onPageSizeChanged(width, height);
    }
  }


  onViewResized = ({ width, height }) => {
    const rect = { x: 0, y: 0, width, height };
    const scale = this.propsSize.scale;

    // this.size = this.getSize(scale, rect);

    if (this.renderer) {
      this.renderer.onViewSizeChanged(width, height);
    }
  }


  /**
   * @override
   * @public
   */
  componentWillUnmount() {
    /** @type {Array.<NeoSmartpen>} */
    const pens = this.props.pens;
    pens.forEach(pen => this.unsubscribePenEvent(pen));

    if (this.props.fromStorage) this.unsubScriptStorageEvent();
    // this.renderer.stopInterval();
    // window.removeEventListener("resize", this.resizeListener);

    // // penManager에 연결 해제
    // const penManager = PenManager.getInstance();
    // if (penManager) {
    //   penManager.unregisterRenderContainer(this);
    // }
  }





  /**
   *
   * @param {{strokeKey:string, mac:string, time:number, stroke:NeoStroke}} event
   */
  onLivePenDown = (event: IPenToViewerEvent) => {
    // console.log(event);
    if (this.renderer) {
      // const { section, owner, book, page } = event;
      // if (isSamePage(this.props.pageInfo, { section, owner, book, page }))
      this.renderer.createLiveStroke(event);
    }
  }

  onLivePenDown_byStorage = (event: IPenToViewerEvent) => {
    console.log(`Renderer(${makeNPageIdStr(this.props.pageInfo)}): onLivePenDown from InkStorage`);

    // if (this.renderer) {
    //   this.renderer.createLiveStroke_byStorage(event);
    // }
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, section:number, owner:number, book:number, page:number}} event
   */
  onLivePenPageInfo = (event: IPenToViewerEvent) => {
    const { section, owner, book, page } = event;
    const prevPageInfo = this.props.pageInfo;
    if (isSamePage(prevPageInfo, event as IPageSOBP) && (!this.shouldSendPageInfo)) {
      return;
    }
    this.shouldSendPageInfo = false;

    /** pdf pageNo를 바꿀 수 있게, container에게 전달한다. */
    if (this.props.onNcodePageChanged) {
      this.props.onNcodePageChanged({ section, owner, book, page });
    }
  }
  onLivePenPageInfo_byStorage = (event: IPenToViewerEvent) => {
    // const { section, owner, book, page } = event;
    // const pageInfo = { section, owner, book, page } as IPageSOBP;

    // console.log(`Renderer(${makeNPageIdStr(this.props.pageInfo)}): PageInfo from InkStorage, pageInfo=${makeNPageIdStr(pageInfo)}`);
    // this.onLivePenPageInfo(event);
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, dot:NeoDot}} event
   */

  onLivePenMove = (event: IPenToViewerEvent) => {
    if (this.renderer) {
      this.renderer.pushLiveDot(event);
    }
  }


  onLivePenMove_byStorage = (event: IPenToViewerEvent) => {
    // if (this.renderer) {
    //   this.renderer.pushLiveDot_byStorage(event);
    // }
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke, section:number, owner:number, book:number, page:number}} event
   */
  onLivePenUp = (event: IPenToViewerEvent) => {
    // console.log("Pen Up");
    if (this.renderer) {
      this.renderer.closeLiveStroke(event);
    }
  }

  onLivePenUp_byStorage = (event: IPenToViewerEvent) => {
    const { section, owner, book, page } = event;
    const pageInfo = { section, owner, book, page } as IPageSOBP;

    if (this.renderer && isSamePage(this.props.pageInfo, pageInfo)) {
      // console.log(`Renderer(${makeNPageIdStr(this.props.pageInfo)}): onLivePenUp, pageInfo=${makeNPageIdStr(pageInfo)}  ==> ADDED`);
      this.renderer.closeLiveStroke_byStorage(event);
    }
    // else {
    //   console.log(`Renderer(${makeNPageIdStr(this.props.pageInfo)}): onLivePenUp, pageInfo=${makeNPageIdStr(pageInfo)}  ==> DISCARDED`);
    // }

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
    const { pens, viewFit, fixed } = this.props;
    const { scale, width, height } = this.propsSize;
    const { section, owner, book, page } = this.props.pageInfo;
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
      zIndex: 10,
      overflow: "hidden",
    }

    const inkContainerInfo: CSSProperties = {
      position: "absolute",
      zoom: zoom,
      left: this.props.position.offsetX / zoom,
      top: this.props.position.offsetY / zoom,
      zIndex: 9,
      overflow: "hidden",
    }


    const inkCanvas: CSSProperties = {
      position: "absolute",
      zoom: 1,
      left: 0,
      top: 0,
      zIndex: 10,
    }


    // if (fixed) {
    //   inkContainerDiv = {
    //     position: "absolute",
    //     zoom: zoom,
    //     left: 0,
    //     top: 0,
    //     right: 0,
    //     height: "100%",
    //     zIndex: 10,
    //     overflow: "hidden",
    //   };

    //   inkCanvas = {
    //     position: "absolute",
    //     zoom: 1,
    //     left: 0,
    //     top: 0,
    //     right: 0,
    //     height: "100%",
    //     zIndex: 10,
    //   }
    // }

    // console.log(`THUMB, renderer viewFit = ${this.props.viewFit}`);

    const shadowStyle: CSSProperties = {
      color: "#a20",
      textShadow: "-1px 0 2px #fff, 0 1px 2px #fff, 1px 0 2px #fff, 0 -1px 2px #fff",
    }

    return (
      <div id="pen-based-renderer" ref={this.setMainDivRef} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        {/* <Paper style={{ height: this.size.height, width: this.size.width }}> */}
        < div id={`${this.props.parentName}-fabric_container`} style={inkContainerDiv} >
          <canvas id={this.canvasId} width={cssWidth} height={cssHeight} style={inkCanvas} ref={this.setCanvasRef} />
        </div >
        {/* </Paper> */}

        < div id={`${this.props.parentName}-info`} style={inkContainerDiv} >
          <br /> &nbsp; &nbsp;

          <Typography style={{ ...shadowStyle, fontSize: 16 }}>PenRenderer </Typography>

          <br /> &nbsp; &nbsp;
          <Typography style={{ ...shadowStyle, fontSize: 10 }}>Page:</Typography>
          <Typography style={{ ...shadowStyle, fontSize: 14, }}> {makeNPageIdStr(this.props.pageInfo)} </Typography>


          <br /> &nbsp; &nbsp;
          <Typography style={{ ...shadowStyle, fontSize: 10 }}>Base:</Typography>
          <Typography style={{ ...shadowStyle, fontSize: 14, fontStyle: "initial" }}> {makeNPageIdStr(this.props.basePageInfo)} </Typography>

          <br /> &nbsp; &nbsp;
          <Typography style={{ ...shadowStyle, fontSize: 10 }}>pdfPageNo:</Typography>
          <Typography style={{ ...shadowStyle, fontSize: 14, fontStyle: "initial" }}> {this.props.pdfPageNo} </Typography>

        </div >
      </div >
    );
  }
}

// const AdaptiveWithDetector = PenBasedRenderer_module;

// const PenBasedRenderer = (props: Props) => {
//   return (
//     <React.Fragment>
//       <AdaptiveWithDetector {...props} />
//     </React.Fragment>
//   )
// }

export default PenBasedRenderer;