import React from "react";
import {connect} from "react-redux";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { Typography } from "@material-ui/core";

import { IRenderWorkerOption } from "./RenderWorkerBase";
import PenBasedRenderWorker from "./PenBasedRenderWorker";

import { IBrushType, PenEventName, PageEventName, PLAYSTATE, ZoomFitEnum } from "nl-lib/common/enums";
import { IPageSOBP, ISize } from "nl-lib/common/structures";
import { callstackDepth, isSamePage, isSameNcode, makeNPageIdStr, makeNCodeIdStr, uuidv4 } from "nl-lib/common/util";

import { INeoSmartpen, IPenToViewerEvent } from "nl-lib/common/neopen";
import { MappingStorage } from "nl-lib/common/mapper";
import { DefaultPlateNcode, DefaultPUINcode } from "nl-lib/common/constants";
import { InkStorage } from "nl-lib/common/penstorage";
import { isPUI } from "nl-lib/common/noteserver";

import { setCalibrationData } from 'GridaBoard/store/reducers/calibrationDataReducer';
import { store } from "GridaBoard/client/Root";
import GridaDoc from "GridaBoard/GridaDoc";

/**
 * Properties
 */
interface Props { // extends MixedViewProps {
  baseScale?: number,

  pdfSize: { width: number, height: number };

  onNcodePageChanged: (arg: IPageSOBP) => void;

  onCanvasPositionChanged: (arg: { offsetX: number, offsetY: number, zoom: number }) => void;

  position: { offsetX: number, offsetY: number, zoom: number },

  zoom: number,

  viewSize: ISize;

  fixed?: boolean,

  playState?: PLAYSTATE,

  fitMargin?: number,

  viewFit?: ZoomFitEnum,

  pens: INeoSmartpen[],

  rotation: number,

  isMainView: boolean,

  pageInfo: IPageSOBP,

  fromStorage: boolean,

  noInfo: boolean,

  parentName: string,

  basePageInfo: IPageSOBP,
  pdfPageNo: number,
  renderCountNo: number,

  calibrationData: any,
  setCalibrationData2: any,
  calibrationMode: boolean,

  isBlankPage: boolean,
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
  pens: INeoSmartpen[],
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

  _renderer: PenBasedRenderWorker;
  // pageInfo = nullNcode();


  get renderer() {
    if (!this._renderer) {
      this._renderer = this.initRenderer(this.viewSize, this.pdfSize as ISize);
      const transform = MappingStorage.getInstance().getNPageTransform(this.props.pageInfo);
      const r = this._renderer;
      r.setTransformParameters(transform.h, this.pdfSize);
    }

    return this._renderer;
  }

  pdfSize: { scale: number, width: number, height: number } = { scale: 1, width: 1, height: 1 };
  viewSize: ISize = { width: 0, height: 0 };

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

  subscribedPens = [] as INeoSmartpen[];

