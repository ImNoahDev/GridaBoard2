import "../../types";
import { fabric } from "fabric";
import { InkStorage } from "../..";
import { PATH_THICKNESS_SCALE } from "./DrawCurves";
import { PDFVIEW_ZOOM_MAX, PDFVIEW_ZOOM_MIN } from "../Constants";
import { IWritingSurfaceInfo, ISize } from "../../DataStructure/Structures";
import { ncodeToPdfPoint } from "../../utils/UtilsFunc";
import { Point } from "fabric/fabric-impl";
import { paperInfo } from "../../noteserver/PaperInfo";
import { TransformParameters } from "../../../NcodePrintLib/Coordinates";
// import { paperInfo } from "../../noteserver/PaperInfo";
// import { plugToRequest } from "react-cookies";
// import { scaleCanvas } from "../../utils/UtilsFunc";
// import { IRectOptions } from "fabric/fabric-impl";

// const timeTickDuration = 20; // ms
// const DISABLED_STROKE_COLOR = "rgba(0, 0, 0, 0.1)";
// const INVISIBLE_STROKE_COLOR = "rgba(255, 255, 255, 0)";
// const INCOMPLETE_STROKE_COLOR = "rgba(255, 0, 255, 0.4)";
// const CURRENT_POINT_STROKE_COLOR = "rgba(255, 255, 255, 1)";


/**
 * @enum {string}
 */

export enum ZoomFitEnum {
  // eslint-disable-next-line no-unused-vars
  ACTUAL,
  // eslint-disable-next-line no-unused-vars
  WIDTH,
  // eslint-disable-next-line no-unused-vars
  HEIGHT,
  // eslint-disable-next-line no-unused-vars
  FULL,

  FREE,
}

export enum PLAYSTATE {
  live,
  play,
  stop,
  pause,
  rewind,
  trackRewind,
  setAutoStop,
  unsetAutoStop,
}

export interface IRenderWorkerOption {
  canvasId: string,

  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  viewFit: ZoomFitEnum,
  fitMargin: number,
  bgColor?: string,
  mouseAction: boolean,
  shouldDisplayGrid?: boolean,
  storage?: InkStorage,

  rotation: number,

  onCanvasShapeChanged: (arg: { offsetX, offsetY, zoom }) => void,
}

/**
 * @enum {string}
 */

// const STROKE_OBJECT_ID = "ns";
const GRID_OBJECT_ID = "g";

/**
 * @typedef {Object} RenderWorkerOption
 * @property {string} canvasId
 * @property {number} width
 * @property {number} height
 * @property {string} [bgColor]
 * @property {boolean} [mouseAction]
 * @property {ZoomFitEnum} [viewFit]
 * @property {boolean} [shouldDisplayGrid]
 * @property {InkStorage} [storage]
 *
 */

export default class RenderWorkerBase {

  name: string;
  /** canvas element ID */
  canvasId = "";

  canvas: HTMLCanvasElement;

  /** background color */
  bgColor = "rgba(255,255,255,0)";

  /** PdfSize */
  pageSize: { width: number, height: number } = { width: 0, height: 0 };

  /** parent element size */
  viewSize: { width: number, height: number } = { width: 0, height: 0 };

  /** <canvas>내의 drawing canvas(fabric canvas)의 offset, 현재는 안 씀 - 2020/11/08*/
  offset: { x: number, y: number, zoom: number } = { x: 0, y: 0, zoom: 1 };

  /** FabricJs canvas */
  canvasFb: fabric.Canvas = null;

  /** mouse에 따라 pan, zoom이 가능한지에 대한 여부 */
  mouseAction = true;

  /**  mouse에 따라 pan, zoom이 가능한지에 대한 여부 */
  zoomCtrlKey = false;

  /** mouse drag & panning 을 위해 */
  pan: { isDragging: boolean, lastPosX: number, lastPosY: number } = {
    isDragging: false,
    lastPosX: 0,
    lastPosY: 0,
  };

