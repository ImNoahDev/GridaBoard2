import "../../types";
import { fabric } from "fabric";
import { PLAYSTATE, ZoomFitEnum } from "./RenderWorkerBase";
import { InkStorage } from "../..";
import { PATH_THICKNESS_SCALE, drawPath } from "./DrawCurves";
import { NCODE_TO_SCREEN_SCALE } from "../../constants";
import { paperInfo } from "../../noteserver/PaperInfo";
import { ILineOptions, IRectOptions } from "fabric/fabric-impl";

const timeTickDuration = 20; // ms
const DISABLED_STROKE_COLOR = "rgba(0, 0, 0, 0.1)";
// const INVISIBLE_STROKE_COLOR = "rgba(255, 255, 255, 0)";
// const INCOMPLETE_STROKE_COLOR = "rgba(255, 0, 255, 0.4)";
// const CURRENT_POINT_STROKE_COLOR = "rgba(255, 255, 255, 1)";





const STROKE_OBJECT_ID = "ns";
const GRID_OBJECT_ID = "g";

export default class StorageRenderWorker {
  /**
   *
   * @param {{canvasName:string, storage:InkStorage, viewFit:ZoomFitEnum, autoStop:boolean, playTimeHandler:function, playStateHandler:function, }} options
   */

  viewFit;

  /** @type {InkStorage} */
  storage;

  nu_to_pu_scale = NCODE_TO_SCREEN_SCALE;
  offset_x = 0;
  offset_y = 0;

  initialSize = { width: 0, height: 0 };

  currSize = { width: 0, height: 0 };

  livePaths = {};

  surfaceInfo = {
    section: 3,
    owner: 27,
    book: 168,
    page: 1,

    Xmin: 3.12,
    Ymin: 3.12,
    Xmax: 91.68,
    Ymax: 128.36,
    Mag: 1,
  }

  scrollAnimateInterval = null;

  // 재생 시간과 관련된 변수

  playingTimeHandler;
  playStateHandler;


  /**
   * relative time
   * absolute time(unix ms) = playingTime + startTime_whole
   */
  playingTime = -1;

  /**
   * absolute time(unix ms)
   * relative time = absolute time - this.startTime_whole
   */
  startTime_page = 0;
  endTime_page = 0;

  startTime_whole = 0;
  endTime_whole = 0;

  /**
   * the page info now being played
   */
  rel_auto_play_endtime = 0;
  autoStop;
  //
  canvasName;
  canvas = null;
  frameconfig = 1;
  bgcolor = 0;
  bgurl = "";
  strokWidth;
  strokHeight = this.initialSize.height;
  lineScale = [1, 3, 5, 7, 10];
  pathArray = []; // Rendering Path

  scaleX = 1;
  scaleY = 1;
  // for replay
  renderTime = 0;
  replaySpeed = 1;
  dotArray = [];
  strokes = null; // neoink format stroke
  backgroundImage = null;

  timer = null;

  timeStr = "";
  pageNumber = 0;

  rect = { x: 0, y: 0, width: 800, height: 1000 };

  scale;

  seekCallback;

  tempPath;

  tempPath_disabled;

