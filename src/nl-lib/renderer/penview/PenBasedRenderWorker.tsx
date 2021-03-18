import $ from "jquery";
import { fabric } from "fabric";

import RenderWorkerBase, { IRenderWorkerOption } from "./RenderWorkerBase";

import { callstackDepth, drawPath, drawPath_arr, makeNPageIdStr, isSamePage, uuidv4, drawPath_chiselNip } from "../../common/util";
import { IBrushType, PenEventName, PageEventName } from "../../common/enums";
import { IPoint, NeoStroke, NeoDot, IPageSOBP, INeoStrokeProps, StrokeStatus, ISize } from "../../common/structures";
import { INeoSmartpen, IPenToViewerEvent } from "../../common/neopen";
import { InkStorage } from "../../common/penstorage";
import { NeoSmartpen, PenManager, VirtualPen } from "../../neosmartpen";
import { MappingStorage } from "../../common/mapper/MappingStorage";
import { calcRevH } from "../../common/mapper/CoordinateTanslater";
import { applyTransform } from "../../common/math/echelon/SolveTransform";
import GridaDoc from "../../../GridaBoard/GridaDoc";
import { setActivePageNo } from "../../../store/reducers/activePageReducer";

// import { PaperInfo } from "../../common/noteserver";


// const timeTickDuration = 20; // ms
// const DISABLED_STROKE_COLOR = "rgba(0, 0, 0, 0.1)";
// const INVISIBLE_STROKE_COLOR = "rgba(255, 255, 255, 0)";
// const INCOMPLETE_STROKE_COLOR = "rgba(255, 0, 255, 0.4)";
// const CURRENT_POINT_STROKE_COLOR = "rgba(255, 255, 255, 1)";

