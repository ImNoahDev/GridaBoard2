import "../../types";
import RenderWorkerBase, { IRenderWorkerOption } from "./RenderWorkerBase";

import { fabric } from "fabric";

// import { PLAYSTATE } from "./StorageRenderer";
import { InkStorage } from "../..";
import { drawPath, drawPath_arr } from "./DrawCurves";
// import { NCODE_TO_SCREEN_SCALE } from "../../constants";
import { paperInfo } from "../../noteserver/PaperInfo";
import { NeoDot, NeoStroke } from "../../DataStructure";
import { IBrushType } from "../../DataStructure/Enums";
import { INeoStrokeProps, StrokeStatus } from "../../DataStructure/NeoStroke";
import { IPageSOBP, IPoint } from "../../DataStructure/Structures";

import $ from "jquery";
import { IPenToViewerEvent, NeoSmartpen } from "../../pencomm/neosmartpen";


// const timeTickDuration = 20; // ms
// const DISABLED_STROKE_COLOR = "rgba(0, 0, 0, 0.1)";
// const INVISIBLE_STROKE_COLOR = "rgba(255, 255, 255, 0)";
// const INCOMPLETE_STROKE_COLOR = "rgba(255, 0, 255, 0.4)";
// const CURRENT_POINT_STROKE_COLOR = "rgba(255, 255, 255, 1)";

const NUM_HOVER_POINTERS = 6;
const REMOVE_HOVER_POINTS_INTERVAL = 50; // 50ms
const REMOVE_HOVER_POINTS_WAIT = 20; // 20 * 50ms = 1sec


const STROKE_OBJECT_ID = "ns";
// const GRID_OBJECT_ID = "g";


interface IPenHoverCursors {

  visibleHoverPoints: number,
  // pathHoverPoints: Array<fabric.Circle> = new Array(0);
  intervalHandle: number,
  waitCount: number,
  eraserLastPoint: IPoint,

  penTracker: fabric.Circle,
  hoverPoints: fabric.Circle[],

}

type IExtendedPathType = fabric.Path & {
  key?: string,
  color?,
}

export default class PenBasedRenderWorker extends RenderWorkerBase {

  localPathArray: IExtendedPathType[] = [];

  livePaths: { [key: string]: { stroke: NeoStroke, path: IExtendedPathType } } = {};

  storage = InkStorage.getInstance();

  visibleHoverPoints: number = NUM_HOVER_POINTERS;

  // pathHoverPoints: fabric.Circle[] = [];
  penCursors: { [key: string]: IPenHoverCursors } = {};

  /**
   *
   * @param options
   */
  constructor(options: IRenderWorkerOption) {
    super(options);

    this.name = "PenBasedRenderWorker";

    const { storage } = options;
    if (storage !== undefined) {
      if (!(storage instanceof InkStorage)) {
        throw new Error("storage is not an instance of InkStorage");
      }
      this.storage = storage;
    }


    const { section, owner, book, page } = this.surfaceInfo;
    this.changePage(section, owner, book, page, true);

    console.log(`constructor size ${options.width}, ${options.height}`)
    // this.resize({ width: options.width, height: options.height });
  }

  /**
   * Pen Down이 들어왔다. 그러나 아직 page 정보가 들어오지 않아서,
   * 이 페이지에 붙여야 할 것인가 아니면, 새로운 페이지에 붙여야 할 것인가를 모른다.
   *
   * 렌더러 처리 순서
   * 1) Pen Down: live stroke의 path를 생성
   * 2) Page Info: 페이지를 전환하고, 잉크 스토리지에 있는 이전의 스트로크를 path로 등록한다.
   *      2-1) 이 클래스를 new 하는 container에서 setPageStrokePath(strokes)를 불러줘야 한다.
   * 3) Pen Move:
   *      3-1) live stroke path의 처음 나오는 점이면, path를 canvas에 등록한다.
   *      3-2) 두번째 점부터는 path에 append 한다.
   * 4) Pen Up: Live stroke path는 없애고, 잉크스토리지에 2) 이후의 stroke를 받아 path에 추가 등록한다.
   *
   *
   * 조심해야 할 것은, 위의 2의 처리를 container가 담당하고 있는데, 2에 앞서서 3이 처리되면
   * 이전의 페이지에 획이 추가되고, 2-1에 의해 clear되어 버린다. 순서에 유의할 것
   *
   * @public
   * @param {{strokeKey:string, mac:string, time:number, stroke:NeoStroke}} event
   */
  createLiveStroke = (event: IPenToViewerEvent) => {
    console.log(`Stroke created = ${event.strokeKey}`);
    this.livePaths[event.strokeKey] = {
      stroke: event.stroke,
      path: null
    }
  }