  constructor(options) {
    const { canvasName, viewFit, storage, playTimeHandler, playStateHandler, autoStop } = options;

    if (!(storage instanceof InkStorage)) {
      console.error("storage is not an instance of InkStorage");
    }

    this.viewFit = viewFit;

    /** @type {InkStorage} */
    this.storage = storage;

    /** @type {number} */
    // this.ncode_to_screen_scale = NCODE_TO_SCREEN_SCALE;

    this.nu_to_pu_scale = NCODE_TO_SCREEN_SCALE;
    this.offset_x = 0;
    this.offset_y = 0;

    /** @type {{width:number, height:number}} */
    this.initialSize = { width: 0, height: 0 };

    /** @type {{width:number, height:number}} */
    this.currSize = { width: 0, height: 0 };

    /** @type {Object.<string, {stroke:NeoStroke, path:fabric.Path}>} */
    this.livePaths = {};

    /** @type {{section?:number, owner?:number, book?:number, page?:number, Xmin:number, Ymin:number, Xmax:number, Ymax:number, Mag?:number}} */
    this.surfaceInfo = {
      section: 3,
      owner: 27,
      book: 168,
      page: 1,

      Xmin: 3.12,
      Ymin: 3.12,
      Xmax: 91.68,
      Ymax: 128.36,
      Mag: 1,
    }

    this.scrollAnimateInterval = null;

    // 재생 시간과 관련된 변수

    this.playingTimeHandler = playTimeHandler;
    this.playStateHandler = playStateHandler;


    /**
     * relative time
     * absolute time(unix ms) = playingTime + startTime_whole
     */
    this.playingTime = -1;

    /**
     * absolute time(unix ms)
     * relative time = absolute time - this.startTime_whole
     */
    this.startTime_page = 0;
    this.endTime_page = 0;

    this.startTime_whole = 0;
    this.endTime_whole = 0;

    /**
     * the page info now being played
     */
    this.rel_auto_play_endtime = 0;
    this.autoStop = autoStop;
    //
    this.canvasName = canvasName;
    this.canvas = null;
    this.frameconfig = 1;
    this.bgcolor = 0;
    this.bgurl = "";
    this.strokWidth = this.initialSize.width;
    this.strokHeight = this.initialSize.height;
    this.lineScale = [1, 3, 5, 7, 10];
    this.pathArray = []; // Rendering Path

    this.scaleX = 1;
    this.scaleY = 1;
    // for replay
    this.renderTime = 0;
    this.replaySpeed = 1;
    this.dotArray = [];
    this.strokes = null; // neoink format stroke
    this.backgroundImage = null;

    this.timer = null;

    this.timeStr = "";
    this.pageNumber = 0;

    this.rect = { x: 0, y: 0, width: 800, height: 1000 };
  }



  //step 1: canvas set size and background image
  setCanvas = (size, bgurl) => {
    this.bgurl = bgurl;
    this.initialSize = { ...size };
    this.currSize = { ...size };
    this.canvas = new fabric.Canvas(this.canvasName, {
      backgroundColor: "rgb(255,255,255)",
      // selectionColor: 'blue',
      selection: false,
      controlsAboveOverlay: true,
      // centeredScaling: true,
      // allowTouchScrolling: true,
      selectionLineWidth: 4,
      width: size.width,
      height: size.height,
    });

    const canvas = this.canvas;

    canvas.on('mouse:down', this.onCanvasMouseDown);
    canvas.on('mouse:move', this.onCanvasMouseMove);
    canvas.on('mouse:up', this.onCanvasMousUp);
    canvas.on('mouse:wheel', this.onCanvasMouseWheel);
  }

  drawPageLayout = () => {
    const canvas = this.canvas;

    // 지우기
    if (this.canvas) {
      const objects = this.canvas.getObjects();
      const strokes = objects.filter(obj => obj.objType === GRID_OBJECT_ID);

      strokes.forEach((obj) => {
        this.canvas.remove(obj);
      });
    }

    // 그리기
    const paperWidth = this.surfaceInfo.Xmax - this.surfaceInfo.Xmin;
    const paperHeight = this.surfaceInfo.Ymax - this.surfaceInfo.Ymin;

    const size = {
      width: paperWidth * this.nu_to_pu_scale,
      height: paperHeight * this.nu_to_pu_scale,
    };

    // console.log(`Grid: scale=${this.nu_to_pu_scale} (width, height)=(${size.width}, ${size.height})`);

    const ratio = 1;

    const rect = new fabric.Rect({
      width: size.width * ratio - 5,
      height: size.height * ratio - 5,
      strokeWidth: 5,
      stroke: 'rgba(0,0,0,1)',
      fill: 'rgb(100,100,200, 0.1)',
      left: size.width * (1 - ratio) * 0.5,
      top: size.height * (1 - ratio) * 0.5,
      // lockMovementX: true,
      // lockMovementY: true,
      selectable: false,
      objType: GRID_OBJECT_ID,
    } as IRectOptions);

    canvas.add(rect);

    for (let x = 0; x < size.width; x += 10) {
      const line = new fabric.Line([x, 0, x, size.height], {
        strokeWidth: 0.5,
        stroke: "rgba(0,0,0,0.1)",
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        objType: GRID_OBJECT_ID,
      } as ILineOptions);

      canvas.add(line);
    }


    for (let y = 0; y < size.height; y += 10) {
      const line = new fabric.Line([0, y, size.width, y], {
        strokeWidth: 0.5,
        stroke: "rgba(0,0,0,0.1)",
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        objType: GRID_OBJECT_ID,
      } as ILineOptions);

      canvas.add(line);
    }

  }

