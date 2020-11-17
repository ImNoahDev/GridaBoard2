import "../../types";
import { fabric } from "fabric";
import { InkStorage } from "../..";
import { PATH_THICKNESS_SCALE } from "./DrawCurves";
import { NCODE_TO_SCREEN_SCALE } from "../../constants";
import { IWritingSurfaceInfo, ISize } from "../../DataStructure/Structures";
import { scaleCanvas, getDisplayRatio, ncodeToDisplayPixel } from "../../utils/UtilsFunc";
// import { paperInfo } from "../../noteserver/PaperInfo";
// import { plugToRequest } from "react-cookies";
// import { scaleCanvas } from "../../utils/UtilsFunc";
// import { IRectOptions } from "fabric/fabric-impl";

// const timeTickDuration = 20; // ms
// const DISABLED_STROKE_COLOR = "rgba(0, 0, 0, 0.1)";
// const INVISIBLE_STROKE_COLOR = "rgba(255, 255, 255, 0)";
// const INCOMPLETE_STROKE_COLOR = "rgba(255, 0, 255, 0.4)";
// const CURRENT_POINT_STROKE_COLOR = "rgba(255, 255, 255, 1)";


export enum PLAYSTATE {
  live,
  play,
  stop,
  pause,
  rewind,
  trackRewind,
  setAutoStop,
  unsetAutoStop,
};

export enum ZoomFitEnum {
  WIDTH,
  HEIGHT,
  FULL,
  ACTUAL,
}


