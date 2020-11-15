import "../types";
// import { initStroke, strokeAddDot, closeStroke } from "./neostroke";
import { NeoStroke, NeoDot, PenEventName } from "../DataStructure";
import { IPageSOBP } from "../DataStructure/Structures";
import Dispatcher from "./EventSystem";

/** @type {InkStorage} */
let _storage_instance = null;




export default class InkStorage {
  completed: NeoStroke[];
  realtime: Map<string, NeoStroke>;
  completedOnPage: Map<string, NeoStroke[]>;

  realtimeOnPage: Map<string, Map<string, NeoStroke>>;

  _storage_instance: InkStorage;
  dispatcher: Dispatcher;

  lastPageInfo: IPageSOBP;


  /** @type {InkStorage} */
  // static instance;
  constructor() {
    if (_storage_instance) return _storage_instance;

    /** @type {Array.<NeoStroke>} */
    this.completed = [];            // completed strokes

    /** @type {Map.<string, NeoStroke>} - sourceKey ("uuid" + "mac") ==> Stroke */
    this.realtime = new Map();    // realtime strokes (incompleted strokes)

    /** @type {Map.<string, Array.<NeoStroke>>} - (pageId) ==> ({penId : NeoStroke[]}) */
    this.completedOnPage = new Map();

    /** @type {Map.<string, Map.<string,NeoStroke> >} - (pageId) ==> ({strokeKey : NeoStroke}) */
    this.realtimeOnPage = new Map();

    _storage_instance = this;

    this.dispatcher = new Dispatcher();

    /** @type {{section:number, book:number, owner:number, page:number}} */
    this.lastPageInfo = { section: -1, book: -1, owner: -1, page: -1 };

  }

  /**
   * @return {InkStorage}
   */
  static getInstance(): InkStorage {
    if (_storage_instance) return _storage_instance;

    _storage_instance = new InkStorage();
    return _storage_instance;
  }

  /**
   * @public
   * @param {string} eventName
   * @param {function} listener
   * @param {{mac:string}} filter
   */
  addEventListener(eventName: string, listener: Function, filter: any) {
    this.dispatcher.on(eventName, listener, filter);
    console.log("bound", listener);
  }

  /**
   * @public
   * @param {string} eventName
   * @param {function} listener
   */
  removeEventListener(eventName: string, listener: Function) {
    this.dispatcher.off(eventName, listener);
  }


  /**
   * @public
   * @param {{section:number, owner:number, book:number, page:number}} pageInfo
   * @return {Array.<NeoStroke>}
   */
  getPageStrokes(pageInfo: IPageSOBP): NeoStroke[] {
    const { section, book, owner, page } = pageInfo;
    const pageId = InkStorage.getPageId({ section, book, owner, page });

    let completed = this.completedOnPage;
    let arr = completed.get(pageId);
    if (arr) return arr;

    return [];
  }

  /**
   * @public
   * @param {{section:number, owner:number, book:number, page:number}} pageInfo
   * @return {Array.<NeoStroke>}
   */
  getPageStrokes_live(pageInfo: IPageSOBP): NeoStroke[] {
    const { section, book, owner, page } = pageInfo;
    const pageId = InkStorage.getPageId({ section, book, owner, page });


    /** @type {Map.<string, Map>} - (pageId) ==> (strokeKey ==> NeoStroke) */
    let realtime = this.realtimeOnPage;

    /** @type {Map.<string, NeoStroke>} - (strokeKey) ==> (NeoStroke) */
    let penStrokesMap = realtime.get(pageId);

    if (penStrokesMap) {
      /** @type {Array.<NeoStroke>} */
      let arr = [];
      penStrokesMap.forEach((value, key) => {
        arr.push(value);
      });

      return arr;
    }

    return [];
  }

  /**
   * @public
   * @return {{section:number, owner:number, book:number, page:number}}
   */
  getLastPageInfo(): IPageSOBP {
    return this.lastPageInfo;
  }


  /**
   * @private
   * @param {NeoStroke} stroke
   */
  addCompletedToPage(stroke: NeoStroke) {
    const { section, book, owner, page } = stroke;
    const pageId = InkStorage.getPageId({ section, book, owner, page });
    // console.log( `add completed: ${mac},  ${pageId} = ${section}.${book}.${owner}.${page} `);

    // stroke에 점이 하나라도 있어야 옮긴다.
    if (stroke.dotArray.length > 0) {
      // 배열이 없으면 만들어 준다.

      /** @type {Map.<string, Array.<NeoStroke>>} - (pageId) ==> (NeoStroke[]) */
      let completed = this.completedOnPage;
      if (!completed.has(pageId)) {
        completed.set(pageId, new Array(0));
      }

      // 배열에 넣는다.
      /** @type {Array.<NeoStroke>} */
      let arr = completed.get(pageId);
      arr.push(stroke);

      this.lastPageInfo = { section, book, owner, page };
      // console.log(completed);
    }
  }

