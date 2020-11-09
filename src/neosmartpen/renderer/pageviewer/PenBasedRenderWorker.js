import "../../types";
import RenderWorkerBase from "./RenderWorkerBase";

import { fabric } from "fabric";
import { PLAYSTATE } from "./StorageRenderer";
import { InkStorage } from "../..";
import { PATH_THICKNESS_SCALE, drawPath, drawLinePath } from "./DrawCurves";
import { NCODE_TO_SCREEN_SCALE } from "../../constants";
import { paperInfo } from "../../noteserver/PaperInfo";

const timeTickDuration = 20; // ms
const DISABLED_STROKE_COLOR = "rgba(0, 0, 0, 0.1)";
const INVISIBLE_STROKE_COLOR = "rgba(255, 255, 255, 0)";
const INCOMPLETE_STROKE_COLOR = "rgba(255, 0, 255, 0.4)";
const CURRENT_POINT_STROKE_COLOR = "rgba(255, 255, 255, 1)";



/** @enum {string}  */
export const ZoomFitEnum = {
  WIDTH: "width",
  HEIGHT: "height",
  FULL: "full",
  ACTUAL: "100%",
}

const STROKE_OBJECT_ID = "ns";
const GRID_OBJECT_ID = "g";

/**
 * @typedef {Object} AddedOption
 * @typedef {import('./RenderWorkerBase').RenderWorkerOption & AddedOption } PenBasedRenderWorkerOption
 *
 */

export default class PenBasedRenderWorker extends RenderWorkerBase {

  /** @type {Array<fabric.Path>} */
  localPathArray = new Array(0);


  /** @type {Object.<string, {stroke:NeoStroke, path:fabric.Path}>} */
  livePaths = {};


  storage = InkStorage.getInstance();

  /**
   *
   * @param {PenBasedRenderWorkerOption} options
   */
  constructor(options) {
    super(options);

    const { storage } = options;
    if (storage !== undefined) {
      if (!(storage instanceof InkStorage)) {
        throw new Error("storage is not an instance of InkStorage");
      }
      this.storage = storage;
    }
  }

  /**
   * @override
   */
  init = () => {
    super.init();
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
  createLiveStroke = (event) => {
    console.log( `Stroke created = ${event.strokeKey}`);
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
    let pathData = this.livePaths[event.strokeKey];
    const { path, stroke } = pathData;

    if (path) {
      this.canvas.remove(path);
    }

    let new_path = this.createPenPathFromStroke(stroke);

    if (this.canvas) {
      this.canvas.add(new_path);
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

    if ( !pathData || pathData.path === undefined ) {
      console.log( `undefined path`);
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

  moveHoverPoint = (event) => {

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
    this.base_scale = this.calcScaleFactor(this.viewFit, szPaper, this.base_scale);

    // 현재 모든 stroke를 지운다.
    this.removeAllCanvasObject();
    this.resetLocalPathArray();

    // grid를 그려준다
    this.drawPageLayout();

    // page에 있는 stroke를 가져온다
    let pageInfo = { section, owner, book, page };
    let strokes = this.storage.getPageStrokes(pageInfo);

    // 페이지의 stroke를 fabric.Path로 바꾼다.
    this.addStrokePaths(strokes);

    // page refresh
    this.canvas.requestRenderAll();
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
    if (!this.canvas) return;
    this.localPathArray.forEach(path => {
      this.canvas.remove(path);
    });

    this.localPathArray = new Array(0);
  }

  /**
   * @private
   */
  removeAllStrokeObject = () => {
    if (this.canvas) {
      let objects = this.canvas.getObjects();
      let strokes = objects.filter(obj => obj.objType === STROKE_OBJECT_ID);

      strokes.forEach((path) => {
        this.canvas.remove(path);
      });
    }
  };

  removeAllCanvasObject = () => {
    if (this.canvas) {
      this.canvas.clear();
    }
  };


  /**
   * @private
   * @param {Array<NeoStroke>} strokes
   */
  addStrokePaths = (strokes) => {
    if (!this.canvas) return;

    strokes.forEach((stroke) => {
      if (stroke.dotArray.length > 0) {
        let path = this.createPenPathFromStroke(stroke);
        this.canvas.add(path);
        this.localPathArray.push(path);
      }
    });
  }

  /**
   * @protected
   * @param {NeoStroke} stroke
   */
  createPenPathFromStroke = (stroke) => {
    const { dotArray, color, thickness } = stroke;

    let pointArray = [];
    dotArray.forEach((dot) => {
      let pt = this.getCanvasXY_scaled(dot);
      pointArray.push(pt);
    });

    const pathOption = {
      objectCaching: false,
      stroke: color,
      fill: color,
      color: color,
      opacity: 1,
      // strokeWidth: 10,
      originX: 'left',
      originY: 'top',
      selectable: false,

      objType: STROKE_OBJECT_ID,    // neostroke
      evented: true,
    };

    let strokeThickness = this.base_scale * thickness;
    let pathData = drawPath(pointArray, strokeThickness);
    let path = new fabric.Path(pathData, pathOption);

    return path;
  }

}
