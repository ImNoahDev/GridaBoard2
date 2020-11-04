import PenComm, { deviceSelectDlg } from "./pencomm";
import InkStorage from "../penstorage/InkStorage";
import { paperInfo } from "../noteserver/PaperInfo";
import Dispatcher from "../penstorage/EventSystem";
import "../types";

/** @enum {string} */
export const PenEventName = {
  ON_PEN_DOWN: "pendown",
  ON_PEN_PAGEINFO: "penpageinfo",
  ON_PEN_HOVER_PAGEINFO: "hoverpageinfo",
  ON_PEN_MOVE: "penmove",
  ON_PEN_UP: "penup",
  ON_HOVER_MOVE: "hovermove",

  ON_NCODE_ERROR: "error",
  ON_PW_REQUIRED: "pw_req",
  ON_CONNECTED: "connected",
  ON_DISCONNECTED: "disconnected",

  ON_UPGRADE_NEEDED: "fw_up",
};


/** @enum {number} */
const PEN_STATE = {
  NONE: 0,
  PEN_DOWN: 1,
  PEN_MOVE: 2,
  PEN_UP: 9,

  HOVER_MOVE: 101,
};

export class NeoSmartpen {

  /**
   * @param {InkStorage} customStorage
   */
  constructor(customStorage) {
    this.currPenMovement = {
      /** @type {PenEvent} */
      downEvent: null,

      /** @type {PenEvent} */
      infoEvent: null,

      /** @type {Array.<PenEvent>} */
      moveEvents: [],

      /** @type {PenEvent} */
      upEvent: null,

      /** @type {number} */
      numMovement: 0,

      /** @type {NeoStroke} */
      stroke: null,
    };

    this.lastInfoEvent = null;

    /** @type {PenComm} */
    this.protocolHandler = new PenComm(this);

    // this.appPen = appPenHandler;

    /** @type {InkStorage} */
    this.storage = null;

    if (customStorage) {
      console.log("use custom Ink Storage");
      this.storage = customStorage;
    }
    else {
      console.log("use default Ink Storage");
      this.storage = InkStorage.getInstance();
    }

    /** @type {string} */
    this.mac = null;

    /** @type {PEN_STATE} */
    this.lastState = PEN_STATE.NONE;

    /** @type {{section?:number, owner?:number, book?:Array.<number>, Xmin:number, Ymin:number, Xmax:number, Ymax:number, Mag?:number}} */
    this.surfaceInfo = {
      section: 3,
      owner: 27,
      book: [168],
      Xmin: 3.12,
      Ymin: 3.12,
      Xmax: 91.68,
      Ymax: 128.36,
      Mag: 1,
    }


    this.dispatcher = new Dispatcher();
  }

  /**
   * @return {string}
   */
  getMac = () => {
    return this.mac;
  }

  /**
   *
   */
  async connect() {
    let device = await deviceSelectDlg();

    if (device) {
      this.protocolHandler.connect(device);
    }
    else {
      console.error("Device NULL");
    }
  }


  /**
   *
   * @param {BluetoothDevice} device
   */
  async connectByWebBtDevice(device) {
    this.protocolHandler.connect(device);
  }

  /**
   *
   * @param {string} mac
   */
  async connectByMacAddress(mac) {
    throw new Error('connectByMacAddress() not implemented.');
  }

  /**
   *
   */
  resetPenStroke = () => {
    // let { currPenMovement} = this;
    let p = this.currPenMovement;

    p.downEvent = null;
    p.infoEvnet = null;
    p.numMovement = 0;
    p.moveEvents = [];
    p.upEvent = null;
  }


  /**
   *
   * @param {PenEvent} event
   */
  onPenDown = (event) => {
    this.resetPenStroke();
    this.currPenMovement.downEvent = event;
    this.lastState = PEN_STATE.PEN_DOWN;

    // console.log(event);

    // storage에 저장
    if (!this.storage) {
      console.error("Ink Storage has not been initialized");
    }

    let mac = this.mac;
    let time = event.timeStamp;
    let stroke = this.storage.openStroke(mac, time, event.penType, event.color);


    let strokeKey = stroke.key;
    this.currPenMovement.stroke = stroke;
    this.dispatcher.dispatch(PenEventName.ON_PEN_DOWN, { strokeKey, mac, time, stroke });


    // event 전달
    // let ph = this.appPen;
    // ph.onPenDown(event);
  }

