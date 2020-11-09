import "../types";
import { uuidv4 } from "../utils/UtilsFunc";


/**
 *
 * @param {number} section
 * @param {number} owner
 * @param {number} book
 * @param {number} page
 * @param {number} startTime
 * @param {string} [mac]
 *
 * @return {NeoStroke}
 */
export function initStroke(section, owner, book, page, startTime, mac) {
  let sourceId = uuidv4();
  // let strokeKey = sourceId + mac;
  let strokeKey = sourceId;

  /** @type {NeoStroke} */
  let stroke = {
    key: strokeKey,

    section,
    owner,
    book,
    page,

    startTime,
    dotCount: 0,
    dotArray: Array(0),

    opened: true,

    mac,
  };

  return stroke;
}

/**
 * @param {NeoStroke} stroke
 * @param {NeoDot} dot
 */
export function strokeAddDot(stroke, dot) {
  stroke.dotArray.push(dot);
  stroke.dotCount++;
}

/**
 *
 * @param {NeoStroke} stroke
 */
export function closeStroke(stroke) {
  stroke.opened = false;
}


// export default class NeoStroke {
//   /**
//    *
//    * @param {string} [mac]
//    */
//   constructor(mac = "") {
//     let sourceId = uuidv4();
//     let strokeKey = sourceId + mac;

//     this.data = {
//       /** @type {string} */
//       key: strokeKey,

//       /** @type {string} */
//       mac: mac,

//       /** @type {number} */
//       penType: 0,

//       /** @type {number} */
//       color: 0,

//       /** @type {number} */
//       thickness: 0,

//       /** @type {number} */
//       section: 0,

//       /** @type {number} */
//       owner: 0,

//       /** @type {number} */
//       book: 0,

//       /** @type {number} */
//       page: 0,

//       /** @type {Array.<NeoDot>} */
//       dots: [],

//       /** @type {number} */
//       dotCount: 0,

//       /** @type {number} */
//       startTime: 0,

//       /** @type {number} */
//       endTime: 0,
//     }


//     /** @type {boolean} */
//     this.opened = false;
//   }

//   fromObject(data) {
//     this.data = {
//       ...data
//     }

//   }
//   toObject() {
//     return {
//       ...this.data
//     }
//   }

//   /**
//    *
//    * @param {number} section
//    * @param {number} owner
//    * @param {number} book
//    * @param {number} page
//    * @param {number} startTime
//    */
//   init(section, owner, book, page, startTime) {
//     this.data.section = section;
//     this.data.owner = owner;
//     this.data.book = book;
//     this.data.page = page;
//     this.data.startTime = startTime;

//     this.opened = true;
//   }

//   /**
//    *
//    * @param {NeoDot} dot
//    */
//   addDot(dot) {
//     let data = this.data;
//     data.dotArray.push(dot);
//     data.dotCount++;
//   }

//   close() {
//     this.opened = false;
//   }
// }