  /**
   *
   * @param {Object} opt
   */
  onCanvasMouseDown = (opt) => {
    const canvas = this.canvas;

    const evt = opt.e;
    if (evt.altKey === true) {
      canvas.isDragging = true;
      canvas.selection = false;
      canvas.lastPosX = evt.clientX;
      canvas.lastPosY = evt.clientY;
    }
  }

  /**
   *
   * @param {Object} opt
   */
  onCanvasMouseMove = (opt) => {
    const canvas = this.canvas;

    if (canvas.isDragging) {
      const e = opt.e;
      // console.log(`Point ${e.clientX}, ${e.clientY}`);
      const vpt = canvas.viewportTransform;
      vpt[4] += e.clientX - canvas.lastPosX;
      vpt[5] += e.clientY - canvas.lastPosY;

      this.scrollBoundaryCheck();

      // canvas.setViewportTransform(vpt);
      canvas.requestRenderAll();
      canvas.lastPosX = e.clientX;
      canvas.lastPosY = e.clientY;

      // this.canvasBoundaryCheck();
    }
  }



  /**
   *
   * @param {Object} opt
   */
  onCanvasMousUp = (opt) => {
    const canvas = this.canvas;


    // on mouse up we want to recalculate new interaction
    // for all objects, so we call setViewportTransform
    canvas.setViewportTransform(canvas.viewportTransform);
    canvas.isDragging = false;
    canvas.selection = false;


    // let vpt = canvas.viewportTransform;
    // console.log(vpt);
  }

  /**
   *
   * @param {Object} opt
   */
  onCanvasMouseWheel = (opt) => {
    const canvas = this.canvas;

    const delta = opt.e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;

    this.setCanvasZoom(zoom, opt);
  }


  scrollBoundaryCheck = () => {

    const canvas = this.canvas;
    const zoom = canvas.getZoom();

    // http://fabricjs.com/fabric-intro-part-5#pan_zoom
    const vpt = canvas.viewportTransform;

    if (vpt[4] >= 0) {
      vpt[4] = 0;
    }
    else if (vpt[4] < canvas.getWidth() - this.currSize.width * zoom) {
      vpt[4] = canvas.getWidth() - this.currSize.width * zoom;
    }

    if (vpt[5] >= 0) {
      vpt[5] = 0;
    }
    else if (vpt[5] < canvas.getHeight() - this.currSize.height * zoom) {
      vpt[5] = canvas.getHeight() - this.currSize.height * zoom;
    }

    if (zoom < 1) {
      vpt[4] = (this.currSize.width - this.currSize.width * zoom) / 2;
      vpt[5] = (this.currSize.height - this.currSize.height * zoom) / 2;
    }
  }

  /**
   * @param {number} zoom
   * @param {Object} opt
   */
  setCanvasZoom = (zoom, opt) => {
    const canvas = this.canvas;

    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;

    if (opt) canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    else canvas.setZoom(zoom);

    opt.e.preventDefault();
    opt.e.stopPropagation();

    this.scrollBoundaryCheck();
  }


  /**
   *
   * @param {{x:number, y:number}} dot
   */
  focusToDot = (dot) => {
    const margin_to_go_ratio = 0.25;
    const canvas_xy = this.getPdfXY(dot);
    const screen_xy = this.getScreenXY(canvas_xy);

    let dx = 0, dy = 0;
    let shouldScroll = false;

    const canvas = this.canvas;
    const vpt = canvas.viewportTransform;
    const offset_x = vpt[4];
    const offset_y = vpt[5];

    if (screen_xy.x < 0) {
      // scroll to left
      const target = this.currSize.width * margin_to_go_ratio;
      dx = target - screen_xy.x;
      shouldScroll = true;
    }

    if (screen_xy.y < 0) {
      // scroll to top
      const target = this.currSize.height * margin_to_go_ratio;
      dy = target - screen_xy.y;
      shouldScroll = true;
    }

    if (screen_xy.x > this.currSize.width) {
      // scroll to right
      const target = this.currSize.width * (1 - margin_to_go_ratio);
      dx = target - screen_xy.x;
      shouldScroll = true;
    }

    if (screen_xy.y > this.currSize.height) {
      // scroll to bottom
      const target = this.currSize.height * (1 - margin_to_go_ratio);
      dy = target - screen_xy.y;
      shouldScroll = true;
    }

    if (shouldScroll) {

      const new_offset_x = offset_x + dx;
      const new_offset_y = offset_y + dy;

      this.scrollCanvasToPoint({ x: new_offset_x, y: new_offset_y }, true);
    }
  }