  /**
   * 펜의 움직임
   *    1) down/up이 있는 경우: DOWN -> INFO -> MOVE -> MOVE -> ... -> UP -> INFO와 같이 나옴
   *    2) hove의 경우: (페이지가 바뀌면) INFO -> HOVER_MOVE -> HOVER_MOVE...
   *
   * pen down 된 후의 page info, 실질적으로 pen_down과 같음
   * @param {PenEvent} event
   * @param {boolean} hover - hover or not
   */
  onPageInfo = (event, hover) => {
    // console.log(event);
    this.lastInfoEvent = event;


    // margin 값을 가져오기 위해서
    let info = paperInfo.getPaperInfo({ section: event.section, book: event.book, owner: event.owner, page: event.page });
    if (info) this.surfaceInfo = info;

    // 이전에 펜 down이 있었으면
    if (this.lastState === PEN_STATE.PEN_DOWN) {
      this.currPenMovement.infoEvent = event;
      // this.currPenMovement.infoEvent = {
      //   section: event.section,
      //   owner: event.owner,
      //   book: event.book,
      //   page: event.page,

      //   ...event,
      // };

      if (!this.storage) {
        console.error("Ink Storage has not been initialized");
      }
      else {
        const { section, owner, book, page, timeStamp } = event;
        let mac = this.mac;
        if (!mac) {
          throw new Error("mac address was not registered");
        }

        if (!hover) {
          // storage에 저장
          let stroke = this.currPenMovement.stroke;
          let strokeKey = stroke.key;
          this.storage.setStrokeInfo(strokeKey, section, owner, book, page, timeStamp);

          // hand pen page the event
          this.dispatcher.dispatch(PenEventName.ON_PEN_PAGEINFO, {
            strokeKey, mac, stroke, section, owner, book, page,
            time: event.timeStamp
          });

        }
        else {
          // hand hover page the event
          this.dispatcher.dispatch(PenEventName.ON_PEN_HOVER_PAGEINFO, {
            mac, section, owner, book, page, time: event.timeStamp
          });

        }
      }

      // let ph = this.appPen;
      // ph.onPageInfo(event);
    }

    // event 전달
    // let ph = this.appPen;
    // if (hover) ph.onHoverPageInfo(event);

    return;
  }


  /**
   * 종이 정보로부터 펜의 좌표를 보정
   * @private
   * @param {PenEvent} event
   */
  adjustPaperXminYmin = (event) => {
    event.x -= this.surfaceInfo.Xmin;
    event.y -= this.surfaceInfo.Ymin;

    return event;
  }

  /**
   * pen down 상태에서 움직임
   * @param {PenEvent} event
   */
  onPenMove = (event) => {
    this.lastState = PEN_STATE.PEN_MOVE;

    // margin을 paperInfo의 Xmin, Ymin 값에 따라 조정
    // event = this.adjustPaperXminYmin(event);

    // 기존의 방식에서는 처리하지 않았던 것, redundant할 수 있다.
    if (this.currPenMovement.infoEvent) {
      event.owner = this.currPenMovement.infoEvent.owner;
      event.book = this.currPenMovement.infoEvent.book;
      event.page = this.currPenMovement.infoEvent.page;
    } else {
      /**
       * 종이에 터치되지 않고 들어오는 호버 이벤트
       *
       */
      event.owner = -1;
      event.book = -1;
      event.page = -1;
      // let srcLine = getFunctionName();
      // console.error(`Get PEN_MOVE without PEN_INFO ${srcLine}`);
      // throw new Error( `Get PEN_MOVE without PEN_INFO`);
    }

    this.currPenMovement.numMovement++;
    event.isFirstDot = (this.currPenMovement.numMovement === 1);

    // storage에 저장
    if (!this.storage) {
      console.error("Ink Storage has not been initialized");
    }

    let dot = {
      dotType: 2,   // moving
      deltaTime: event.timediff,
      time: event.timeStamp,
      f: event.force,
      x: event.x,
      y: event.y,
    };

    let stroke = this.currPenMovement.stroke;
    let strokeKey = stroke.key;
    this.storage.appendDot(strokeKey, dot);

    // hand the event
    this.dispatcher.dispatch(PenEventName.ON_PEN_MOVE, { strokeKey, mac: stroke.mac, stroke, dot });

    // 이벤트 전달
    // console.log("    -> onPenMove" + event);
    // let ph = this.appPen;
    // ph.onPenMove(event);
  }

  /**
   * hover 상태에서 움직임
   * @param {PenEvent} event
   */
  onHoverMove = (event) => {
    this.lastState = PEN_STATE.HOVER_MOVE;

    // margin을 paperInfo의 Xmin, Ymin 값에 따라 조정
    // event = this.adjustPaperXminYmin(event);


    // console.log("    -> onHoverMove" + event);
    // let ph = this.appPen;
    // ph.onHoverMove(event);
    let mac = this.mac;
    if (!mac) {
      throw new Error("mac address was not registered");
    }
    this.dispatcher.dispatch(PenEventName.ON_HOVER_MOVE, { mac, event });
  }

  /**
   * pen up
   * @param {PenEvent} event
   */
  onPenUp = (event) => {
    this.lastState = PEN_STATE.PEN_UP;

    this.currPenMovement.upEvent = event;

    // storage에 저장
    if (!this.storage) {
      console.error("Ink Storage has not been initialized");
    }

    let stroke = this.currPenMovement.stroke;
    let strokeKey = stroke.key;
    this.storage.closeStroke(strokeKey);

    const { mac, section, owner, book, page } = stroke;
    this.dispatcher.dispatch(PenEventName.ON_PEN_UP, { strokeKey, mac, stroke, section, owner, book, page });

    this.resetPenStroke();
  }