const NUM_HOVER_POINTERS = 6;
const DFAULT_BRUSH_SIZE = 10;
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

  livePaths: { [key: string]: { stroke: NeoStroke, pathObj: IExtendedPathType } } = {};

  storage = InkStorage.getInstance();

  visibleHoverPoints: number = NUM_HOVER_POINTERS;

  // pathHoverPoints: fabric.Circle[] = [];
  penCursors: { [key: string]: IPenHoverCursors } = {};

  _vpPenDownTime = 0;
  brushSize = DFAULT_BRUSH_SIZE;

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

    this.changeDrawCursor();

    const penManager = PenManager.getInstance();
    penManager.addEventListener(PenEventName.ON_COLOR_CHANGED, this.changeDrawCursor);

    this.changePage(this.pageInfo, options.pageSize, true);
    console.log(`PAGE CHANGE (worker constructor):                             ${makeNPageIdStr(this.pageInfo as IPageSOBP)}`);

    // this.resize({ width: options.width, height: options.height });
  }

  prepareUnmount = () => {
    const penManager = PenManager.getInstance();
    penManager.removeEventListener(PenEventName.ON_COLOR_CHANGED, this.changeDrawCursor);
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

  changeDrawCursor = () => {
    this.canvasFb.hoverCursor = `url(${this.getDrawCursor()}) ${this.brushSize / 2} ${this.brushSize / 2}, crosshair`;
  }
  getDrawCursor = () => {
    const color = PenManager.getInstance().color;
    const pen_colors = PenManager.getInstance().pen_colors;
    const foundIdx = pen_colors.findIndex(ele => ele === color);

    let brushColor;
    switch (foundIdx) {
      case 1: brushColor = 'rgb(229,229,229)'; break;
      case 2: brushColor = 'rgb(151,151,151)'; break;
      case 3: brushColor = 'rgb(0,0,0)'; break;
      case 4: brushColor = 'rgb(108,0,226)'; break;
      case 5: brushColor = 'rgb(240,168,60)'; break;
      case 6: brushColor = 'rgb(0,171,235)'; break;
      case 7: brushColor = 'rgb(60,221,0)'; break;
      case 8: brushColor = 'rgb(255,208,1)'; break;
      case 9: brushColor = 'rgb(255,101,0)'; break;
      case 0: brushColor = 'rgb(255,2,0)'; break;
    }
    const circle = `
      <svg
        height="${this.brushSize}"
        fill="${brushColor}"
        viewBox="0 0 ${this.brushSize * 2} ${this.brushSize * 2}"
        width="${this.brushSize}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50%"
          cy="50%"
          r="${this.brushSize}"
        />
      </svg>
    `;
    return `data:image/svg+xml;base64,${window.btoa(circle)}`;
  };
  createLiveStroke = (event: IPenToViewerEvent) => {
    // console.log(`Stroke created = ${event.strokeKey}`);
    this.livePaths[event.strokeKey] = {
      stroke: event.stroke,
      pathObj: null
    }
  }


  createLiveStroke_byStorage = (event: IPenToViewerEvent) => {
    this.createLiveStroke(event);
  }



  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, dot:NeoDot}} event
   */
  pushLiveDot = (event: IPenToViewerEvent, rotation: number) => {
    //pen tracker rendering
    this.movePenTracker(event);

    let live = this.livePaths[event.strokeKey];
    if (!live) {
      console.error("왜 live stroke가 등록 안된게 나오지?");

      live = {
        stroke: event.stroke,
        pathObj: null
      };
      this.livePaths[event.strokeKey] = live;
    }

    const dot = event.dot;

    //지우개 구현
    const pdf_xy = this.ncodeToPdfXy(dot, event.pen.rotationIndep);
    const pen = event.pen;

    const cursor = this.penCursors[event.mac];
    if (pen && pen.penRendererType === IBrushType.ERASER) {
      if (cursor.eraserLastPoint !== undefined) {
        this.eraseOnLine(
          cursor.eraserLastPoint.x, cursor.eraserLastPoint.y,
          pdf_xy.x, pdf_xy.y, live.stroke
        );
      }

      cursor.eraserLastPoint = { x: pdf_xy.x, y: pdf_xy.y };
    }
    else {
      if (!live.pathObj) {
        const new_pathObj = this.createFabricPath(live.stroke, false, event.pen.rotationIndep);
        live.pathObj = new_pathObj as IExtendedPathType;
        this.canvasFb.add(new_pathObj);
      }
      else {
        const pathData = this.createPathData_arr(live.stroke, rotation, event.pen.rotationIndep);
        const pathObj = live.pathObj as fabric.Path;
        pathObj.path = pathData as any;
      }

      this.focusToDot(dot, event.pen.rotationIndep);
    }
  }


  pushLiveDot_byStorage = (event: IPenToViewerEvent) => {
    let live = this.livePaths[event.strokeKey];
    if (!live) {
      console.error("왜 live stroke가 등록 안된게 나오지?");

      live = {
        stroke: event.stroke,
        pathObj: null
      };
      this.livePaths[event.strokeKey] = live;
    }
    const dot = event.dot;

    //지우개 구현
    const canvas_xy = this.ncodeToPdfXy(dot, event.pen.rotationIndep);
    if (!live.pathObj) {
      const new_pathObj = this.createFabricPath(live.stroke, false, event.pen.rotationIndep);
      live.pathObj = new_pathObj as IExtendedPathType;
      this.canvasFb.add(new_pathObj);
    }
    else {
      const pathData = this.createPathData_arr(live.stroke, 0, event.pen.rotationIndep);
      const pathObj = live.pathObj as fabric.Path;
      pathObj.path = pathData as any;
    }

    this.focusToDot(dot, event.pen.rotationIndep);
  }


  /**
   *
   * @param {{strokeKey:string, mac:string, stroke, section:number, owner:number, book:number, page:number}} event
   */
  closeLiveStroke = (event: IPenToViewerEvent) => {
    const live = this.livePaths[event.strokeKey];

    if (!live || live.pathObj === undefined) {
      console.log(`undefined path`);
    }

    const pathObj = live.pathObj;

    if (pathObj) {
      // pathObj.fill = pathObj.color;
      // pathObj.stroke = pathObj.color;
      this.localPathArray.push(pathObj);
    }

    delete this.livePaths[event.strokeKey];
  }


  /**
   *
   * @param {{strokeKey:string, mac:string, stroke, section:number, owner:number, book:number, page:number}} event
   */
  closeLiveStroke_byStorage = (event: IPenToViewerEvent) => {
    const new_pathObj = this.createFabricPath(event.stroke, false, false) as IExtendedPathType;
    // new_pathObj.fill = new_pathObj.color;
    // new_pathObj.stroke = new_pathObj.color;

    this.canvasFb.add(new_pathObj);
    this.localPathArray.push(new_pathObj);
  }

  eraseOnLine(pdf_x0, pdf_y0, pdf_x1, pdf_y1, stroke) {
    const { section, book, owner, page } = stroke;
    const pageInfo = {
      section: section,
      book: book,
      owner: owner,
      page: page
    }

    const eraserLine = {
      x0_pu: pdf_x0, y0_pu: pdf_y0, x1_pu: pdf_x1, y1_pu: pdf_y1
    }

    
    for (let i = 0; i < this.localPathArray.length; i++) {
      const fabricPath = this.localPathArray[i];
      const pathDataStr = fabricPath.path.join();
      
      let needThumbnailRedraw = false;

      if (this.storage.collisionTest(pathDataStr, eraserLine)) {
        this.canvasFb.remove(fabricPath);
        needThumbnailRedraw = true;

        const pageId = InkStorage.makeNPageIdStr(pageInfo);
        const completed = this.storage.completedOnPage.get(pageId);
        const idx = completed.findIndex(ns => ns.key === fabricPath.key);
        completed.splice(idx, 1);

        if (needThumbnailRedraw) {
          this.storage.dispatcher.dispatch(PenEventName.ON_ERASER_MOVE, 
            {section: pageInfo.section, owner: pageInfo.owner, book: pageInfo.book, page: pageInfo.page});
        }
      }
    }
  }

  createHoverCursor = (pen: INeoSmartpen) => {
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

  removeHoverCursor = (pen: INeoSmartpen) => {
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
    const canvas_xy = this.funcNcodeToPdfXy(dot, event.pen.rotationIndep);

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
    const canvas_xy = this.funcNcodeToPdfXy(dot, e.pen.rotationIndep);

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

  redrawStrokes = (pageInfo, rotationIndep: boolean) => {
    if (isSamePage(this.pageInfo, pageInfo) || this.pageInfo === undefined) {
      this.removeAllCanvasObject();
      this.resetLocalPathArray();
      this.resetPageDependentData();
  
      const strokesAll = this.storage.getPageStrokes(pageInfo);
      const strokes = strokesAll.filter(stroke => stroke.brushType !== IBrushType.ERASER);
  
      this.addStrokePaths(strokes, rotationIndep);
    }
  }
  
  rotate = (degrees, pageInfo) => {
    const ins = InkStorage.getInstance();
    const pageId = InkStorage.makeNPageIdStr(pageInfo);
    const strokeArr = ins.completedOnPage.get(pageId);
    if (strokeArr === undefined) return;

    const canvasCenterSrc = new fabric.Point(this._opt.pageSize.width/2, this._opt.pageSize.height/2)
    const canvasCenterDst = new fabric.Point(this._opt.pageSize.height/2, this._opt.pageSize.width/2)
    const radians = fabric.util.degreesToRadians(degrees)

    // strokeArr.forEach((stroke) => {
    //   stroke.dotArray.forEach((dot) => {
    //     const pdf_xy = this.ncodeToPdfXy(dot, true);

    //     // 1. subtractEquals
    //     pdf_xy.x -= canvasCenterSrc.x;
    //     pdf_xy.y -= canvasCenterSrc.y;
        
    //     // 2. rotateVector
    //     const v = fabric.util.rotateVector(pdf_xy, radians);

    //     // 3. addEquals
    //     v.x += canvasCenterDst.x;
    //     v.y += canvasCenterDst.y;

    //     const ncode_xy = this.pdfToNcodeXy(v, true);

    //     dot.x = ncode_xy.x;
    //     dot.y = ncode_xy.y;
    //   })
    // })
  }

  changePage = (pageInfo: IPageSOBP, pageSize: ISize, forceToRefresh: boolean): boolean => {
    if (!pageInfo) return;

    this.pageInfo = { ...pageInfo };

    // const { section, owner, book, page } = pageInfo;

    const pdfSize = {
      width: Math.round(pageSize.width),
      height: Math.round(pageSize.height)
    }

    if (pdfSize.width === 0 || pdfSize.height === 0) return;


    console.log(`VIEW SIZE`);
    console.log(`VIEW SIZE${callstackDepth()} changePage (worker):   ${pdfSize?.width}, ${pdfSize?.height}        ${makeNPageIdStr(pageInfo)}`);

    const transform = MappingStorage.getInstance().getNPageTransform(pageInfo);
    const h_rev = calcRevH(transform.h);
    const leftTop_nu = applyTransform({ x: 0, y: 0 }, h_rev);
    this.paperBase = { Xmin: leftTop_nu.x, Ymin: leftTop_nu.y };


    // const szPaper = PaperInfo.getPaperSize_pu({ section, owner, book, page });

    // 현재 모든 stroke를 지운다.
    this.removeAllCanvasObject();
    this.resetLocalPathArray();
    this.resetPageDependentData();

    // grid를 그려준다
    this.onPageSizeChanged(pdfSize);
    // this.drawPageLayout();

    // page에 있는 stroke를 가져온다
    const strokesAll = this.storage.getPageStrokes(pageInfo);
    const strokes = strokesAll.filter(stroke => stroke.brushType !== IBrushType.ERASER);

    //test
    // const testStroke = this.generateA4CornerStrokeForTest(pageInfo);
    // strokes.push(testStroke);

    // 페이지의 stroke를 fabric.Path로 바꾼다.
    this.addStrokePaths(strokes, false);

    // page refresh
    this.canvasFb.requestRenderAll();

    return true;
  }


  changePage_byStorage = (pageInfo: IPageSOBP, pdfSize: ISize, forceToRefresh: boolean) => {
    return this.changePage(pageInfo, pdfSize, forceToRefresh);
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
        (obj.data !== 'hps' && obj.data !== 'pt' && obj.name !== 'page_layout')
      );

      this.canvasFb.remove(...needToClear);

      // this.canvasFb.clear();
    }
  };


  /**
   * @private
   * @param {Array<NeoStroke>} strokes
   */
  addStrokePaths = (strokes, rotationIndep) => {
    if (!this.canvasFb) return;

    strokes.forEach((stroke) => {
      if (stroke.dotArray.length > 0) {
        const path = this.createFabricPath(stroke, true, rotationIndep) as IExtendedPathType;
        this.canvasFb.add(path);
        this.localPathArray.push(path);
      }
    });
  }

  createPathData_arr = (stroke: NeoStroke, rotation: number, rotationIndep: boolean) => {
    const { dotArray, brushType, thickness } = stroke;

    let canvasCenterSrc = new fabric.Point(this._opt.pageSize.height/2, this._opt.pageSize.width/2)
    let canvasCenterDst = new fabric.Point(this._opt.pageSize.width/2, this._opt.pageSize.height/2)
    const radians = fabric.util.degreesToRadians(rotation);

    // 바뀌는 rotation이 90, 270 일 때는 width가 길다고 가정하고 src, dst가 처음 세팅한대로 가고
    // 바뀌는 rotation이 180, 0 일 때는 src가 width/2, height/2 이고 dst가 height/2, width/2 로 계산
    if (rotation === 0) {
      canvasCenterDst = canvasCenterSrc;
    } else if (rotation === 180) {
      canvasCenterSrc = canvasCenterDst;
    }

    const pointArray = [];
    dotArray.forEach((dot) => {
      const pt = this.ncodeToPdfXy(dot, rotationIndep);

      // fabric js의 rotatePoint 로직 flow인데 여기다 풀어 쓴 이유는 fabric.util.rotatePoint는 canvas는 도는 상황이 아니기 때문에 subtractEquals와 addEquals에 다른 origin을 넣을 수 없기 때문
      // 1. subtractEquals
      // pt.x -= canvasCenterSrc.x;
      // pt.y -= canvasCenterSrc.y;
      
      // // 2. rotateVector
      // const v = fabric.util.rotateVector(pt, radians);

      // // 3. addEquals
      // v.x += canvasCenterDst.x;
      // v.y += canvasCenterDst.y;

      // pt.x = v.x;
      // pt.y = v.y;

      pointArray.push(pt);
    });

    let strokeThickness = thickness / 64;
    switch (brushType) {
      case 1: strokeThickness *= 5; break;
      default: break;
    }

    const pathData_arr = drawPath_arr(pointArray, strokeThickness);
    // const pathData_arr = drawPath_chiselNip(pointArray, strokeThickness);

    return pathData_arr;
  }



  createPathData = (stroke: NeoStroke, rotationIndep: boolean) => {
    const { dotArray, brushType, thickness } = stroke;

    const pointArray = [];
    dotArray.forEach((dot) => {
      const pt = this.ncodeToPdfXy(dot, rotationIndep);
      pointArray.push(pt);
    });

    let strokeThickness = thickness / 64;
    switch (brushType) {
      case 1: strokeThickness *= 5; break;
      default: break;
    }

    const pathData = drawPath(pointArray, strokeThickness);

    return pathData;
  }

  createFabricPath = (stroke: NeoStroke, cache: boolean, rotationIndep: boolean) => {
    const { color, brushType, key } = stroke;
    const pathData = this.createPathData(stroke, rotationIndep);

    let opacity = 0;
    switch (brushType) {
      case 0: opacity = 1; break;
      case 1: opacity = 0.3; break;
      case 3: opacity = 0; break;
      default: opacity = 1; break;
    }

    const pathOption = {
      // stroke: color, //"rgba(0,0,0,255)"
      fill: color,
      color: color,
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




  /**
   * 아래는 마우스로 그림을 그리는 곳 (Pen down)
   * WorkerBase의 abstract 함수를 참조
   *
   * 2021/01/12 PointerEvent도 처리할 수 있도록 추가해야 함
   */
  onTouchStrokePenDown = async (event: MouseEvent) => {
    // const screen_xy = { x: event.clientX, y: event.clientY };

    // const pdf_xy = this.screenToPdfXy(screen_xy);
    // const ncode_xy = this.pdfToNcodeXy(pdf_xy);
    const vp = PenManager.getInstance().virtualPen;

    const timeStamp = Date.now();
    this._vpPenDownTime = timeStamp;
    vp.onPenDown({ timeStamp, penTipMode: 0, penId: vp.mac });

    if (this.pageInfo === undefined) {
      const pageNo = await GridaDoc.getInstance().addBlankPage();
      setActivePageNo(pageNo);
    }
    const { section, owner, book, page } = this.pageInfo;
    vp.onPageInfo({ timeStamp, section, owner, book, page }, false);
  }

  /**
   * 아래는 마우스로 그림을 그리는 곳 (Pen move)
   * WorkerBase의 abstract 함수를 참조
   *
   * 2021/01/12 PointerEvent도 처리할 수 있도록 추가해야 함
   */
  onTouchStrokePenMove = (event: MouseEvent & {layerX: number, layerY:number}, force: number) => {
    // const screen_xy = { x: event.clientX, y: event.clientY };
    // const pdf_xy = this.screenToPdfXy(screen_xy);

    const pdf_xy =  this.layerToPdfXy( { x: event.layerX, y: event.layerY });
    const ncode_xy = this.pdfToNcodeXy(pdf_xy, true);

    // event.path[6].offsetLeft

    const vp = PenManager.getInstance().virtualPen;
    const timeStamp = Date.now();
    const timediff = timeStamp - this._vpPenDownTime;
    const { section, owner, book, page } = this.pageInfo;

    const DEFAULT_MOUSE_PEN_FORCE = 512;

    vp.onPenMove({
      timeStamp, timediff, section, owner, book, page,
      ...ncode_xy,
      force: force,
      isFirstDot: false,
    });
  }

  /**
   * 아래는 마우스로 그림을 그리는 곳 (Pen up)
   * WorkerBase의 abstract 함수를 참조
   *
   * 2021/01/12 PointerEvent도 처리할 수 있도록 추가해야 함
   */
  onTouchStrokePenUp = (event: MouseEvent) => {
    const vp = PenManager.getInstance().virtualPen;
    const timeStamp = Date.now();

    vp.onPenUp({ timeStamp });
  }

  onViewSizeChanged = (viewSize: { width: number, height: number }) => {
    this._opt.viewSize = { ...viewSize };
    // console.log(`VIEW SIZE${callstackDepth()} onViewSizeChanged ${this.logCnt++}: ${viewSize.width}, ${viewSize.height}`);

    const zoom = this.calcScaleFactor(this._opt.viewFit, this.offset.zoom);
    this.drawPageLayout();
    this.scrollBoundaryCheck();

    this.zoomToPoint(undefined, zoom);
  }

  onPageSizeChanged = (pageSize: { width: number, height: number }) => {
    this._opt.pageSize = { ...pageSize };
    if (this.pageInfo === undefined || this.pageInfo.section === undefined)
      return false;

    console.log(`VIEW SIZE${callstackDepth()} onPageSizeChanged ${makeNPageIdStr(this.pageInfo)}: ${pageSize.width}, ${pageSize.height} = ${pageSize.width / pageSize.height}`);
    const zoom = this.calcScaleFactor(this._opt.viewFit, this.offset.zoom);
    this.drawPageLayout();
    this.scrollBoundaryCheck();
    this.zoomToPoint(undefined, zoom);

    // this.onViewSizeChanged(this._opt.viewSize);
    return true;
  }

}