  /**
   *
   * @param {{x:number, y:number}} point
   * @param {boolean} animate
   */
  scrollCanvasToPoint = (point, animate) => {
    const canvas = this.canvas;
    const vpt = canvas.viewportTransform;

    if (animate) {
      if (this.scrollAnimateInterval) {
        clearInterval(this.scrollAnimateInterval);
        this.scrollAnimateInterval = null;
      }
      let x0 = vpt[4];
      let y0 = vpt[5];
      const x1 = point.x;
      const y1 = point.y;

      const div = 10;
      const step_x = (x1 - x0) / div;
      const step_y = (y1 - y0) / div;
      let count = 0;

      this.scrollAnimateInterval = setInterval(() => {
        x0 += step_x;
        y0 += step_y;
        vpt[4] = x0;
        vpt[5] = y0;
        canvas.requestRenderAll();

        count++;
        if (count === div) {
          clearInterval(this.scrollAnimateInterval);
          this.scrollAnimateInterval = null;
          canvas.setViewportTransform(canvas.viewportTransform);
        }
      }, 20);
    }
    else {
      vpt[4] = point.x;
      vpt[5] = point.y;
      this.scrollBoundaryCheck();
      canvas.requestRenderAll();
      canvas.setViewportTransform(canvas.viewportTransform);
    }

  }



  /**
   *
   * @param {{x:number, y:number, f?:number}} ncodeXY
   */
  getPdfXY = (ncodeXY) => {
    const { x, y, f } = ncodeXY;
    const { Xmin, Ymin } = this.surfaceInfo;

    const scale = this.nu_to_pu_scale;

    const cx = (x - Xmin) * scale + this.offset_x;
    const cy = (y - Ymin) * scale + this.offset_y;

    return { x: cx, y: cy, f };
  }


  /**
 *
 * @param {{x:number, y:number, f?:number}} ncodeXY
 */
  getPdfXY_scaled = (ncodeXY) => {
    const { x, y, f } = ncodeXY;
    const { Xmin, Ymin } = this.surfaceInfo;

    const scale = this.nu_to_pu_scale;

    let cx = (x - Xmin) * scale + this.offset_x;
    let cy = (y - Ymin) * scale + this.offset_y;

    cx *= PATH_THICKNESS_SCALE;
    cy *= PATH_THICKNESS_SCALE;

    return { x: cx, y: cy, f };
  }

  /**
   *
   * @param {{x:number, y:number}} pdfXY
   */
  getScreenXY = (pdfXY) => {
    const { x, y } = pdfXY;

    const canvas = this.canvas;
    const vpt = canvas.viewportTransform;

    const zoom = this.canvas.getZoom();
    const offset_x = vpt[4];
    const offset_y = vpt[5];


    const sx = x * zoom + offset_x;
    const sy = y * zoom + offset_y;

    return { x: sx, y: sy };
  }


  /**
   *
   * @param {{x:number, y:number}} screenXY
   */
  getNcodeXY = (screenXY) => {
    const { x, y } = screenXY;

    const scale = this.nu_to_pu_scale;

    const nx = (x - this.offset_x) / scale;
    const ny = (y - this.offset_y) / scale;

    return { x: nx, y: ny };
  }



  clear = () => {
    this.canvas.clear();
  };

  // resize = size => {
  //   let zoom = size.width / this.initialSize.width;
  //   this.canvas.setZoom(zoom);
  //   this.canvas.setHeight(size.height);
  //   this.canvas.setWidth(size.width);
  // };
  redrawPage = () => {
    // kitty, 임시
    this.resetPathArray();

    const pageInfo = this.storage.getLastPageInfo();
    let strokes = this.storage.getPageStrokes(pageInfo);
    const live_strokes = this.storage.getPageStrokes_live(pageInfo);
    strokes = strokes.concat(live_strokes);

    if (strokes && strokes.length > 0) {
      const page_start_time = strokes[0].dotArray[0].time;

      this.initPathArray(strokes, 1, page_start_time);
    }

    this.drawPageAtTime(-1);
  }