  /**
   * pen up
   * @param {PenEvent} event
   */
  onNcodeError = (event) => {
    // console.log(event);

    // let ph = this.appPen;
    // ph.onNcodeError(event);
    let mac = this.mac;
    if (!mac) {
      throw new Error("mac address was not registered");
    }
    this.dispatcher.dispatch(PenEventName.ON_NCODE_ERROR, { mac, event });
  }



  /**
   * pen up
   * @param {PenEvent} event
   */
  onPasscodeRequired = (event) => {
    console.log("onPasscodeRequired" + event);
    let passcode = prompt("please enter passcode " + (9 - event.retryCount));
    this.protocolHandler.sendPasscode(passcode);

    let mac = this.mac;
    if (!mac) {
      throw new Error("mac address was not registered");
    }
    this.dispatcher.dispatch(PenEventName.ON_PW_REQUIRED, { mac, event });
    // throw new Error("Not implemented: onPasscodeRequired");
  }


  /**
   *
   * @param {PenEvent} event
   */
  onConnected = (event) => {
    // let ph = this.appPen;
    // ph.onConnected(event);

    console.log("CONNECTED");
    let mac = this.protocolHandler.getMac();
    this.mac = mac;

    this.dispatcher.dispatch(PenEventName.ON_CONNECTED, { mac, event });
  }

  /**
   *
   * @param {PenEvent} event
   */
  onFirmwareUpgradeNeeded = (event) => {
    // let ph = this.appPen;
    // ph.onFirmwareUpgradeNeeded(event);

    let mac = this.mac;
    if (!mac) {
      throw new Error("mac address was not registered");
    }
    this.dispatcher.dispatch(PenEventName.ON_UPGRADE_NEEDED, { mac, event });
  }

  /**
   *
   * @param {PenEvent} event
   */
  onDisconnected = (event) => {
    // let event = makePenEvent(DeviceTypeEnum.PEN, PenEventEnum.ON_DISCONNECTED);
    // let ph = this.appPen;
    // ph.onDisconnected(event);
    let mac = this.mac;
    if (!mac) {
      throw new Error("mac address was not registered");
    }
    this.dispatcher.dispatch(PenEventName.ON_DISCONNECTED, { mac, event });
  }



  /**
 * @public
 * @param {string} eventName 
 * @param {function} listener 
 */
  addEventListener(eventName, listener) {
    console.log("bound", listener);
    this.dispatcher.on(eventName, listener);
  }

  /**
   * @public
   * @param {string} eventName 
   * @param {function} listener 
   */
  removeEventListener(eventName, listener) {
    this.dispatcher.off(eventName, listener);
  }
}


// /**
//  * Interface class, please derive property functions
//  * @class NeopenInterface
//  * @property {function(PenEvent)} onPenDown
//  * @property {function(PenEvent)} onPageInfo
//  * @property {function(PenEvent)} onHoverPageInfo
//  * @property {function(PenEvent)} onPenMove
//  * @property {function(PenEvent)} onHoverMove
//  * @property {function(PenEvent)} onPenUp
//  *
//  * @property {function(PenEvent)} onNcodeError
//  * @property {function(PenEvent)} onPasscodeRequired
//  * @property {function(PenEvent)} onConnected
//  * @property {function(PenEvent)} onFirmwareUpgradeNeeded
//  * @property {function(PenEvent)} onDisconnected
//  */
// export class NeopenInterface {
//   /**
//    *
//    * @param {PenEvent} event
//    */
//   onPenDown(event) {
//     console.log(`onPenDown`);
//     throw new Error('onPenDown() should be implemented.');
//   }

//   /**
//    *
//    * @param {PenEvent} event
//    */
//   onPageInfo(event) {
//     throw new Error('onPageInfo() should be implemented.');
//   }


//   /**
//    *
//    * @param {PenEvent} event
//    */
//   onHoverPageInfo(event) {
//   }


//   /**
//    *
//    * @param {PenEvent} event
//    */
//   onPenMove(event) {
//     throw new Error('onPenMove() should be implemented.');
//   }


//   /**
//    *
//    * @param {PenEvent} event
//    */
//   onHoverMove(event) {
//     throw new Error('onHoverMove() should be implemented.');
//   }

//   /**
//    *
//    * @param {PenEvent} event
//    */
//   onPenUp(event) {
//     throw new Error('onPenUp() should be implemented.');

//   }

//   /**
//    *
//    * @param {PenEvent} event
//    */
//   onNcodeError(event) {
//   }


//   /**
//    *
//    * @param {PenEvent} event
//    */
//   onPasscodeRequired(event) {
//     throw new Error('onPasscodeRequired() should be implemented.');
//   }

//   /**
//    *
//    * @param {PenEvent} event
//    */
//   onConnected(event) {
//     throw new Error('onConnected() should be implemented.');

//   }

//   /**
//    *
//    * @param {PenEvent} event
//    */
//   onFirmwareUpgradeNeeded(event) {
//     throw new Error('onFirmwareUpgradeNeeded() should be implemented.');
//   }

//   /**
//    *
//    * @param {PenEvent} event
//    */
//   onDisconnected(event) {
//     throw new Error('onDisconnected() should be implemented.');

//   }

// }