  /** pen stroke에 따라 자동 focus를 맞추도록 */
  autoFocus = true;



  /** 종이 정보 */
  surfaceInfo: IWritingSurfaceInfo & { rotation: number } = {
    section: 3,
    owner: 27,
    book: 168,
    page: 1,

    Xmin: 3.12,   // code unit
    Ymin: 3.12,
    Xmax: 91.68,
    Ymax: 128.36,
    Mag: 1,

    // 0: portratio, 90: landscape
    rotation: 0,
  };

  /** Ncode to Screen scale */
  nu_to_pu_scale: number;

  /** logical zoom in/out */
  // scale = 1;

  /** zoom fit */
  viewFit: ZoomFitEnum = ZoomFitEnum.ACTUAL;

  /** determine whether border and grid lines displayed or not */
  shouldDisplayGrid = true;

  /** animation timer */
  scrollAnimateTimer: number = null;

  zoomAnimateTimer: number = null;
  options: IRenderWorkerOption;

  h: TransformParameters;

  getPdfXY: (ncodeXY: { x: number, y: number, f?: number }) => { x: number, y: number, f: number };

  fitMargin = 0;

  /**
   *
   * @param {RenderWorkerOption} options
   */
  constructor(options: IRenderWorkerOption) {
    const { canvasId, canvas, width, height, bgColor, fitMargin, mouseAction, viewFit, shouldDisplayGrid } = options;
    this.getPdfXY = this.getPdfXY_default;

    this.name = "RenderWorkerBase";

    if (typeof canvasId !== "string") {
      throw new Error("canvasId should be a string");
    }

    this.canvasId = canvasId;
    this.canvas = canvas;
    this.pageSize = { width, height };
    this.nu_to_pu_scale = ncodeToPdfPoint(1);
    this.canvasFb = null;

    if (bgColor !== undefined) this.bgColor = bgColor;
    if (viewFit) this.viewFit = viewFit;
    if (fitMargin) this.fitMargin = fitMargin;
    if (typeof (mouseAction) === "boolean") this.mouseAction = mouseAction;
    if (typeof (shouldDisplayGrid) === "boolean") this.shouldDisplayGrid = shouldDisplayGrid;

    this.options = options;
    this.init();
  }

  /**
   * @protected
   */
  init = () => {
    const size = this.pageSize;

    // let HtmlCanvas = this.canvas.current;
    // const dpr = getDisplayRatio();
    // scaleCanvas(HtmlCanvas);
    const dpr = 1;

    console.log(`Fabric canvas inited: size(${size.width}, ${size.height})`);

    this.canvasFb = new fabric.Canvas(this.canvasId, {
      backgroundColor: this.bgColor ? this.bgColor : "rgba(255,255,0,0.5)",
      selection: false,
      controlsAboveOverlay: false,
      selectionLineWidth: 4,
      width: size.width * dpr,
      height: size.height * dpr,

    });

    const canvasFb = this.canvasFb;

    if (this.mouseAction) {
      canvasFb.on('mouse:down', this.onCanvasMouseDown);
      canvasFb.on('mouse:move', this.onCanvasMouseMove);
      canvasFb.on('mouse:up', this.onCanvasMousUp);
      canvasFb.on('mouse:wheel', this.onCanvasMouseWheel);
    }

    this.drawPageLayout();
    this.scrollBoundaryCheck();
  }

  getPaperSize_pu = (): ISize => {
    const { Xmin, Xmax, Ymin, Ymax, rotation } = this.surfaceInfo;
    const ncode_width = Xmax - Xmin;
    const ncode_height = Ymax - Ymin;

    const actual_width = ncodeToPdfPoint(ncode_width);
    const actual_height = ncodeToPdfPoint(ncode_height);
    const s: ISize = {
      width: actual_width,
      height: actual_height,
    };

    if (rotation === 90) {
      const temp = s.width;
      s.width = s.height;
      s.height = temp;
    }

    return s;
  }