  /**
   *
   * @param {ZoomFitEnum} mode
   * @param {{width:number, height:number}} szPaper
   * @param {number} currViewFit
   */
  calcScaleFactor(mode, szPaper, currViewFit) {
    const szCanvas = this.currSize;
    let scale = 1;
    switch (mode) {
      case ZoomFitEnum.WIDTH:
        scale = szCanvas.width / szPaper.width;

        break;

      case ZoomFitEnum.HEIGHT:
        scale = szCanvas.height / szPaper.height;
        break;

      case ZoomFitEnum.FULL:
        scale = Math.min(szCanvas.width / szPaper.width, szCanvas.height / szPaper.height);
        break;

      case ZoomFitEnum.ACTUAL:
        scale = NCODE_TO_SCREEN_SCALE;
        break;

      default:
        scale = currViewFit;

        break;

    }
    return scale;
  }


  /**
   *
   * @param {number} section
   * @param {number} owner
   * @param {number} book
   * @param {number} page
   * @param {boolean} forceToRefresh
   */
  changePage = (section, owner, book, page, forceToRefresh) => {
    const currPage = this.surfaceInfo;

    if ((!forceToRefresh)
      && (section === currPage.section
        && owner === currPage.owner
        && book === currPage.book
        && page === currPage.page)) return;


    // 페이지 정보와 scale을 조정한다.
    const info = paperInfo.getPaperInfo({ section, owner, book, page });
    if (info) {
      this.surfaceInfo = {
        section, owner, book, page,
        Xmin: info.Xmin, Ymin: info.Ymin, Xmax: info.Xmax, Ymax: info.Ymax,
        Mag: info.Mag
      };

    }
    const szPaper = paperInfo.getPaperSize({ section, owner, book, page });
    this.nu_to_pu_scale = this.calcScaleFactor(this.viewFit, szPaper, this.nu_to_pu_scale);


    // 현재 모든 stroke를 지운다.
    this.drawPageLayout();
    this.resetPathArray();

    // 페이지의 stroke를 그린다
    const pageInfo = { section, owner, book, page };
    const strokes = this.storage.getPageStrokes(pageInfo);

    if (strokes && strokes.length > 0) {
      const page_start_time = strokes[0].dotArray[0].time;
      this.initPathArray(strokes, 1, page_start_time);
    }

    this.drawPageAtTime(-1);
  }

