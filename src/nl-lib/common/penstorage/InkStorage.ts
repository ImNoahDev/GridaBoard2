import { EventDispatcher, EventCallbackType } from "../event";
import { IBrushType, PenEventName } from "../enums";
import { NeoStroke, IPageSOBP, StrokeStatus, INeoStrokeProps, NeoDot } from "../structures";
import intersect from 'path-intersection';

/** @type {InkStorage} */
let _storage_instance = null;


export interface IOpenStrokeArg {
  mac: string,
  time: number,
  penTipMode: number/**0:pen, 1:eraser */,

  brushType: IBrushType,
  thickness: number,
  color: string,
}


export default class InkStorage {
  completed: NeoStroke[] = [];  // completed strokes

  /** sourceKey ("uuid" ) ==> Stroke */
  realtime: Map<string, NeoStroke> = new Map(); // realtime strokes (incompleted strokes)

  /** (pageId) ==> ({penId : NeoStroke[]}) */
  completedOnPage: Map<string, NeoStroke[]> = new Map();

  /** (pageId) ==> ({strokeKey : NeoStroke}) */
  realtimeOnPage: Map<string, Map<string, NeoStroke>> = new Map();

  dispatcher: EventDispatcher = new EventDispatcher();

  lastPageInfo: IPageSOBP = { section: -1, book: -1, owner: -1, page: -1 };


  /** @type {InkStorage} */
  // static instance;
  constructor() {
    if (_storage_instance) return _storage_instance;
    _storage_instance = this;

    // this.completed = [];            // completed strokes
    // this.realtime = new Map();    // realtime strokes (incompleted strokes)
    // this.completedOnPage = new Map();
    // this.realtimeOnPage = new Map();
    // this.dispatcher = new EventDispatcher();
    // this.lastPageInfo = { section: -1, book: -1, owner: -1, page: -1 };
  }

  /**
   *
   */
  static getInstance(): InkStorage {
    if (_storage_instance) return _storage_instance;

    _storage_instance = new InkStorage();
    return _storage_instance;
  }

  /**
   *
   * @param eventName
   * @param listener
   * @param filter
   */
  public addEventListener(eventName: string, listener: EventCallbackType, filter: any) {
    this.dispatcher.on(eventName, listener, filter);
    // console.log("bound", listener);
  }

  /**
   *
   * @param eventName
   * @param listener
   */
  public removeEventListener(eventName: string, listener: EventCallbackType) {
    this.dispatcher.off(eventName, listener);
  }

  /**
   *
   * @param pageInfo
   */
  public getPageStrokes(pageInfo: IPageSOBP): NeoStroke[] {
    const { section, book, owner, page } = pageInfo;
    const pageId = InkStorage.makeNPageIdStr({ section, book, owner, page });

    const completed = this.completedOnPage;
    const arr = completed.get(pageId);
    if (arr) return arr;

    return [];
  }

  public removeStrokeFromPage(pageInfo: IPageSOBP) {
    const { section, book, owner, page } = pageInfo;
    const pageId = InkStorage.makeNPageIdStr({ section, book, owner, page });

    const completed = this.completedOnPage;
    completed.delete(pageId);
  }
  /**
   *
   * @param pageInfo
   */
  public getPageStrokes_live(pageInfo: IPageSOBP): NeoStroke[] {
    const { section, book, owner, page } = pageInfo;
    const pageId = InkStorage.makeNPageIdStr({ section, book, owner, page });


    /** @type {Map.<string, Map>} - (pageId) ==> (strokeKey ==> NeoStroke) */
    const realtime = this.realtimeOnPage;

    /** @type {Map.<string, NeoStroke>} - (strokeKey) ==> (NeoStroke) */
    const penStrokesMap = realtime.get(pageId);

    if (penStrokesMap) {
      /** @type {Array.<NeoStroke>} */
      const arr = [];
      penStrokesMap.forEach((value) => {
        arr.push(value);
      });

      return arr;
    }

    return [];
  }

  public collisionTest = (pathDataStr: string, line: { x0_pu: number, y0_pu: number, x1_pu: number, y1_pu: number }) => {
    const eraserSvgPathData = 'M ' + line.x0_pu + ' ' + line.y0_pu + ' L ' + line.x1_pu + ' ' + line.y1_pu + 'z';
    var intersection = intersect(eraserSvgPathData, pathDataStr);
    return intersection.length
  }

  public markErased = (stroke: NeoStroke) => {
    stroke.status = StrokeStatus.ERASED;
  }

  /**
   *
   */
  public getLastPageInfo(): IPageSOBP {
    return this.lastPageInfo;
  }

  /**
   *
   * @param stroke
   */
  private addCompletedToPage(stroke: NeoStroke) {
    const { section, book, owner, page } = stroke;
    const pageId = InkStorage.makeNPageIdStr({ section, book, owner, page });
    // console.log( `add completed: ${mac},  ${pageId} = ${section}.${book}.${owner}.${page} `);

    // stroke에 점이 하나라도 있어야 옮긴다.
    if (stroke.dotArray.length > 0) {
      // 배열이 없으면 만들어 준다.

      /** @type {Map.<string, Array.<NeoStroke>>} - (pageId) ==> (NeoStroke[]) */
      const completed = this.completedOnPage;
      if (!completed.has(pageId)) {
        completed.set(pageId, new Array(0));
      }

      // 배열에 넣는다.
      /** @type {Array.<NeoStroke>} */
      const arr = completed.get(pageId);
      arr.push(stroke);

      this.lastPageInfo = { section, book, owner, page };
      // console.log(completed);
    }
  }