  constructor(props: Props) {
    super(props);

    const { playState, fitMargin, viewSize, fixed, pdfSize, viewFit } = props;
    this.inkStorage = InkStorage.getInstance();

    this.canvasId = uuidv4();
    // this.canvasId = "fabric canvas";


    if (fixed !== undefined) this.fixed = fixed;
    if (fitMargin !== undefined) this.fitMargin = fitMargin;
    if (playState !== undefined) this.state.playState = playState;
    if (viewFit !== undefined) this.state.viewFit = viewFit;

    this.viewSize = { ...viewSize };
    this.pdfSize = { ...pdfSize, scale: 1 };
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
  private subscribePenEvent = (pen: INeoSmartpen) => {
    if (!this.subscribedPens.includes(pen)) {
      pen.addEventListener(PenEventName.ON_PEN_DOWN, this.onLivePenDown);
      pen.addEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo);
      pen.addEventListener(PenEventName.ON_PEN_MOVE, this.onLivePenMove);
      pen.addEventListener(PenEventName.ON_PEN_UP, this.onLivePenUp);
      pen.addEventListener(PenEventName.ON_HOVER_MOVE, this.onLiveHoverMove);
      pen.addEventListener(PenEventName.ON_PEN_HOVER_PAGEINFO, this.onLiveHoverPageInfo);
      pen.addEventListener(PenEventName.ON_PEN_UP_FOR_HOMOGRAPHY, this.setTransformParametersForPen);

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
  private unsubscribePenEvent = (pen: INeoSmartpen) => {
    if (this.subscribedPens.includes(pen)) {
      pen.removeEventListener(PenEventName.ON_PEN_DOWN, this.onLivePenDown);
      pen.removeEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo);
      pen.removeEventListener(PenEventName.ON_PEN_MOVE, this.onLivePenMove);
      pen.removeEventListener(PenEventName.ON_PEN_UP, this.onLivePenUp);
      pen.removeEventListener(PenEventName.ON_HOVER_MOVE, this.onLiveHoverMove);
      pen.removeEventListener(PenEventName.ON_PEN_UP_FOR_HOMOGRAPHY, this.setTransformParametersForPen);

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
  private makeUpPenEvents = (pens: INeoSmartpen[]) => {
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
    const { pens, pdfSize, baseScale } = this.props;
    // console.log(`PenBasedRenderer: size ${this.pdfSize.width}, ${this.pdfSize.height}`);
    // console.log("Renderer Inited");

    this.pdfSize = { scale: 1, ...pdfSize };
    // this.initRenderer(this.props.viewSize, this.pdfSize);

    this.makeUpPenEvents(pens);

    if (this.props.fromStorage) {
      // console.log(`Renderer(${this.props.parentName}): componentDidMount`);
      this.subScriptStorageEvent();
    }

    if (this.renderer && !this.props.calibrationMode) {
      this.inkStorage.addEventListener(PageEventName.PAGE_CLEAR, this.removeAllCanvasObjectOnActivePage, null);
      this.inkStorage.addEventListener(PenEventName.ON_ERASER_MOVE, this.renderer.redrawStrokes, null);
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

    if (this.props.isBlankPage !== nextProps.isBlankPage) {
      if (nextProps.isBlankPage) {
        this.renderer.canvasFb.setBackgroundColor('rgba(255,255,255,1)', null);
      } else {
        this.renderer.canvasFb.setBackgroundColor('rgba(255,255,255,0.1)', null);
      }
    }

    if ((this.props.rotation !== nextProps.rotation) && isSamePage(this.props.basePageInfo, nextProps.basePageInfo)) {
      //회전 버튼을 누를 경우만 들어와야 하는 로직, 회전된 pdf를 로드할 때는 들어오면 안됨
      //로드할 경우에는 this.props의 basePageInfo가 nullNCode로 세팅돼있기 때문에 들어오지 않음

      this.renderer.setRotation(nextProps.rotation, this.pdfSize);

      // const ctx = this.canvas.getContext('2d');
      // ctx.rotate(180 * Math.PI / 180);

      if (this.props.isMainView) {
        this.renderer.rotate(nextProps.pageInfo);
      }

      this.renderer.redrawStrokes(nextProps.pageInfo);

      //이건 pen viewer의 실제 rotate 처리
      const tmp = nextProps.pdfSize.width;
      nextProps.pdfSize.width = nextProps.pdfSize.height;
      nextProps.pdfSize.height = tmp;

      this.renderer.onPageSizeChanged(nextProps.pdfSize);
      this.pdfSize = { ...nextProps.pdfSize, scale: this.pdfSize.scale };
      ret_val = true;
    }

    if (nextProps.viewSize.width !== this.viewSize.width || nextProps.viewSize.height !== this.viewSize.height) {
      this.viewSize = { ...nextProps.viewSize };
      // console.log(`VIEW SIZE${callstackDepth()} WIDTH/HEIGHT:  ${this.viewSize.width}, ${this.viewSize.height}`);
      this.onViewResized(this.viewSize);
      ret_val = true;
    }

    if (this.props.viewFit !== nextProps.viewFit) {
      this.viewSize = { ...nextProps.viewSize };
      this.renderer._opt.viewFit = nextProps.viewFit;
      this.onViewResized(this.viewSize);
      ret_val = true;
    }

    if (!isSamePage(nextProps.pageInfo, this.props.pageInfo)) {
      const pageInfo = nextProps.pageInfo;

      console.log("`VIEW SIZE        PAGE CHANGE 0");

      if (this.renderer && !this.props.calibrationMode) {
        console.log(`VIEW SIZE PAGE CHANGE 1: ${makeNPageIdStr(pageInfo)}`);

        if (isSameNcode(nextProps.pageInfo, DefaultPUINcode) || isPUI(nextProps.pageInfo)) { 
          //1. PUI에 쓸 경우 페이지가 바뀌는 것을 막기 위함
          return;
        }

        this.renderer._opt.rotation = nextProps.rotation;
        const transform = MappingStorage.getInstance().getNPageTransform(pageInfo);
        this.renderer.setTransformParameters(transform.h, this.pdfSize);

        if (isSameNcode(nextProps.pageInfo, DefaultPlateNcode)){
          return;
        }

        this.renderer.changePage(pageInfo, nextProps.pdfSize, false);

        this.renderer.onPageSizeChanged(nextProps.pdfSize);
        this.pdfSize = { ...nextProps.pdfSize, scale: this.pdfSize.scale };

        ret_val = true;

      }

      if (this.props.calibrationMode) {
        const transform = MappingStorage.getInstance().getNPageTransform(pageInfo);
        this.renderer.setTransformParameters(transform.h, this.pdfSize);
        ret_val = true;
      }
    }

    const pageInfo = nextProps.pageInfo;

    if (this.props.pdfPageNo !== nextProps.pdfPageNo) { //빈 ncode page만 첫 load 할 때 worker에 pageInfo를 set해주기 위함
      this.renderer.pageInfo = { ...pageInfo };
    }

    if (pageInfo.section !== -1 && (nextProps.pdfSize.width !== this.props.pdfSize.width || nextProps.pdfSize.height !== this.props.pdfSize.height)) {
      console.error("`VIEW SIZE (comp) page size change");
      this.renderer.onPageSizeChanged(nextProps.pdfSize);
      this.pdfSize = { ...nextProps.pdfSize, scale: this.pdfSize.scale };
      ret_val = true;
    }

    if (this.props.zoom !== nextProps.zoom) {
      this.renderer.setCanvasZoomByButton(nextProps.zoom);
    }

    if (this.props.renderCountNo !== nextProps.renderCountNo) {
      if (this.renderer) {
        this.renderer.changePage(pageInfo, nextProps.pdfSize, false);
        this.renderer.onPageSizeChanged(nextProps.pdfSize);
        this.pdfSize = { ...nextProps.pdfSize, scale: this.pdfSize.scale };
        const transform = MappingStorage.getInstance().getNPageTransform(pageInfo);
        this.renderer.setTransformParameters(transform.h, this.pdfSize);
        ret_val = true;
      }
    }

    return ret_val;
  }


  initRenderer(viewSize: ISize, pageSize: ISize) {
    /** @type {{width:number, height:number}} */
    console.log(`VIEW SIZE${callstackDepth()} initRenderer:   view(${viewSize.width}, ${viewSize.height})  page(${pageSize.width}, ${pageSize.height})`);

    let bgColor = 'rgba(255,255,255,0.1)';
    if (this.props.isBlankPage) {
      bgColor = 'rgba(255,255,255,1)';
    }

    const options: IRenderWorkerOption = {
      canvasId: this.canvasId,
      canvas: this.canvas,
      // position: this.props.position,
      viewSize,
      pageSize,
      mouseAction: !this.fixed,
      viewFit: this.state.viewFit,
      fitMargin: this.fitMargin,
      onCanvasPositionChanged: this.props.onCanvasPositionChanged,
      rotation: this.props.rotation,
      autoFocus: true,
      shouldDisplayGrid: true,
      bgColor: bgColor,
    };

    const renderer = new PenBasedRenderWorker(options);
    return renderer;
  }

  onViewResized = ({ width, height }) => {
    const rect = { x: 0, y: 0, width, height };
    const scale = this.pdfSize.scale;

    // this.size = this.getSize(scale, rect);

    if (this.renderer) {
      this.renderer.onViewSizeChanged({ width, height });
    }
  }


  /**
   * @override
   * @public
   */
  componentWillUnmount() {
    this.unsubscribeAllPensEvent();
    if (this.props.fromStorage) this.unsubScriptStorageEvent();

    if (this.renderer) {
      this.renderer.prepareUnmount();

      this.inkStorage.removeEventListener(PageEventName.PAGE_CLEAR, this.removeAllCanvasObjectOnActivePage);
      this.inkStorage.removeEventListener(PenEventName.ON_ERASER_MOVE, this.renderer.redrawStrokes);
    }
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

    if (this.props.calibrationMode) {
      return;
    }
    /** pdf pageNo를 바꿀 수 있게, container에게 전달한다. */
    if (this.props.onNcodePageChanged) {
      this.renderer.registerPageInfoForPlate(event);//hover page info를 거치지 않고 바로 page info로 들어오는 경우(빨리 찍으면 hover 안들어옴)
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
      this.renderer.pushLiveDot(event, this.props.rotation);
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
    if (this.props.calibrationMode) {
      this.onCalibrationUp(event);
    }
    else if (this.renderer) {
      this.renderer.closeLiveStroke(event);
    }
  }

  onCalibrationUp = (event: IPenToViewerEvent) => {
    let i;

    const penCalibrationPoint = event.pen.calibrationPoint;

    const pts = event.pen.calibrationData.points;
    const len = pts.length;

    // 점 수가 너무 적다
    if (len < 2) return;

    let x_min = 99999,
        y_min = 99999,
        x_max = -99999,
        y_max = -99999;

    for (i = 0; i < len; i++) {
      x_min = Math.min(x_min, pts[i].x);
      x_max = Math.max(x_max, pts[i].x);

      y_min = Math.min(y_min, pts[i].y);
      y_max = Math.max(y_max, pts[i].y);
    }

    const x_range = x_max - x_min;
    const y_range = y_max - y_min;

    // 점이 너무 넓게 들어왔다.
    if (x_range > 2 || y_range > 2) {
      event.pen.calibrationData = {
        section: -1,
        owner: -1,
        book: -1,
        page: -1,
        points: new Array(0),
      };
      return;
    }

    const nu = {x: (x_max + x_min) / 2, y: (y_max + y_min) / 2}

    const clicked_point = {
      section: penCalibrationPoint.section,
      owner: penCalibrationPoint.owner,
      book: penCalibrationPoint.book,
      page: penCalibrationPoint.page,
      nu: {x: nu.x, y: nu.y},
    };

    const { section, owner, book, page } = event;
    const pageInfo = { section, owner, book, page } as IPageSOBP;
    const { setCalibrationData2 } = this.props;

    const cali = {
      section : section,
      owner: owner,
      book: book,
      page: page,
      nu: {x: clicked_point.nu.x, y: clicked_point.nu.y},
    };

    setCalibrationData2(cali);

    event.pen.calibrationData = {
      section: -1,
      owner: -1,
      book: -1,
      page: -1,
      points: new Array(0),
    };
  }

  onLivePenUp_byStorage = (event: IPenToViewerEvent) => {
    const { section, owner, book, page } = event;
    const pageInfo = { section, owner, book, page } as IPageSOBP;
    
    const activePageNo = store.getState().activePage.activePageNo;
    const activePage = GridaDoc.getInstance().getPageAt(activePageNo);
    const activePageInfo = activePage.pageInfos[0];//plate에 쓰는 경우 plate의 pageInfo가 아닌 실제 pageInfo가 필요

    let isPlate = false;
    if (isSamePage(activePageInfo, this.props.pageInfo) && isSameNcode(DefaultPlateNcode, pageInfo)) {
      isPlate = true;
    }

    if (this.renderer && (isSamePage(this.props.pageInfo, pageInfo) || isPlate)) {
      // console.log(`Renderer(${makeNPageIdStr(this.props.pageInfo)}): onLivePenUp, pageInfo=${makeNPageIdStr(pageInfo)}  ==> ADDED`);
      this.renderer.closeLiveStroke_byStorage(event, pageInfo);
    }
    // else {
    //   console.log(`Renderer(${makeNPageIdStr(this.props.pageInfo)}): onLivePenUp, pageInfo=${makeNPageIdStr(pageInfo)}  ==> DISCARDED`);
    // }

  }

  removeAllCanvasObjectOnActivePage = (pageInfo: IPageSOBP) => {
    if (this.renderer && isSamePage(this.props.pageInfo, pageInfo)) {
      this.renderer.removeAllCanvasObject();
    }
  }

  onLiveHoverPageInfo = (event: IPenToViewerEvent) => {
    if (this.renderer) {
      this.renderer.registerPageInfoForPlate(event);
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
  }

  setTransformParametersForPen = (pen: INeoSmartpen) => {
    pen.h = this.renderer._opt.h;
    pen.h_origin = this.renderer.h;
  }

  render() {
    let { zoom } = this.props.position;

    zoom = 1;

    const inkContainerDiv: CSSProperties = {
      position: "absolute",
      zoom: zoom,
      left: this.props.position.offsetX / zoom,
      top: this.props.position.offsetY / zoom,
      zIndex: 10,
      overflow: "hidden",
    }

    const inkCanvas: CSSProperties = {
      position: "absolute",
      zoom: zoom,
      left: 0,
      top: 0,
      zIndex: 10,
    }

    const shadowStyle: CSSProperties = {
      color: "#a20",
      textShadow: "-1px 0 2px #fff, 0 1px 2px #fff, 1px 0 2px #fff, 0 -1px 2px #fff",
    }

    return (
      <div id="pen-based-renderer" ref={this.setMainDivRef} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
        {/* <Paper style={{ height: this.size.height, width: this.size.width }}> */}

        < div id={`${this.props.parentName}-fabric_container`} style={inkContainerDiv} >
          <canvas id={this.canvasId} style={inkCanvas} ref={this.setCanvasRef} />
        </div >

        {!this.props.noInfo ?
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
          : ""}
      </div >
    );
  }
}

const mapStateToProps = (state) => ({
    calibrationData: state.calibrationDataReducer.calibrationData,
    calibrationMode: state.calibration.calibrationMode
});

const mapDispatchToProps = (dispatch) => ({
  setCalibrationData2: cali => setCalibrationData(cali),
});

export default connect(mapStateToProps, mapDispatchToProps)(PenBasedRenderer);

// export default PenBasedRenderer;