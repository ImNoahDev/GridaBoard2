// import "../types";
// import { initStroke, strokeAddDot, closeStroke } from "./neostroke";

//   /** @type {PenStorage} */
// let _storage_instance = null;

// export default class PenStorage {
//   /** @type {PenStorage} */
//   // static instance;
//   constructor() {
//     if (_storage_instance) return _storage_instance;

//     /** @type {Array.<NeoStroke>} */
//     this.completed = [];            // completed strokes

//     /** @type {Map.<string, NeoStroke>} - sourceKey ("uuid" + "mac") ==> Stroke */
//     this.realtime = new Map();    // realtime strokes (incompleted strokes)

//     /** @type {Map.<string, Array.<NeoStroke>>} - (pageId) ==> ({penId : NeoStroke[]}) */
//     this.completedOnPage = new Map();

//     /** @type {Map.<string, Map.<string,NeoStroke> >} - (pageId) ==> ({strokeKey : NeoStroke}) */
//     this.realtimeOnPage = new Map();

//     _storage_instance = this;
//   }

//   static getInstance() {
//     if (_storage_instance) return _storage_instance;

//     _storage_instance = new PenStorage();
//     return _storage_instance;
//   }

//   /**
//    * @private
//    * @param {NeoStroke} stroke
//    */
//   addCompletedToPage(stroke) {
//     const { section, book, owner, page } = stroke;
//     const pageId = this.getPageId(section, book, owner, page);
//     // console.log( `add completed: ${mac},  ${pageId} = ${section}.${book}.${owner}.${page} `);

//     // const penId = mac;

//     /** @type {Map.<string, Array.<NeoStroke>>} - (pageId) ==> (NeoStroke[]) */
//     let completed = this.completedOnPage;
//     if (!completed.has(pageId)) {
//       completed.set(pageId, new Array(0));
//     }

//     /** @type {Array.<NeoStroke>} */
//     let arr = completed.get(pageId);
//     arr.push(stroke);

//     console.log(completed);
//   }

//   /**
//    * @private
//    * @param {NeoStroke} stroke
//    */
//   addRealtimeToPage(stroke) {
//     const { section, book, owner, page, key } = stroke;
//     let pageId = this.getPageId(section, book, owner, page);


//     /** @type {Map.<string, Map>} - (pageId) ==> (strokeKey ==> NeoStroke) */
//     let realtime = this.realtimeOnPage;
//     if (!realtime.has(pageId)) realtime.set(pageId, new Map());

//     /** @type {Map.<string, NeoStroke>} - (strokeKey) ==> (NeoStroke) */
//     let penStrokesMap = realtime.get(pageId);

//     const strokeKey = key;
//     penStrokesMap.set(strokeKey, stroke);
//   }

//   /**
//    * @private
//    * @param {NeoStroke} stroke
//    */
//   removeFromRealtime(stroke) {
//     const { section, book, owner, page, key } = stroke;
//     let pageId = this.getPageId(section, book, owner, page);

//     /** @type {Map.<string, Map>} - (pageId) ==> (strokeKey ==> NeoStroke) */
//     let realtime = this.realtimeOnPage;
//     if (realtime.has(pageId)) {
//       /** @type {Map.<string, NeoStroke>} - (strokeKey) ==> (NeoStroke) */
//       let penStrokesMap = realtime.get(pageId);

//       const strokeKey = key;
//       penStrokesMap.delete(strokeKey);
//     }

//     this.realtime[key] = null;
//   }

//   /**
//    * @private
//    * @param {number} section
//    * @param {number} book
//    * @param {number} owner
//    * @param {number} page
//    */
//   getPageId(section, book, owner, page) {
//     return `${section}.${book}.${owner}.${page}`;
//   }

//   /**
//    * create realtime stroke, wait for "appendDot", ..., "closeStroke"
//    * @public
//    * @param {number} section
//    * @param {number} owner
//    * @param {number} book
//    * @param {number} page
//    * @param {number} startTime
//    *
//    * @return {string} strokeKey
//    */
//   openStroke(mac, section, owner, book, page, startTime) {
//     // let stroke = new NeoStroke(mac);

//     let stroke = initStroke(section, owner, book, page, startTime, mac);
//     // stroke.init(section, owner, book, page, startTime);

//     let strokeKey = stroke.key;
//     if (this.realtime[strokeKey]) this.realtime[strokeKey] = null;
//     this.realtime[strokeKey] = stroke;

//     this.addRealtimeToPage(stroke);
//     return strokeKey;
//   }

//   /**
//    * add dot to the stroke opened
//    * @public
//    * @param {string} strokeKey
//    * @param {NeoDot} dot
//    */
//   appendDot(strokeKey, dot) {
//     /** @type {NeoStroke} */
//     let stroke = this.realtime[strokeKey];
//     if (!stroke) {
//       console.error(`stroke was not initiated`);
//       return;
//     }

//     // stroke.addDot(dot);
//     strokeAddDot(stroke, dot);
//   }

//   /**
//    * close stroke to move to "completed"
//    * @public
//    * @param {string} strokeKey
//    */
//   closeStroke(strokeKey) {
//     /** @type {NeoStroke} */
//     let stroke = this.realtime[strokeKey];
//     if (!stroke) {
//       console.error(`stroke was not initiated`);
//       return;
//     }

//     // stroke.close();
//     closeStroke(stroke);

//     this.completed.push(stroke);

//     this.addCompletedToPage(stroke);
//     this.removeFromRealtime(stroke);
//   }

//   getState() {
//     /** @type {Object} */
//     let strokesCountPage = {};
//     this.completedOnPage.forEach((strokes, pageId) => {
//       strokesCountPage[pageId] = strokes.length;
//     });

//     let stokresCountRealtime = {};
//     this.realtimeOnPage.forEach((strokeMap, pageId) => {

//       let dotCount = {};
//       strokeMap.forEach((stroke, strokeKey) => {
//         dotCount[strokeKey] = stroke.dotCount;
//       });

//       stokresCountRealtime[pageId] = {
//         stroke_count: strokeMap.size,
//         dot_count: dotCount,
//       };
//     });
//   }
// }