export type IRenderWorkerOption = {
  canvasId: string,

  canvasRef: React.RefObject<HTMLCanvasElement>,
  width: number,
  height: number,
  style: { width: number, height: number },
  viewFit: ZoomFitEnum,
  bgColor?: string,
  mouseAction?: boolean,
  shouldDisplayGrid?: boolean,
  storage?: InkStorage,
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
  canvasId: string = "";

  canvasRef: React.RefObject<HTMLCanvasElement>;

  /** background color */
  bgColor: string = "rgba(255,255,255,0)";

  /** the size when first initied */
  initialSize: { width: number, height: number } = { width: 0, height: 0 };

  /** the size after resize */
  currSize: { width: number, height: number } = { width: 0, height: 0 };

  /** FabricJs canvas */
  canvas: fabric.Canvas = null;

  /** mouse에 따라 pan, zoom이 가능한지에 대한 여부 */
  mouseAction: boolean = true;

  /**  mouse에 따라 pan, zoom이 가능한지에 대한 여부 */
  zoomCtrlKey: boolean = false;

  /** mouse drag & panning 을 위해 */
  pan: { isDragging: boolean, lastPosX: number, lastPosY: number } = {
    isDragging: false,
    lastPosX: 0,
    lastPosY: 0,
  };

  /** pen stroke에 따라 자동 focus를 맞추도록 */
  autoFocus: boolean = true;

  /** <canvas>내의 drawing canvas(fabric canvas)의 offset, 현재는 안 씀 - 2020/11/08*/
  offset: { x: number, y: number } = { x: 0, y: 0 };

  /** 종이 정보 */
  surfaceInfo: IWritingSurfaceInfo = {
    section: 3,
    owner: 27,
    book: 168,
    page: 1,

    Xmin: 3.12,   // code unit
    Ymin: 3.12,
    Xmax: 91.68,
    Ymax: 128.36,
    Mag: 1,
  };

  /** Ncode to Screen scale */
  base_scale: number;

  /** zoom fit */
  viewFit: ZoomFitEnum = ZoomFitEnum.ACTUAL;

  /** determine whether border and grid lines displayed or not */
  shouldDisplayGrid: boolean = true;

  /** animation timer */
  scrollAnimateTimer: number = null;

  /**
   *
   * @param {RenderWorkerOption} options
   */
  constructor(options: IRenderWorkerOption) {
    const { canvasId, canvasRef, width, height, bgColor, mouseAction, viewFit, shouldDisplayGrid } = options;

    this.name = "RenderWorkerBase";

    if (typeof canvasId !== "string") {
      throw new Error("canvasId should be a string");
    }

    this.canvasId = canvasId;
    this.canvasRef = canvasRef;

    this.initialSize = { width, height };
    this.currSize = { width, height };

    this.base_scale = ncodeToDisplayPixel(1);

    this.canvas = null;

    if (bgColor !== undefined) this.bgColor = bgColor;
    if (typeof (mouseAction) === "boolean") this.mouseAction = mouseAction;
    if (typeof (viewFit) !== undefined) this.viewFit = viewFit;
    if (typeof (shouldDisplayGrid) === "boolean") this.shouldDisplayGrid = shouldDisplayGrid;
    this.init();
  }

  /**
   * @protected
   */
  init = () => {
    const size = this.currSize;

    // let HtmlCanvas = this.canvasRef.current;
    // const dpr = getDisplayRatio();
    // scaleCanvas(HtmlCanvas);
    const dpr = 1;

    this.canvas = new fabric.Canvas(this.canvasId, {
      backgroundColor: this.bgColor ? this.bgColor : "rgba(255,255,255,0)",
      selection: false,
      controlsAboveOverlay: false,
      selectionLineWidth: 4,
      width: size.width * dpr,
      height: size.height * dpr,

    });

    let canvas = this.canvas;

    if (this.mouseAction) {
      canvas.on('mouse:down', this.onCanvasMouseDown);
      canvas.on('mouse:move', this.onCanvasMouseMove);
      canvas.on('mouse:up', this.onCanvasMousUp);
      canvas.on('mouse:wheel', this.onCanvasMouseWheel);
    }

    this.drawPageLayout();
  }

  getSurfaceSize_CSS = (): ISize => {
    const { Xmin, Xmax, Ymin, Ymax } = this.surfaceInfo;
    const ncode_width = Xmax - Xmin;
    const ncode_height = Ymax - Ymin;

    let s: ISize = {
      width: ncodeToDisplayPixel(ncode_width),
      height: ncodeToDisplayPixel(ncode_height),
    };

    return s;
  }

  drawPageLayout = () => {
    if (!this.shouldDisplayGrid) return;
    const canvas = this.canvas;

    // 지우기
    if (this.canvas) {
      let objects = this.canvas.getObjects();
      let strokes = objects.filter(obj => obj.data === GRID_OBJECT_ID);

      strokes.forEach((obj) => {
        this.canvas.remove(obj);
      });
    }

    // 그리기
    const size = this.getSurfaceSize_CSS();

    // console.log(`Grid: scale=${this.base_scale} (width, height)=(${size.width}, ${size.height})`);

    const ratio = 1;

    let rect = new fabric.Rect({
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
    canvas.add(rect);

    for (let x = 0; x < size.width; x += 10) {
      let line = new fabric.Line([x, 0, x, size.height], {
        strokeWidth: 0.5,
        stroke: "rgba(0,0,0,0.1)",
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        data: GRID_OBJECT_ID,
      });

      canvas.add(line);
    }


    for (let y = 0; y < size.height; y += 10) {
      let line = new fabric.Line([0, y, size.width, y], {
        strokeWidth: 0.5,
        stroke: "rgba(0,0,0,0.1)",
        hasControls: false,
        hasBorders: false,
        lockMovementX: true,
        lockMovementY: true,
        data: GRID_OBJECT_ID,
      });

      canvas.add(line);
    }

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
      let canvas = this.canvas;

      if (sw === false) {

        this.onCanvasMousUp();

        canvas.off('mouse:down', this.onCanvasMouseDown);
        canvas.off('mouse:move', this.onCanvasMouseMove);
        canvas.off('mouse:up', this.onCanvasMousUp);
        canvas.off('mouse:wheel', this.onCanvasMouseWheel);
      }
      else {
        canvas.on('mouse:down', this.onCanvasMouseDown);
        canvas.on('mouse:move', this.onCanvasMouseMove);
        canvas.on('mouse:up', this.onCanvasMousUp);
        canvas.on('mouse:wheel', this.onCanvasMouseWheel);
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
    let canvas = this.canvas;

    let evt: MouseEvent = opt.e;

    this.pan.isDragging = true;
    this.pan.lastPosX = evt.clientX;
    this.pan.lastPosY = evt.clientY;

    canvas.selection = false;

  }

  /**
   * @protected
   * @param {Object} opt
   */
  onCanvasMouseMove = (opt: any) => {
    let canvas = this.canvas;

    if (this.pan.isDragging) {
      let e: MouseEvent = opt.e;
      // console.log(`Point ${e.clientX}, ${e.clientY}`);
      let vpt = canvas.viewportTransform;
      vpt[4] += e.clientX - this.pan.lastPosX;
      vpt[5] += e.clientY - this.pan.lastPosY;

      this.scrollBoundaryCheck();

      // canvas.setViewportTransform(vpt);
      canvas.requestRenderAll();
      this.pan.lastPosX = e.clientX;
      this.pan.lastPosY = e.clientY;

      // this.canvasBoundaryCheck();
    }
  }

  /**
   * @protected
   * @param {Object} opt
   */
  onCanvasMousUp = (opt: any = undefined) => {
    let canvas = this.canvas;


    // on mouse up we want to recalculate new interaction
    // for all objects, so we call setViewportTransform
    canvas.setViewportTransform(canvas.viewportTransform);
    this.pan.isDragging = false;
    canvas.selection = false;


    // let vpt = canvas.viewportTransform;
    // console.log(vpt);
  }

  /**
   * @protected
   * @param {Object} opt
   */
  onCanvasMouseWheel = (opt: any) => {
    let evt: MouseEvent = opt.e;
    if ((!this.zoomCtrlKey) || (this.zoomCtrlKey === true && evt.ctrlKey === true)) {
      let canvas = this.canvas;

      let delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;

      this.setCanvasZoom(zoom, opt);
    }
  }

  /**
   * @protected
   */
  scrollBoundaryCheck = () => {
    return;
    const canvas = this.canvas;
    const zoom = canvas.getZoom();

    // http://fabricjs.com/fabric-intro-part-5#pan_zoom
    let vpt = canvas.viewportTransform;

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
   * @protected
   * @param {number} zoom
   * @param {Object} opt
   */
  setCanvasZoom = (zoom: number, opt: any) => {
    let canvas = this.canvas;

    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;

    /** @type {fabric.Point} */
    const evt: MouseEvent = opt.e;
    const pt = new fabric.Point(evt.offsetX, evt.offsetY);
    if (opt) canvas.zoomToPoint(pt, zoom);
    else canvas.setZoom(zoom);

    opt.e.preventDefault();
    opt.e.stopPropagation();

    this.scrollBoundaryCheck();
  }

  /**
   * @protected
   * @param {{x:number, y:number, f?:number}} ncodeXY
   */
  protected getCanvasXY = (ncodeXY: { x: number, y: number, f?: number }) => {
    const { x, y, f } = ncodeXY;
    const { Xmin, Ymin } = this.surfaceInfo;

    let scale = this.base_scale;

    let cx = (x - Xmin) * scale + this.offset.x;
    let cy = (y - Ymin) * scale + this.offset.y;

    return { x: cx, y: cy, f };
  }


  /**
   * @protected
   * @param {{x:number, y:number, f?:number}} ncodeXY
   */
  protected getCanvasXY_scaled = (ncodeXY: { x: number, y: number, f?: number }) => {
    const { x, y, f } = ncodeXY;
    const { Xmin, Ymin } = this.surfaceInfo;

    let scale = this.base_scale;

    let cx = (x - Xmin) * scale + this.offset.x;
    let cy = (y - Ymin) * scale + this.offset.y;

    cx *= PATH_THICKNESS_SCALE;
    cy *= PATH_THICKNESS_SCALE;

    return { x: cx, y: cy, f };
  }

  /**
   * @protected
   * @param {{x:number, y:number}} canvasXY
   */
  protected getScreenXY = (canvasXY: { x: number, y: number }) => {
    const { x, y } = canvasXY;

    let canvas = this.canvas;
    let vpt = canvas.viewportTransform;

    let zoom = this.canvas.getZoom();
    let offset_x = vpt[4];
    let offset_y = vpt[5];


    let sx = x * zoom + offset_x;
    let sy = y * zoom + offset_y;

    return { x: sx, y: sy };
  }


  /**
   * @protected
   * @param {{x:number, y:number}} screenXY
   */
  protected getNcodeXY = (screenXY: { x: number, y: number }) => {
    const { x, y } = screenXY;

    let scale_det = 1 / this.base_scale;

    let nx = (x - this.offset.x) * scale_det;
    let ny = (y - this.offset.y) * scale_det;

    return { x: nx, y: ny };
  }


  /**
  * @public
  * @param {ZoomFitEnum} mode
  * @param {{width:number, height:number}} szPaper
  * @param {number} currScale
  */
  public calcScaleFactor(mode: ZoomFitEnum, szPaper: { width: number, height: number }, currScale: number): number {
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
    const canvas_xy = this.getCanvasXY(dot);
    const screen_xy = this.getScreenXY(canvas_xy);

    let dx = 0, dy = 0;
    let shouldScroll = false;

    let canvas = this.canvas;
    let vpt = canvas.viewportTransform;
    let offset_x = vpt[4];
    let offset_y = vpt[5];

    if (screen_xy.x < 0) {
      // scroll to left
      let target = this.currSize.width * margin_to_go_ratio;
      dx = target - screen_xy.x;
      shouldScroll = true;
    }

    if (screen_xy.y < 0) {
      // scroll to top
      let target = this.currSize.height * margin_to_go_ratio;
      dy = target - screen_xy.y;
      shouldScroll = true;
    }

    if (screen_xy.x > this.currSize.width) {
      // scroll to right
      let target = this.currSize.width * (1 - margin_to_go_ratio);
      dx = target - screen_xy.x;
      shouldScroll = true;
    }

    if (screen_xy.y > this.currSize.height) {
      // scroll to bottom
      let target = this.currSize.height * (1 - margin_to_go_ratio);
      dy = target - screen_xy.y;
      shouldScroll = true;
    }

    if (shouldScroll) {

      let new_offset_x = offset_x + dx;
      let new_offset_y = offset_y + dy;

      this.scrollCanvasToPoint({ x: new_offset_x, y: new_offset_y }, true);
    }
  }

  /**
   *
   * @param {{x:number, y:number}} point
   * @param {boolean} animate
   */
  protected scrollCanvasToPoint = (point: { x: number, y: number }, animate: boolean) => {
    let canvas = this.canvas;
    let vpt = canvas.viewportTransform;

    if (animate) {
      if (this.scrollAnimateTimer) {
        window.clearInterval(this.scrollAnimateTimer);
        this.scrollAnimateTimer = null;
      }
      let x0 = vpt[4];
      let y0 = vpt[5];
      let x1 = point.x;
      let y1 = point.y;

      const div = 10;
      let step_x = (x1 - x0) / div;
      let step_y = (y1 - y0) / div;
      let count = 0;

      this.scrollAnimateTimer = window.setInterval(() => {
        x0 += step_x;
        y0 += step_y;
        vpt[4] = x0;
        vpt[5] = y0;
        canvas.requestRenderAll();

        count++;
        if (count === div) {
          window.clearInterval(this.scrollAnimateTimer);
          this.scrollAnimateTimer = null;
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
   * @public
   * @param {{width:number, height:number}} size
   */
  resize = (size: { width: number, height: number }) => {
    let zoom = size.width / this.initialSize.width;
    this.currSize = { ...size };

    this.canvas.setHeight(size.height);
    this.canvas.setWidth(size.width);

    this.canvas.setZoom(zoom);
  };
}