  /**
   *
   * @param stroke
   */
  private addRealtimeToPage(stroke: NeoStroke) {
    const { section, book, owner, page, key } = stroke;
    const pageId = InkStorage.makeNPageIdStr({ section, book, owner, page });


    /** @type {Map.<string, Map>} - (pageId) ==> (strokeKey ==> NeoStroke) */
    const realtime = this.realtimeOnPage;
    if (!realtime.has(pageId)) realtime.set(pageId, new Map());

    /** @type {Map.<string, NeoStroke>} - (strokeKey) ==> (NeoStroke) */
    const penStrokesMap = realtime.get(pageId);

    const strokeKey = key;
    penStrokesMap.set(strokeKey, stroke);
  }

  /**
   *
   * @param stroke
   */
  private removeFromRealtime(stroke: NeoStroke) {
    const { section, book, owner, page, key } = stroke;
    const pageId = InkStorage.makeNPageIdStr({ section, book, owner, page });

    /** @type {Map.<string, Map>} - (pageId) ==> (strokeKey ==> NeoStroke) */
    const realtime = this.realtimeOnPage;
    if (realtime.has(pageId)) {
      /** @type {Map.<string, NeoStroke>} - (strokeKey) ==> (NeoStroke) */
      const penStrokesMap = realtime.get(pageId);

      const strokeKey = key;
      penStrokesMap.delete(strokeKey);
    }

    this.realtime[key] = null;
  }


  /**
   *
   * @param info
   */
  static makeNPageIdStr(pageInfo: IPageSOBP): string {
    const { section, book, owner, page } = pageInfo;
    return `${section}.${book}.${owner}.${page}`;
  }

  static getPageSOBP(pageId: string): IPageSOBP {
    const arr = pageId.split(".");
    if (arr.length !== 4) {
      return {
        section: -1,
        owner: -1,
        book: -1,
        page: -1,
      };
    }

    const ret: IPageSOBP = {
      section: parseInt(arr[0]),
      owner: parseInt(arr[1]),
      book: parseInt(arr[2]),
      page: parseInt(arr[3]),
    }

    return ret;
  }

  /**
   * create realtime stroke, wait for "appendDot", ..., "closeStroke"
   * @param mac
   * @param time
   * @param penTipMode
   * @param penColor
   * @param thickness
   */

  public openStroke(args: IOpenStrokeArg): NeoStroke {
    // let stroke = new NeoStroke(mac);

    // let stroke = initStroke(-1 /* section */, -1 /* owner */, -1 /*book */, -1 /* page */, time, mac);
    const { mac, time, thickness, brushType, color } = args;
    const strokeProps: INeoStrokeProps = {
      section: -1,
      owner: -1,
      book: -1,
      page: -1,
      startTime: time,
      mac,
      thickness,
      brushType,
      color,
      status: brushType === IBrushType.ERASER ? StrokeStatus.ERASED : StrokeStatus.NORMAL,
    }

    const stroke = new NeoStroke(strokeProps);
    // stroke.thickness = thickness;     // kitty
    stroke.penTipMode = 0;    // kitty

    // stroke.init(section, owner, book, page, startTime);

    const strokeKey = stroke.key;
    if (this.realtime[strokeKey]) this.realtime[strokeKey] = null;
    this.realtime[strokeKey] = stroke;

    // hand the event
    this.dispatcher.dispatch(PenEventName.ON_PEN_DOWN, { strokeKey, mac, time, stroke });

    return stroke;
  }


  /**
   * create realtime stroke, wait for "appendDot", ..., "closeStroke"
   * @param strokeKey
   * @param section
   * @param owner
   * @param book
   * @param page
   * @param time
   */
  public setStrokeInfo(strokeKey: string, section: number, owner: number, book: number, page: number, time: number) {
    const stroke = this.realtime[strokeKey];
    stroke.section = section;
    stroke.owner = owner;
    stroke.book = book;
    stroke.page = page;

    this.addRealtimeToPage(stroke);

    // hand the event
    this.dispatcher.dispatch(PenEventName.ON_PEN_PAGEINFO, { strokeKey, mac: stroke.mac, stroke, section, owner, book, page, time });
  }

  /**
   *
   * @param strokeKey
   */
  public getRealTimeStroke(strokeKey: string): NeoStroke {
    /** @type {NeoStroke} */
    const stroke = this.realtime[strokeKey];
    if (!stroke) {
      console.error(`stroke was not initiated`);
      return null;
    }

    return stroke;
  }


  /**
   * add dot to the stroke opened
   * @param strokeKey
   * @param dot
   */
  public appendDot(strokeKey: string, dot: NeoDot) {
    /** @type {NeoStroke} */
    const stroke = this.realtime[strokeKey];
    if (!stroke) {
      console.error(`stroke was not initiated`);
      console.error(dot);
      return;
    }

    // strokeAddDot(stroke, dot);
    stroke.addDot(dot);

    // hand the event
    this.dispatcher.dispatch(PenEventName.ON_PEN_MOVE, { strokeKey, mac: stroke.mac, stroke, dot });
  }

  /**
   * close stroke to move to "completed"
   * @param strokeKey
   */
  public closeStroke(strokeKey: string) {
    /** @type {NeoStroke} */
    const stroke = this.realtime[strokeKey];
    if (!stroke) {
      console.error(`stroke was not initiated`);
      return;
    }

    // closeStroke(stroke);
    stroke.close();

    this.completed.push(stroke);

    this.addCompletedToPage(stroke);
    this.removeFromRealtime(stroke);

    // hand the event
    const { mac, section, owner, book, page } = stroke;
    // console.log( `inkStorage: close Stroke event dispatch`);
    this.dispatcher.dispatch(PenEventName.ON_PEN_UP, { strokeKey, mac, stroke, section, owner, book, page });
  }
}