  /**
   * @private
   * @param {NeoStroke} stroke
   */
  addRealtimeToPage(stroke: NeoStroke) {
    const { section, book, owner, page, key } = stroke;
    let pageId = InkStorage.getPageId({ section, book, owner, page });


    /** @type {Map.<string, Map>} - (pageId) ==> (strokeKey ==> NeoStroke) */
    let realtime = this.realtimeOnPage;
    if (!realtime.has(pageId)) realtime.set(pageId, new Map());

    /** @type {Map.<string, NeoStroke>} - (strokeKey) ==> (NeoStroke) */
    let penStrokesMap = realtime.get(pageId);

    const strokeKey = key;
    penStrokesMap.set(strokeKey, stroke);
  }

  /**
   * @private
   * @param {NeoStroke} stroke
   */
  removeFromRealtime(stroke: NeoStroke) {
    const { section, book, owner, page, key } = stroke;
    let pageId = InkStorage.getPageId({ section, book, owner, page });

    /** @type {Map.<string, Map>} - (pageId) ==> (strokeKey ==> NeoStroke) */
    let realtime = this.realtimeOnPage;
    if (realtime.has(pageId)) {
      /** @type {Map.<string, NeoStroke>} - (strokeKey) ==> (NeoStroke) */
      let penStrokesMap = realtime.get(pageId);

      const strokeKey = key;
      penStrokesMap.delete(strokeKey);
    }

    this.realtime[key] = null;
  }

  /**
   * @static
   * @param {IPageSOBP} info
   * @return {string}
   */
  static getPageId(info: IPageSOBP): string {
    const { section, book, owner, page } = info;
    return `${section}.${book}.${owner}.${page}`;
  }


  /**
   * create realtime stroke, wait for "appendDot", ..., "closeStroke"
   * @public
   * @param {string} mac
   * @param {number} time
   *
   * @return {NeoStroke}
   */
  openStroke(mac: string, time: number, penType: number, penColor: number): NeoStroke {
    // let stroke = new NeoStroke(mac);

    // let stroke = initStroke(-1 /* section */, -1 /* owner */, -1 /*book */, -1 /* page */, time, mac);
    let stroke = new NeoStroke(-1 /* section */, -1 /* owner */, -1 /*book */, -1 /* page */, time, mac);
    stroke.color = penColor;
    stroke.thickness = 1;     // kitty
    stroke.penTipMode = 0;    // kitty

    // stroke.init(section, owner, book, page, startTime);

    let strokeKey = stroke.key;
    if (this.realtime[strokeKey]) this.realtime[strokeKey] = null;
    this.realtime[strokeKey] = stroke;

    // hand the event
    this.dispatcher.dispatch(PenEventName.ON_PEN_DOWN, { strokeKey, mac, time, stroke });

    return stroke;
  }


  /**
   * create realtime stroke, wait for "appendDot", ..., "closeStroke"
   * @public
   * @param {string} strokeKey
   * @param {number} owner
   * @param {number} book
   * @param {number} page
   * @param {number} time
   */
  setStrokeInfo(strokeKey: string, section: number, owner: number, book: number, page: number, time: number) {
    let stroke = this.realtime[strokeKey];
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
   * @param {string} strokeKey
   * @return {NeoStroke}
   */
  getRealTimeStroke(strokeKey: string): NeoStroke {
    /** @type {NeoStroke} */
    let stroke = this.realtime[strokeKey];
    if (!stroke) {
      console.error(`stroke was not initiated`);
      return null;
    }

    return stroke;
  }


  /**
   * add dot to the stroke opened
   * @public
   * @param {string} strokeKey
   * @param {NeoDot} dot
   */
  appendDot(strokeKey: string, dot: NeoDot) {
    /** @type {NeoStroke} */
    let stroke = this.realtime[strokeKey];
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
   * @public
   * @param {string} strokeKey
   */
  closeStroke(strokeKey: string) {
    /** @type {NeoStroke} */
    let stroke = this.realtime[strokeKey];
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
    this.dispatcher.dispatch(PenEventName.ON_PEN_UP, { strokeKey, mac, stroke, section, owner, book, page });
  }

  // getState() {
  //   /** @type {Object} */
  //   let strokesCountPage = {};
  //   this.completedOnPage.forEach((strokes, pageId) => {
  //     strokesCountPage[pageId] = strokes.length;
  //   });

  //   let stokresCountRealtime = {};
  //   this.realtimeOnPage.forEach((strokeMap, pageId) => {

  //     let dotCount = {};
  //     strokeMap.forEach((stroke, strokeKey) => {
  //       dotCount[strokeKey] = stroke.dotCount;
  //     });

  //     stokresCountRealtime[pageId] = {
  //       stroke_count: strokeMap.size,
  //       dot_count: dotCount,
  //     };
  //   });
  // }
}