  changePage(section: number, owner: number, book: number, page: number, forceToRefresh: boolean): boolean {
    console.log("changePage base");
    const currPage = this.surfaceInfo;

    if ((!forceToRefresh)
      && (section === currPage.section
        && owner === currPage.owner
        && book === currPage.book
        && page === currPage.page)) return false;


    // 페이지 정보와 scale을 조정한다.
    const info = paperInfo.getPaperInfo({ section, owner, book, page });
    if (info) {
      this.surfaceInfo = {
        section, owner, book, page,
        Xmin: info.Xmin, Ymin: info.Ymin, Xmax: info.Xmax, Ymax: info.Ymax,
        Mag: info.Mag,
        rotation: this.options.rotation,
      };
    }

    return true;
  }


  drawPageLayout = () => {
    if (!this.shouldDisplayGrid) return;
    const canvasFb = this.canvasFb;

    // 지우기
    if (this.canvasFb) {
      const objects = this.canvasFb.getObjects();
      const strokes = objects.filter(obj => obj.data === GRID_OBJECT_ID);

      strokes.forEach((obj) => {
        this.canvasFb.remove(obj);
      });
    }

    // 그리기
    const size = this.getPaperSize_pu();
    console.log(`drawPageLayout: ${size.width}, ${size.height}`);

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
      data: GRID_OBJECT_ID,

    });
    canvasFb.add(rect);

    // for (let x = 0; x < size.width; x += 10) {
    //   const line = new fabric.Line([x, 0, x, size.height], {
    //     strokeWidth: 0.5,
    //     stroke: "rgba(0,0,0,0.1)",
    //     hasControls: false,
    //     hasBorders: false,
    //     lockMovementX: true,
    //     lockMovementY: true,
    //     data: GRID_OBJECT_ID,
    //   });

    //   canvasFb.add(line);
    // }


    // for (let y = 0; y < size.height; y += 10) {
    //   const line = new fabric.Line([0, y, size.width, y], {
    //     strokeWidth: 0.5,
    //     stroke: "rgba(0,0,0,0.1)",
    //     hasControls: false,
    //     hasBorders: false,
    //     lockMovementX: true,
    //     lockMovementY: true,
    //     data: GRID_OBJECT_ID,
    //   });

    //   canvasFb.add(line);
    // }

  }

  /**
   * enable/disable mouse drag panning and zoom in/out
   * default: true
   *
   * @public
   * @param {boolean} sw
   */
  enableMouseAction = (sw: boolean) => {
    if (this.mouseAction !== sw) {
      const canvasFb = this.canvasFb;

      if (sw === false) {

        this.onCanvasMousUp();

        canvasFb.off('mouse:down', this.onCanvasMouseDown);
        canvasFb.off('mouse:move', this.onCanvasMouseMove);
        canvasFb.off('mouse:up', this.onCanvasMousUp);
        canvasFb.off('mouse:wheel', this.onCanvasMouseWheel);
      }
      else {
        canvasFb.on('mouse:down', this.onCanvasMouseDown);
        canvasFb.on('mouse:move', this.onCanvasMouseMove);
        canvasFb.on('mouse:up', this.onCanvasMousUp);
        canvasFb.on('mouse:wheel', this.onCanvasMouseWheel);
      }
    }
    this.mouseAction = sw;
  }

  /**
   * enable/disable auto set focus at current stroke point
   * default: true
   *
   * @public
   * @param {boolean} sw
   */
  enableAutoFocus = (sw: boolean) => {
    this.autoFocus = sw;
  }

  /**
   * @protected
   * @param {Object} opt
   */
  onCanvasMouseDown = (opt: any) => {
    const canvasFb = this.canvasFb;

    const evt: MouseEvent = opt.e;

    this.pan.isDragging = true;
    this.pan.lastPosX = evt.clientX;
    this.pan.lastPosY = evt.clientY;

    canvasFb.selection = false;

  }

  /**
   * @protected
   * @param {Object} opt
   */
  onCanvasMouseMove = (opt: any) => {
    const canvasFb = this.canvasFb;

    if (this.pan.isDragging) {
      const e: MouseEvent = opt.e;


      // console.log(`Point ${e.clientX}, ${e.clientY}`);
      // const vpt = canvasFb.viewportTransform;
      this.offset.x += e.clientX - this.pan.lastPosX;
      this.offset.y += e.clientY - this.pan.lastPosY;

      this.scrollBoundaryCheck();

      // canvasFb.setViewportTransform(vpt);
      // canvasFb.requestRenderAll();

      this.pan.lastPosX = e.clientX;
      this.pan.lastPosY = e.clientY;



      // this.canvasBoundaryCheck();
    }
  }

  reportCanvasChanged = () => {
    const { x: offsetX, y: offsetY, zoom } = this.offset;
    this.options.onCanvasShapeChanged({ offsetX, offsetY, zoom });
  }

  /**
   * @protected
   * @param {Object} opt
   */
  onCanvasMousUp = (opt: any = undefined) => {
    const canvasFb = this.canvasFb;
    canvasFb.selection = false;

    // // on mouse up we want to recalculate new interaction
    // // for all objects, so we call setViewportTransform
    // canvasFb.setViewportTransform(canvasFb.viewportTransform);
    this.pan.isDragging = false;


    // let vpt = canvasFb.viewportTransform;
    // console.log(vpt);
  }

  /**
   * @protected
   * @param {Object} opt
   */
  onCanvasMouseWheel = (opt: any) => {

    this.viewFit = ZoomFitEnum.FREE;

    const evt: MouseEvent = opt.e;
    if ((!this.zoomCtrlKey) || (this.zoomCtrlKey === true && evt.ctrlKey === true)) {
      const delta = opt.e.deltaY;
      let zoom = this.offset.zoom;
      zoom *= 0.9985 ** delta;

      this.setCanvasZoom(zoom, opt);
    }
  }


  scrollBoundaryCheck = () => {
    // http://fabricjs.com/fabric-intro-part-5#pan_zoom

    const zoom = this.calcScaleFactor(this.viewFit, this.offset.zoom);
    if (zoom === 0) {
      this.reportCanvasChanged();
      return false;
    }
    else {
      if (zoom !== this.offset.zoom) {
        this.offset.zoom = zoom;
        this.zoomToPoint(undefined, zoom);
      }

      let offsetX = this.offset.x;
      let offsetY = this.offset.y;

      // const { section, owner, book, page } = this.surfaceInfo;
      // const szPaper = paperInfo.getPaperSize({ section, owner, book, page });

      // const size_pu = {
      //   width: szPaper.width * this.nu_to_pu_scale,
      //   height: szPaper.height * this.nu_to_pu_scale,
      // }


      const pageSize = {
        width: this.pageSize.width * zoom,
        height: this.pageSize.height * zoom
      };

      let shouldReset = false;

      if (pageSize.width <= this.viewSize.width) {
        offsetX = Math.round((this.viewSize.width - pageSize.width) / 2);
        shouldReset = true;
      }
      else {
        if (offsetX > 0) {
          offsetX = 0;
          shouldReset = true;
        }
        else if (offsetX + pageSize.width < this.viewSize.width) {
          offsetX = this.viewSize.width - pageSize.width;
          shouldReset = true;
        }
      }

      if (pageSize.height <= this.viewSize.height) {
        offsetY = Math.round((this.viewSize.height - pageSize.height) / 2);
        shouldReset = true;
      }

      else {
        if (offsetY > 0) {
          offsetY = 0;
          shouldReset = true;
        }
        else if (offsetY + pageSize.height < this.viewSize.height) {
          offsetY = this.viewSize.height - pageSize.height;
          shouldReset = true;
        }
      }

      if (shouldReset) {
        this.offset.x = offsetX;
        this.offset.y = offsetY;
      }
      this.reportCanvasChanged();
      return shouldReset;
    }
  }



  /**
   * @protected
   * @param {number} zoom
   * @param {Object} opt
   */
  setCanvasZoom = (zoom: number, opt: any) => {
    const canvasFb = this.canvasFb;

    if (zoom > PDFVIEW_ZOOM_MAX) zoom = PDFVIEW_ZOOM_MAX;
    if (zoom < PDFVIEW_ZOOM_MIN) zoom = PDFVIEW_ZOOM_MIN;

    const evt: MouseEvent = opt.e;
    const pt = new fabric.Point(evt.offsetX, evt.offsetY);
    if (opt) {
      this.zoomToPoint(pt, zoom);
    }
    else {
      // canvasFb.setZoom(zoom);
      this.zoomToPoint(null, zoom);
    }

    opt.e.preventDefault();
    opt.e.stopPropagation();
  }

  zoomToPoint = (pt: Point, zoom: number, animate = true) => {

    let x1 = this.offset.x;
    let y1 = this.offset.y;

    if (pt) {
      const z0 = this.offset.zoom;
      const z1 = zoom;

      const x0 = this.offset.x;
      const y0 = this.offset.y;
      x1 = pt.x * (z0 - z1) / z0 + x0;
      y1 = pt.y * (z0 - z1) / z0 + y0;
    }

    this.offset.x = x1;
    this.offset.y = y1;
    this.offset.zoom = zoom;
    this.canvasFb.setZoom(zoom);
    this.canvasFb.setWidth(this.pageSize.width * zoom);
    this.canvasFb.setHeight(this.pageSize.height * zoom);

    this.scrollBoundaryCheck();
  }



  /**
   * @protected
   * @param {{x:number, y:number, f?:number}} ncodeXY
   */
  protected getPdfXY_default = (ncodeXY: { x: number, y: number, f?: number }) => {
    const { x, y, f } = ncodeXY;
    const { Xmin, Ymin } = this.surfaceInfo;

    const nu_to_pu_scale = this.nu_to_pu_scale;

    const px = (x - Xmin) * nu_to_pu_scale;
    const py = (y - Ymin) * nu_to_pu_scale;

    return { x: px, y: py, f };
  }


  protected getPdfXY_homography = (ncodeXY: { x: number, y: number, f?: number }) => {
    const { x, y } = ncodeXY;
    const { a, b, c, d, e, f, g, h } = this.h;

    const nominator = g * x + h * y + 1;
    const px = (a * x + b * y + c) / nominator;
    const py = (d * x + e * y + f) / nominator;

    return { x: px, y: py, f: ncodeXY.f };
  }


  /**
   * @protected
   * @param {{x:number, y:number, f?:number}} ncodeXY
   */
  protected getPdfXY_scaled = (ncodeXY: { x: number, y: number, f?: number }) => {
    const ret = this.getPdfXY(ncodeXY);
    const { x, y, f } = ret;

    return { x: x * PATH_THICKNESS_SCALE, y: y * PATH_THICKNESS_SCALE, f };
  }

  /**
   * @protected
   * @param {{x:number, y:number}} pdfXY
   */
  protected getScreenXY = (pdfXY: { x: number, y: number }) => {
    const { x, y } = pdfXY;

    const canvasFb = this.canvasFb;
    const vpt = canvasFb.viewportTransform;

    const zoom = this.canvasFb.getZoom();
    const offset_x = vpt[4];
    const offset_y = vpt[5];


    const sx = x * zoom + offset_x;
    const sy = y * zoom + offset_y;

    return { x: sx, y: sy };
  }

  /**
   *
   * @param mode
   * @param szPaper
   * @param currScale
   */
  protected calcScaleFactor(mode: ZoomFitEnum, currScale: number) {
    const szPaper = this.pageSize;

    const actual_width = szPaper.width;
    const actual_height = szPaper.height;

    const szCanvas = { ... this.viewSize };
    szCanvas.width -= this.fitMargin;
    szCanvas.height -= this.fitMargin;

    let scale = 1;
    switch (mode) {
      case ZoomFitEnum.WIDTH:
        scale = szCanvas.width / actual_width;

        break;

      case ZoomFitEnum.HEIGHT:
        scale = szCanvas.height / actual_height;
        break;

      case ZoomFitEnum.FULL:
        scale = Math.min(szCanvas.width / actual_width, szCanvas.height / actual_height);
        break;

      case ZoomFitEnum.ACTUAL:
        scale = 1;
        break;

      default:
        scale = currScale;

        break;

    }
    return scale;
  }




  /**
   * @protected
   * @param {{x:number, y:number}} dot
   */
  protected focusToDot = (dot: { x: number, y: number }) => {
    if (!this.autoFocus) return;
    const margin_to_go_ratio = 0.25;
    const canvas_xy = this.getPdfXY(dot);
    const screen_xy = this.getScreenXY(canvas_xy);

    let dx = 0, dy = 0;
    let shouldScroll = false;

    const canvasFb = this.canvasFb;
    const vpt = canvasFb.viewportTransform;
    const offset_x = vpt[4];
    const offset_y = vpt[5];

    if (screen_xy.x < 0) {
      // scroll to left
      const target = this.viewSize.width * margin_to_go_ratio;
      dx = target - screen_xy.x;
      shouldScroll = true;
    }

    if (screen_xy.y < 0) {
      // scroll to top
      const target = this.viewSize.height * margin_to_go_ratio;
      dy = target - screen_xy.y;
      shouldScroll = true;
    }

    if (screen_xy.x > this.viewSize.width) {
      // scroll to right
      const target = this.viewSize.width * (1 - margin_to_go_ratio);
      dx = target - screen_xy.x;
      shouldScroll = true;
    }

    if (screen_xy.y > this.viewSize.height) {
      // scroll to bottom
      const target = this.viewSize.height * (1 - margin_to_go_ratio);
      dy = target - screen_xy.y;
      shouldScroll = true;
    }

    if (shouldScroll) {

      const new_offset_x = offset_x + dx;
      const new_offset_y = offset_y + dy;

      this.scrollCanvasToPoint({ x: new_offset_x, y: new_offset_y }, false);
    }
  }

  /**
   *
   * @param {{x:number, y:number}} point
   * @param {boolean} animate
   */
  protected scrollCanvasToPoint = (point: { x: number, y: number }, animate: boolean) => {
    const canvasFb = this.canvasFb;

    if (animate) {
      if (this.scrollAnimateTimer) {
        window.clearInterval(this.scrollAnimateTimer);
        this.scrollAnimateTimer = null;
      }
      let x0 = this.offset.x;
      let y0 = this.offset.y;
      const x1 = point.x;
      const y1 = point.y;

      /** 10 단계 */
      const div = 10;
      const step_x = (x1 - x0) / div;
      const step_y = (y1 - y0) / div;
      let count = 0;

      this.scrollAnimateTimer = window.setInterval(() => {
        x0 += step_x;
        y0 += step_y;
        this.offset.x = x0;
        this.offset.y = y0;
        this.scrollBoundaryCheck();
        canvasFb.requestRenderAll();

        count++;
        if (count === div) {
          window.clearInterval(this.scrollAnimateTimer);
          this.scrollAnimateTimer = null;
          canvasFb.setViewportTransform(canvasFb.viewportTransform);
        }
      }, 20);
    }
    else {
      this.offset.x = point.x;
      this.offset.y = point.y;
      this.scrollBoundaryCheck();
      canvasFb.requestRenderAll();
      canvasFb.setViewportTransform(canvasFb.viewportTransform);
    }

  }

  onViewSizeChanged = (width: number, height: number) => {
    this.viewSize = { width, height };
    this.scrollBoundaryCheck();
  }



  setRotation = (rotation: number) => {
    console.log(`RenderWorkerBase: setRotation to ${rotation}`);
    this.surfaceInfo.rotation = rotation;
  }

  setTransformParameters = (h: TransformParameters) => {
    this.h = { ...h };

    if (h) {
      this.getPdfXY = this.getPdfXY_homography;
    }
    else {
      this.getPdfXY = this.getPdfXY_default;
    }
  }
}
