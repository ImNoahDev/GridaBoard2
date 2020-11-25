import "../../types";
import RenderWorkerBase, { IRenderWorkerOption } from "./RenderWorkerBase";

import { fabric } from "fabric";

// import { PLAYSTATE } from "./StorageRenderer";
import { InkStorage } from "../..";
import { drawPath } from "./DrawCurves";
// import { NCODE_TO_SCREEN_SCALE } from "../../constants";
import { paperInfo } from "../../noteserver/PaperInfo";
import { NeoDot, NeoStroke } from "../../DataStructure";
import { IBrushType } from "../../DataStructure/Enums";
import { INeoStrokeProps } from "../../DataStructure/NeoStroke";
import { IPageSOBP } from "../../DataStructure/Structures";



// const timeTickDuration = 20; // ms
// const DISABLED_STROKE_COLOR = "rgba(0, 0, 0, 0.1)";
// const INVISIBLE_STROKE_COLOR = "rgba(255, 255, 255, 0)";
// const INCOMPLETE_STROKE_COLOR = "rgba(255, 0, 255, 0.4)";
// const CURRENT_POINT_STROKE_COLOR = "rgba(255, 255, 255, 1)";



/** @enum {string}  */
export const ZoomFitEnum = {
  WIDTH: "width",
  HEIGHT: "height",
  FULL: "full",
  ACTUAL: "100%",
}

const STROKE_OBJECT_ID = "ns";
// const GRID_OBJECT_ID = "g";

export default class PenBasedRenderWorker extends RenderWorkerBase {

  /** @type {Array<fabric.Path>} */
  localPathArray = new Array(0);


  /** @type {Object.<string, {stroke:NeoStroke, path:fabric.Path}>} */
  livePaths = {};


  storage = InkStorage.getInstance();


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
    this.resize({ width: options.width, height: options.height });
  }

  // /**
  //  * @override
  //  */
  // init = () => {
  //   super.init();
  // }


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
  createLiveStroke = (event: any) => {
    console.log(`Stroke created = ${event.strokeKey}`);
    this.livePaths[event.strokeKey] = {
      stroke: event.stroke,
      path: null
    }
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, dot:NeoDot}} event
   */
  pushLiveDot = (event: any) => {
    let pathData = this.livePaths[event.strokeKey];
    const { path, stroke } = pathData;

    if (path) {
      this.canvasFb.remove(path);
    }

    let new_path = this.createPenPathFromStroke(stroke);

    if (this.canvasFb) {
      this.canvasFb.add(new_path);
      pathData.path = new_path;
    }

    const dot = event.dot;
    this.focusToDot(dot);
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke, section:number, owner:number, book:number, page:number}} event
   */
  closeLiveStroke = (event) => {
    let pathData = this.livePaths[event.strokeKey];

    if (!pathData || pathData.path === undefined) {
      console.log(`undefined path`);
    }

    let path = pathData.path;

    if (path) {
      this.localPathArray.push(path);
      path.fill = path.color;
      path.stroke = path.color;
      // this.canvas.renderAll();
    }

    delete this.livePaths[event.strokeKey];
  }

  moveHoverPoint = (e) => {
    var pathArr = new Array(0);;
      for (var i = 0; i < 6; i++) {
        var path = new fabric.Circle({
            radius: (6 - i) * 2,
            fill: "#ff2222",
            stroke: "#ff2222",
            opacity: 1, //(6 - i) / 6 / 2,
        });
        pathArr.push(path);
      }

      const dot = {x:e.event.x, y:e.event.y}
      const canvas_xy = this.getCanvasXY(dot);
      
      console.log('x : ' + e.event.x);
      // var inkCanvasPos_x = px * matrix.a + py * matrix.b + matrix.tx;
      // var inkCanvasPos_y = px * matrix.c + py * matrix.d + matrix.ty;

      for (i = 6 - 1; i > 0; i--) {
        pathArr[i].left = canvas_xy.x;
        pathArr[i].top = canvas_xy.y;
      }
      this.canvasFb.add(path);

      // e.event.pathHoverPoints.
      // event.event.x;
      // event.event.y;
      console.log('move hover point');
  }


  /**
   *
   * @param {number} section
   * @param {number} owner
   * @param {number} book
   * @param {number} page
   * @param {boolean} forceToRefresh
   */
  changePage = (section: number, owner: number, book: number, page: number, forceToRefresh: boolean) => {
    console.log("changePage");
    let currPage = this.surfaceInfo;

    if ((!forceToRefresh)
      && (section === currPage.section
        && owner === currPage.owner
        && book === currPage.book
        && page === currPage.page)) return;


    // 페이지 정보와 scale을 조정한다.
    let info = paperInfo.getPaperInfo({ section, owner, book, page });
    if (info) {
      this.surfaceInfo = {
        section, owner, book, page,
        Xmin: info.Xmin, Ymin: info.Ymin, Xmax: info.Xmax, Ymax: info.Ymax,
        Mag: info.Mag
      };

    }
    let szPaper = paperInfo.getPaperSize({ section, owner, book, page });
    this.scale = this.calcScaleFactor(this.viewFit, szPaper, this.base_scale);

    // 현재 모든 stroke를 지운다.
    this.removeAllCanvasObject();
    this.resetLocalPathArray();

    // grid를 그려준다
    this.drawPageLayout();

    // page에 있는 stroke를 가져온다
    let pageInfo = { section, owner, book, page };
    let strokes = this.storage.getPageStrokes(pageInfo);

    //test
    const testStroke = this.generateA4CornerStrokeForTest(pageInfo);
    strokes.push(testStroke);

    // 페이지의 stroke를 fabric.Path로 바꾼다.
    this.addStrokePaths(strokes);

    // page refresh
    this.canvasFb.requestRenderAll();
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
    }
    const defaultStroke = new NeoStroke(strokeArg);

    let dot: NeoDot;

    let dot0 = this.generateDotForTest(0, 0);
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
      let objects = this.canvasFb.getObjects();
      let strokes = objects.filter(obj => obj.data === STROKE_OBJECT_ID);

      strokes.forEach((path) => {
        this.canvasFb.remove(path);
      });
    }
  };

  removeAllCanvasObject = () => {
    if (this.canvasFb) {
      this.canvasFb.clear();
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
        let path = this.createPenPathFromStroke(stroke);
        this.canvasFb.add(path);
        this.localPathArray.push(path);
      }
    });
  }

  createPenPathFromStroke = (stroke: NeoStroke) => {
    const { dotArray, color, thickness, brushType } = stroke;

    let pointArray = [];
    dotArray.forEach((dot) => {
      let pt = this.getCanvasXY_scaled(dot);
      pointArray.push(pt);
    });

    var opacity: number;
    switch (brushType) {
      case 0 : opacity = 1; break;
      case 1 : opacity = 0.3; break;
      default: opacity = 1; break;
    }

    const pathOption = {
      objectCaching: false,
      stroke: "rgba(0,0,0,255)", //"rgba(0,0,0,255)"
      fill: "rgba(0,0,0,255)", //위에 두놈은 그려지는 순간의 color
      color: "rgba(0,0,0,0)", //얘가 canvas에 저장되는 color
      opacity: opacity,
      // strokeWidth: 10,
      originX: 'left',
      originY: 'top',
      selectable: false,

      data: STROKE_OBJECT_ID,    // neostroke
      evented: true,
    };

    let strokeThickness = thickness / 64;
    let pathData = drawPath(pointArray, strokeThickness);
    let path = new fabric.Path(pathData, pathOption);

    return path;
  }

}