  createLiveStroke_byStorage = (event: IPenToViewerEvent) => {
    this.createLiveStroke(event);
  }


  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, dot:NeoDot}} event
   */
  pushLiveDot = (event: IPenToViewerEvent) => {
    //pen tracker rendering
    this.movePenTracker(event);

    let live = this.livePaths[event.strokeKey];
    if (!live) {
      console.error("왜 live stroke가 등록 안된게 나오지?");

      live = {
        stroke: event.stroke,
        path: null
      };
      this.livePaths[event.strokeKey] = live;
    }

    const dot = event.dot;

    //지우개 구현
    const canvas_xy = this.getPdfXY_scaled(dot);
    const screen_xy = this.getScreenXY(canvas_xy);
    const pen = event.pen;

    const cursor = this.penCursors[event.mac];
    if (pen && pen.penRendererType === IBrushType.ERASER) {
      console.log('ERASE');
      if (cursor.eraserLastPoint !== undefined) {
        this.eraseOnLine(
          cursor.eraserLastPoint.x, cursor.eraserLastPoint.y,
          screen_xy.x, screen_xy.y, live.stroke
        );
      }

      cursor.eraserLastPoint = { x: screen_xy.x, y: screen_xy.y };
    }
    else {
      if (!live.path) {
        const new_path = this.createFabricPath(live.stroke, false);
        live.path = new_path as IExtendedPathType;
        this.canvasFb.add(new_path);
      }
      else {
        const pathData = this.createPathData_arr(live.stroke);
        const obj = live.path as fabric.Path;
        obj.path = pathData as any;
      }

      this.focusToDot(dot);
    }
  }


  pushLiveDot_byStorage = (event: IPenToViewerEvent) => {
    let live = this.livePaths[event.strokeKey];
    if (!live) {
      console.error("왜 live stroke가 등록 안된게 나오지?");

      live = {
        stroke: event.stroke,
        path: null
      };
      this.livePaths[event.strokeKey] = live;
    }
    const dot = event.dot;

    //지우개 구현
    const canvas_xy = this.getPdfXY_scaled(dot);
    if (!live.path) {
      const new_path = this.createFabricPath(live.stroke, false);
      live.path = new_path as IExtendedPathType;
      this.canvasFb.add(new_path);
    }
    else {
      const pathData = this.createPathData_arr(live.stroke);
      const obj = live.path as fabric.Path;
      obj.path = pathData as any;
    }

    this.focusToDot(dot);
  }


  /**
   *
   * @param {{strokeKey:string, mac:string, stroke, section:number, owner:number, book:number, page:number}} event
   */
  closeLiveStroke = (event: IPenToViewerEvent) => {
    const pathData = this.livePaths[event.strokeKey];

    if (!pathData || pathData.path === undefined) {
      console.log(`undefined path`);
    }

    const path = pathData.path;

    if (path) {
      this.localPathArray.push(path);
      path.fill = path.color;
      path.stroke = path.color;
    }

    delete this.livePaths[event.strokeKey];
  }


  /**
   *
   * @param {{strokeKey:string, mac:string, stroke, section:number, owner:number, book:number, page:number}} event
   */
  closeLiveStroke_byStorage = (event: IPenToViewerEvent) => {
    this.closeLiveStroke(event);
  }

  eraseOnLine(ink_x0, ink_y0, ink_x1, ink_y1, stroke) {
    const pathData = 'M ' + ink_x0 + ' ' + ink_y0 + ' L ' + ink_x1 + ' ' + ink_y1 + 'z';
    const pathOption = {
      strokeWidth: 5,
      opacity: 0,
      originX: 'left',
      originY: 'top',
    }
    const eraserPath = new fabric.Path(pathData, pathOption);
    // eraserPath.set({ left: ink_x0, top: ink_y0 });

    const paths = this.canvasFb.getObjects().filter(obj => obj.data === 'ns');

    for (let i = 0; i < this.localPathArray.length; i++) {
      const path = this.localPathArray[i];

      if (eraserPath.intersectsWithObject(path)) {
        this.canvasFb.remove(path);

        const { section, book, owner, page } = stroke;
        const pageId = InkStorage.makeNPageIdStr({ section, book, owner, page });

        this.storage.completed = this.storage.completedOnPage.get(pageId)
        const idx = this.storage.completed.findIndex(ns => ns.key === path.key);
        this.storage.completed.splice(idx, 1);
      }
    }
  }

  createHoverCursor = (pen: NeoSmartpen) => {
    const mac = pen.mac;

    if (!Object.prototype.hasOwnProperty.call(this.penCursors, mac)) {
      for (let i = 0; i < NUM_HOVER_POINTERS; i++) {
        const hoverPoint = new fabric.Circle({
          radius: (NUM_HOVER_POINTERS - i),
          fill: "#ff2222",
          stroke: "#ff2222",
          opacity: (NUM_HOVER_POINTERS - i) / NUM_HOVER_POINTERS / 2,
          left: -30,
          top: -30,
          hasControls: false,
          dirty: true,
          name: 'hoverPoint',
          data: 'hps'
        });

        this.canvasFb.add(hoverPoint);
      }

      const penTracker = new fabric.Circle({
        left: -30,
        top: -30,
        radius: 5,
        opacity: 0.3,
        fill: "#7a7aff",
        stroke: "#7a7aff",
        dirty: true,
        name: 'penTracker',
        data: 'pt'
      });

      this.canvasFb.add(penTracker);
      const objects = this.canvasFb.getObjects();
      const hoverPointsObj = objects.filter(obj => obj.data === 'hps');
      const penTrackerObj = objects.filter(obj => obj.data === 'pt');

      this.penCursors[mac] = {
        visibleHoverPoints: NUM_HOVER_POINTERS,
        intervalHandle: 0,
        waitCount: 0,
        eraserLastPoint: undefined,
        penTracker: penTrackerObj[0] as fabric.Circle,
        hoverPoints: hoverPointsObj as fabric.Circle[],
      };
    }
  }

  removeHoverCursor = (pen: NeoSmartpen) => {
    const mac = pen.mac;

    if (Object.prototype.hasOwnProperty.call(this.penCursors, mac)) {
      const cursors = this.penCursors[mac];
      this.canvasFb.remove(cursors.penTracker);

      for (let i = 0; i < cursors.hoverPoints.length; i++) {
        const path = cursors.hoverPoints[i];
        this.canvasFb.remove(path);
        cursors.hoverPoints[i] = undefined;
      }
      delete this.penCursors[mac];
    }
  }


  movePenTracker = (event: IPenToViewerEvent) => {
    const cursor = this.penCursors[event.mac];
    if (!cursor) {
      console.log(`ERROR: pen cursor has not been initiated`);
      return;
    }

    const dot = event.dot;
    const canvas_xy = this.getPdfXY(dot);

    const obj = cursor.penTracker;
    obj.visible = true;

    const radius = obj.radius;
    obj.set({ left: canvas_xy.x - radius, top: canvas_xy.y - radius });
    obj.setCoords();

    const pen = event.pen;

    const hps = cursor.hoverPoints;
    for (let i = 0; i < cursor.visibleHoverPoints; i++) {
      const r = hps[i].radius;
      hps[i].set({ left: canvas_xy.x - r, top: canvas_xy.y - r });
      hps[i].visible = false;
    }
    this.canvasFb.requestRenderAll();

    if (cursor.intervalHandle) {
      clearInterval(cursor.intervalHandle);
      cursor.intervalHandle = 0;
    }
  }


  moveHoverPoint = (e: IPenToViewerEvent) => {
    const cursor = this.penCursors[e.mac];
    if (!cursor) {
      console.log(`ERROR: pen cursor has not been initiated`);
      return;
    }

    const hps = cursor.hoverPoints;
    const isPointerVisible = $("#btn_tracepoint").find(".c2").hasClass("checked");

    const dot = { x: e.event.x, y: e.event.y }
    const canvas_xy = this.getPdfXY(dot);

    // hover point를 쉬프트해서 옮겨 놓는다
    for (let i = NUM_HOVER_POINTERS - 1; i > 0; i--) {
      hps[i].set({ left: hps[i - 1].left, top: hps[i - 1].top });
      hps[i].setCoords();
    }

    const r = hps[0].radius;
    hps[0].set({ left: canvas_xy.x - r, top: canvas_xy.y - r });
    hps[0].setCoords();

    cursor.visibleHoverPoints = NUM_HOVER_POINTERS;
    for (let i = 0; i < cursor.visibleHoverPoints; i++) {
      hps[i].visible = isPointerVisible;
    }
    this.canvasFb.requestRenderAll();

    if (cursor.intervalHandle) {
      clearInterval(cursor.intervalHandle);
      cursor.intervalHandle = 0;
    }
    cursor.waitCount = 0;
    const self = this;

    cursor.intervalHandle = window.setInterval(() => {
      const cursor = this.penCursors[e.mac];
      if (!cursor) {
        console.log(`ERROR: pen cursor has not been initiated`);
        clearInterval(cursor.intervalHandle);
        return;
      }
      const hps = cursor.hoverPoints;

      cursor.waitCount++;
      // 1초 뒤
      if (cursor.waitCount > 20) {
        for (let i = NUM_HOVER_POINTERS - 1; i > 0; i--) {
          hps[i].left = hps[i - 1].left;
          hps[i].top = hps[i - 1].top;
        }
        hps[0].left = -30;
        hps[0].top = -30;

        cursor.visibleHoverPoints--;
        if (cursor.visibleHoverPoints >= 0) {
          hps[cursor.visibleHoverPoints].visible = false;
          self.canvasFb.requestRenderAll();
        } else {
          clearInterval(cursor.intervalHandle);
        }
      }
    }, REMOVE_HOVER_POINTS_INTERVAL);
  }



  changePage = (section: number, owner: number, book: number, page: number, forceToRefresh: boolean): boolean => {
    console.log("changePage WORKER");
    if (!super.changePage(section, owner, book, page, forceToRefresh))
      return false;

    const szPaper = paperInfo.getPaperSize({ section, owner, book, page });

    // 현재 모든 stroke를 지운다.
    this.removeAllCanvasObject();
    this.resetLocalPathArray();
    this.resetPageDependentData();

    // grid를 그려준다
    this.drawPageLayout();

    // page에 있는 stroke를 가져온다
    const pageInfo = { section, owner, book, page };
    const strokesAll = this.storage.getPageStrokes(pageInfo);
    const strokes = strokesAll.filter(stroke => stroke.brushType !== IBrushType.ERASER);

    //test
    // const testStroke = this.generateA4CornerStrokeForTest(pageInfo);
    // strokes.push(testStroke);

    // 페이지의 stroke를 fabric.Path로 바꾼다.
    this.addStrokePaths(strokes);

    // page refresh
    this.canvasFb.requestRenderAll();

    return true;
  }


  changePage_byStorage = (section: number, owner: number, book: number, page: number, forceToRefresh: boolean) => {
    return this.changePage(section, owner, book, page, forceToRefresh);
  }


  private generateDotForTest(x: number, y: number): NeoDot {
    const dot = new NeoDot({
      dotType: 2,   // moving
      deltaTime: 2,
      time: 0,
      f: 255,
      x, y,
    });

    return dot;
  }

  private generateA4CornerStrokeForTest(pageInfo: IPageSOBP): NeoStroke {
    // for debug
    const { section, owner, book, page } = pageInfo;
    const strokeArg: INeoStrokeProps = {
      section, owner, book, page,
      startTime: 0,
      mac: "00:00:00:00:00:00",
      color: "rgba(0,0,255,255)",
      brushType: IBrushType.PEN,
      thickness: 1,
      status: StrokeStatus.NORMAL,
    }
    const defaultStroke = new NeoStroke(strokeArg);

    let dot: NeoDot;

    const dot0 = this.generateDotForTest(0, 0);
    defaultStroke.addDot(dot0);

    dot = this.generateDotForTest(88.56, 0);
    defaultStroke.addDot(dot);
    defaultStroke.addDot(dot);

    dot = this.generateDotForTest(88.56, 125.24);
    defaultStroke.addDot(dot);
    defaultStroke.addDot(dot);

    dot = this.generateDotForTest(0, 125.24);
    defaultStroke.addDot(dot);
    defaultStroke.addDot(dot);

    dot = this.generateDotForTest(0, 0);
    defaultStroke.addDot(dot);

    return defaultStroke;
  }


  /**
   * @private
   */
  resetLocalPathArray = () => {
    this.localPathArray = new Array(0);

  }

  resetPageDependentData = () => {
    Object.keys(this.penCursors).forEach(key => {
      const cursor = this.penCursors[key];
      cursor.eraserLastPoint = undefined;
    });
  }

  /**
   * @private
   */
  removeAllPaths = () => {
    if (!this.canvasFb) return;
    this.localPathArray.forEach(path => {
      this.canvasFb.remove(path);
    });

    this.localPathArray = new Array(0);
  }

  /**
   * @private
   */
  removeAllStrokeObject = () => {
    if (this.canvasFb) {
      const objects = this.canvasFb.getObjects();
      const strokes = objects.filter(obj => obj.data === STROKE_OBJECT_ID);

      strokes.forEach((path) => {
        this.canvasFb.remove(path);
      });
    }
  };

  removeAllCanvasObject = () => {
    if (this.canvasFb) {
      const objects = this.canvasFb.getObjects();
      const needToClear = objects.filter(obj =>
        (obj.data !== 'hps' && obj.data !== 'pt')
      );

      this.canvasFb.remove(...needToClear);

      // this.canvasFb.clear();
    }
  };


  /**
   * @private
   * @param {Array<NeoStroke>} strokes
   */
  addStrokePaths = (strokes) => {
    if (!this.canvasFb) return;

    strokes.forEach((stroke) => {
      if (stroke.dotArray.length > 0) {
        const path = this.createFabricPath(stroke, true);
        this.canvasFb.add(path);
        this.localPathArray.push(path);
      }
    });
  }

  createPathData_arr = (stroke: NeoStroke) => {
    const { dotArray, thickness } = stroke;

    const pointArray = [];
    dotArray.forEach((dot) => {
      const pt = this.getPdfXY_scaled(dot);
      pointArray.push(pt);
    });

    const strokeThickness = thickness / 64;
    const pathData_arr = drawPath_arr(pointArray, strokeThickness);

    return pathData_arr;
  }



  createPathData = (stroke: NeoStroke) => {
    const { dotArray, thickness } = stroke;

    const pointArray = [];
    dotArray.forEach((dot) => {
      const pt = this.getPdfXY_scaled(dot);
      pointArray.push(pt);
    });

    const strokeThickness = thickness / 64;
    const pathData = drawPath(pointArray, strokeThickness);

    return pathData;
  }

  createFabricPath = (stroke: NeoStroke, cache: boolean) => {
    const { color, brushType, key } = stroke;
    const pathData = this.createPathData(stroke);

    let opacity = 0;
    switch (brushType) {
      case 0: opacity = 1; break;
      case 1: opacity = 0.3; break;
      default: opacity = 1; break;
    }

    const pathOption = {
      stroke: color, //"rgba(0,0,0,255)"
      fill: color, //위에 두놈은 그려지는 순간의 color
      color: color, //얘가 canvas에 저장되는 color
      opacity: opacity,
      // strokeWidth: 10,
      originX: 'left',
      originY: 'top',
      selectable: false,

      data: STROKE_OBJECT_ID,    // neostroke
      evented: true,
      key: key,
      objectCaching: cache,
    };
    const path = new fabric.Path(pathData, pathOption);

    return path;
  }
}