  /**
   * Pen Down이 들어왔다. 그러나 아직 page 정보가 들어오지 않아서,
   * 이 페이지에 붙여야 할 것인가 아니면, 새로운 페이지에 붙여야 할 것인가를 모른다.
   *
   * 렌더러 처리 순서
   * 1) Pen Down: live stroke의 path를 생성
   * 2) Page Info: 페이지를 전환하고, 잉크 스토리지에 있는 이전의 스트로크를 path로 등록한다.
   * 3) Pen Move:
   *      3-1) live stroke path의 처음 나오는 점이면, path를 canvas에 등록한다.
   *      3-2) 두번째 점부터는 path에 append 한다.
   * 4) Pen Up: Live stroke path는 없애고, 잉크스토리지에 2) 이후의 stroke를 받아 path에 추가 등록한다.
   *
   * @public
   * @param {{strokeKey:string, mac:string, time:number, stroke:NeoStroke}} event
   */
  createLiveStroke = (event) => {
    this.livePaths[event.strokeKey] = {
      stroke: event.stroke,
      path: null
    }
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, dot:NeoDot}} event
   */
  pushLiveDot = (event) => {
    const pathData = this.livePaths[event.strokeKey];
    let path = pathData.path;
    const stroke = pathData.stroke;

    if (path) {
      this.canvas.remove(path);
    }

    const color = stroke.color;
    // const zoom = this.canvas.getZoom();
    // const thickness = stroke.thickness * zoom;
    const thickness = stroke.thickness;
    path = this.createPathFromDots(stroke.dotArray, color, thickness);

    if (this.canvas) {
      this.canvas.add(path);
      pathData.path = path;
    }

    const dot = event.dot;
    this.focusToDot(dot);
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke, section:number, owner:number, book:number, page:number}} event
   */
  closeLiveStroke = (event) => {
    const pathData = this.livePaths[event.strokeKey];
    const path = pathData.path;

    if (path) {
      this.pathArray.push(path);
      path.fill = path.color;
      path.stroke = path.color;
    }

    delete this.livePaths[event.strokeKey];
  }

  setReplaySpeed = (speed) => {
    this.replaySpeed = speed;
    // console.log("set speed", speed)
  };

  resize = (size) => {
    const zoom = size.width / this.initialSize.width;
    this.currSize = { ...size };

    this.canvas.setHeight(size.height);
    this.canvas.setWidth(size.width);

    this.canvas.setZoom(zoom);
  };

  stopInterval() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  replayPause = () => {
    this.stopInterval();
  };

  replayStop = () => {
    this.playingTime = 0;
    this.playingTimeHandler(this.playingTime);
    this.drawPageAtTime(this.playingTime);
  };

  replayRewind = () => {
    this.playingTime = this.rewindToPageStart();
    this.playingTimeHandler(this.playingTime);
    this.drawPageAtTime(this.playingTime);
  };

  setTimePoint = (ms) => {
    this.playingTime = ms;
    this.drawPageAtTime(this.playingTime);
    // this.playingTimeHandler(this.playingTime);
  };

  setAutoStop = (sw) => {
    this.autoStop = sw;
  }
  setPage = (page) => {
    this.pageNumber = page.pageNumber;
  };

  rewindToPageStart = () => {
    const newTime = this.startTime_page - this.startTime_whole - 1;
    return newTime;
  };

  setPageStrokes = (page, strokeStream) => {
    const { section, owner, book, pageNumber } = page;
    const strokes_kitty = strokeStream.strokes.filter(
      (s) =>
        s.book === book &&
        s.owner === owner &&
        s.section === section &&
        s.pageNum === pageNumber
    );
    console.log(strokes_kitty);

    let lastStroke, lastDot;

    // 페이지, 시작시간, 끝시각
    const page_start_time = strokes_kitty[0].dotArray[0].time;
    lastStroke = strokes_kitty[strokes_kitty.length - 1];
    lastDot = lastStroke.dotArray[lastStroke.dotArray.length - 1];
    const page_end_time = lastDot.time;

    this.startTime_page = page_start_time;
    this.endTime_page = page_end_time + 1;

    // 전체 필기, 시작시간, 끝시간
    const whole_start_time = strokeStream.strokes[0].dotArray[0].time;
    lastStroke = strokeStream.strokes[strokeStream.strokes.length - 1];
    lastDot = lastStroke.dotArray[lastStroke.dotArray.length - 1];
    const whole_end_time = lastDot.time;

    this.startTime_whole = whole_start_time;
    this.endTime_whole = whole_end_time + 1;

    this.playingTime = -1; // absolute time (unix ms) = playingTime + startTime_whole

    return { strokes_kitty, start_time: page_start_time };
  };

  // Drawing iOS Data Format
  preparePage = (rect, size, scale) => {
    // let strokeStream = this.storage;
    // // console.log("Page data", page, rect, size, scale)
    this.strokWidth = size.width;
    this.strokHeight = size.height;
    this.rect = rect;
    this.scale = scale;
    this.scaleX = (size.width / rect.width / scale);
    this.scaleY = (size.height / rect.height / scale);
    // let strokes = page.strokes;
    // this.strokes = strokes;

    // let stroke_data = this.setPageStrokes(page, strokeStream);
    // let strokes_kitty = stroke_data.strokes_kitty;
    // let page_start_time = stroke_data.start_time;

    // this.resetPathArray();
    // this.initPathArray(strokes_kitty, scale, page_start_time);

    // // this.playingTime = this.rewindToPageStart();
    // this.drawPageAtTime(this.playingTime);
  };

  resetPathArray = () => {
    if (this.canvas) {
      const objects = this.canvas.getObjects();
      const strokes = objects.filter(obj => obj.objType === STROKE_OBJECT_ID);

      strokes.forEach((path) => {
        this.canvas.remove(path);
      });
    }
  };

  initPathArray = (strokes, scale, startTime) => {
    strokes.forEach((stroke) => {
      if (stroke.dotArray.length > 0) {
        const color = stroke.color;
        // const zoom = this.canvas.getZoom();
        // const thickness = stroke.thickness * zoom;
        const thickness = stroke.thickness;

        const path = this.createPathFromDots(stroke.dotArray, color, thickness);
        this.pathArray.push(path);
        if (this.canvas) {
          this.canvas.add(path);
          // console.log("Add Path", path);
        }

      }
    });
  };

  // Draw Dot from Pen
  createPathFromDots = (dots, color, thickness) => {
    // let scale = this.nu_to_pu_scale;

    // console.log("dot Count", dots.length);
    // let rect = this.rect;
    // console.log(rect);

    const pointArray = [];
    dots.forEach((dot) => {
      const pt = this.getPdfXY_scaled(dot);
      pointArray.push(pt);
    });

    // Draw Stroke
    // let color = this.color;
    // let thickness = this.thickness;

    // console.log("Color, thickness", color, thickness);
    // console.log(pointArray.length, pointArray[0]);
    const pathOption = {
      objectCaching: false,

      color: color,
      stroke: color,
      fill: color,
      opacity: 1,
      // strokeWidth: 10,
      originX: 'left',
      originY: 'top',
      selectable: false,

      objType: STROKE_OBJECT_ID,    // neostroke
      // selectable: false,
      //  hasRotatingPoint: false

      // strokeWidth: 2,
      // strokeWidth: tempThickness;
      // strokeLineCap: "round",

      // selectable: false,
      // evented: true,

      // nu_to_pu_scale: scale,
    };

    const strokeThickness = this.nu_to_pu_scale * thickness;
    // console.log(strokeThickness);
    // if ( strokeThickness < 0.5 ) strokeThickness = 0.5;
    const pathData = drawPath(pointArray, strokeThickness);
    // let pathData = drawLinePath(pointArray);
    const path = new fabric.Path(pathData, pathOption);

    return path;
  };

  // Event
  setSeekHandeler = (handler) => {
    this.seekCallback = handler;
  };

  eventHandler = (event) => {
    // console.log(event, event.target.time)
    this.seekCallback(event.target.time + 1);
  };

  /**
   * time tick
   */
  onTick = () => {
    const delta_time = timeTickDuration * this.replaySpeed;
    const playTime = this.playingTime + delta_time;

    // if (Math.floor(playTime / 1000) !== Math.floor(this.playingTime / 1000))
    this.playingTimeHandler(this.playingTime);

    this.playingTime = playTime;

    let rel_endtime = this.endTime_whole - this.startTime_whole;
    if (this.autoStop) {
      // relative time
      rel_endtime = this.rel_auto_play_endtime;
    }

    if (playTime > rel_endtime + delta_time) {
      this.drawPageAtTime(playTime);
      this.playStateHandler(PLAYSTATE.pause);
    }
  };

  replayStart = () => {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    // 자동 멈춤 지점을 설정
    this.rel_auto_play_endtime = this.endTime_page - this.startTime_whole;

    this.timer = setInterval(this.onTick, timeTickDuration);
    this.playingTimeHandler(this.playingTime);
  };




  /**
   * stroke replay by kitty
   * @param {number=} playingTime - millisecond from 0 (relative to whole strokes)
   */
  drawPageAtTime = (playingTime) => {
    if (playingTime === -1) {
      playingTime = Number.MAX_VALUE;

      this.pathArray.forEach((path) => {
        path.fill = path.color;
        path.stroke = path.color;
      });
    }
    else {
      const time_base = this.startTime_whole;

      const time_abs = playingTime + time_base;
      this.pathArray.forEach((path) => {

        if (time_abs <= path.startTime) {
          path.fill = DISABLED_STROKE_COLOR;
          path.stroke = DISABLED_STROKE_COLOR;
        }
        // else if (path.startTime < time_abs && time_abs <= path.endTime) {
        //   path.fill = INVISIBLE_STROKE_COLOR;
        //   path.stroke = INVISIBLE_STROKE_COLOR;

        //   this.drawIncompletedPath(path, time_abs);
        // }
        else {
          path.fill = path.color;
          path.stroke = path.color;
        }
      });

      if (this.pathArray.length > 0) {
        const endTime = this.pathArray[this.pathArray.length - 1].endTime;
        // 모든 획이 다 그려져야 하는 상황이면 temp 획을 안보이게 한다.
        if (endTime && endTime < time_abs) {
          this.canvas.remove(this.tempPath);
          this.tempPath = null;

          this.canvas.remove(this.tempPath_disabled);
          this.tempPath_disabled = null;

          // 확인 사살, 맨 마지막 획만
          const path = this.pathArray[this.pathArray.length - 1];
          path.fill = path.color;
          path.stroke = path.color;
        }

      }

    }


    this.canvas.requestRenderAll();
  };

  // /**
  //  *
  //  * @param {fabric.Path} path - path to draw
  //  * @param {number} t - playTime in real-time (unixtime ms)
  //  */
  // drawIncompletedPath = (path, t) => {
  //   let dots = path.dots;
  //   let scale = path.nu_to_pu_scale;

  //   // console.log("dot Count", dots.length);
  //   let rect = this.rect;
  //   // console.log(rect);

  //   let pointArray = [];
  //   let pointArray_disabled = [];

  //   let last_completed_dot = null;

  //   dots.forEach((dot) => {
  //     if (dot.time <= t) {
  //       let pt = this.getXYPfromDot(dot, rect, scale);
  //       if (pt) pointArray.push(pt);
  //       last_completed_dot = dot;
  //     } else {
  //       let pt = this.getXYPfromDot(dot, rect, scale);

  //       if (last_completed_dot) {
  //         let pt_last = this.getXYPfromDot(last_completed_dot, rect, scale);
  //         if (pt_last) pointArray_disabled.push(pt_last);
  //         last_completed_dot = null;
  //       }

  //       if (pt) pointArray_disabled.push(pt);
  //     }
  //   });

  //   let path_new = this.createRealTimePathObject(
  //     pointArray,
  //     path.color,
  //     this.thickness
  //   );
  //   let path_new_disabled = this.createRealTimePathObject(
  //     pointArray_disabled,
  //     INCOMPLETE_STROKE_COLOR,
  //     this.thickness
  //   );

  //   if (this.canvas) {
  //     this.canvas.add(path_new);
  //     this.canvas.remove(this.tempPath);
  //     this.tempPath = path_new;

  //     this.canvas.add(path_new_disabled);
  //     this.canvas.remove(this.tempPath_disabled);
  //     this.tempPath_disabled = path_new_disabled;
  //     // console.log("Add Path", path);
  //   }

  //   // let canvas_ktty = this.canvasRef.current;
  //   // let ctx = canvas_ktty.getContext("2d");
  // };

  // createRealTimePathObject = (pointArray, color, thickness) => {
  //   // Draw Stroke

  //   const pathOption = {
  //     objectCaching: false,
  //   };

  //   pathOption.stroke = color;
  //   let tempThickness = this.scaleX * thickness * 0.5;
  //   pathOption.strokeWidth = tempThickness;
  //   pathOption.strokeLineCap = "round";
  //   pathOption.fill = color;
  //   pathOption.selectable = false;

  //   let pathData = drawPath(pointArray, this.scaleX * thickness);

  //   let path_new = new fabric.Path(pathData, pathOption);
  //   path_new.color = color;
  //   // TODO: selectable and evented
  //   path_new.selectable = false;
  //   path_new.evented = true;

  //   return path_new;
  // };

  // getXYPfromDot = (dot, rect, scale) => {
  //   const scaleXY = (dot_x, dot_y, scale) => {
  //     const offset = 0;

  //     return {
  //       x: ((dot_x - offset) * scale),
  //       y: ((dot_y - offset) * scale),
  //     };
  //   };

  //   let scaled = scaleXY(dot.x, dot.y, scale);

  //   let p = dot.f;
  //   let x = scaled.x - rect.x;
  //   let y = scaled.y - rect.y;
  //   if (
  //     x > rect.width * this.scaleX ||
  //     y > rect.height * this.scaleY ||
  //     x < 0 ||
  //     y < 0
  //   ) {
  //     // console.log("튀었음", dot)
  //     return;
  //   }
  //   x *= this.scaleX;
  //   y *= this.scaleY;

  //   return { x, y, p };
  // };
}
