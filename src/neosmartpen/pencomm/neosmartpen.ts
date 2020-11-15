import PenComm, { deviceSelectDlg } from "./pencomm";
import InkStorage from "../penstorage/InkStorage";
import { paperInfo } from "../noteserver/PaperInfo";
import Dispatcher from "../penstorage/EventSystem";
import PenManager from "./PenManager";
import "../types";
import { IPenEvent } from "../DataStructure/Structures";
import { NeoStroke, PEN_STATE, PenEventName } from "../DataStructure";
import { IWritingSurfaceInfo } from "../DataStructure/Structures";



interface IPenMovement {
  downEvent: IPenEvent,
  infoEvent: IPenEvent,
  moveEvents: IPenEvent[],
  upEvent: IPenEvent,
  numMovement: number,
  stroke: NeoStroke,

}

export class NeoSmartpen {
  currPenMovement: IPenMovement = {
    downEvent: null,
    infoEvent: null,
    moveEvents: [],
    upEvent: null,
    numMovement: 0,
    stroke: null,
  };

  lastInfoEvent: IPenEvent = null;
  protocolHandler: PenComm = new PenComm(this);
  mac: string = null;
  lastState: PEN_STATE = PEN_STATE.NONE;
  surfaceInfo: IWritingSurfaceInfo = {
    section: 3,
    owner: 27,
    book: 168,
    Xmin: 3.12,
    Ymin: 3.12,
    Xmax: 91.68,
    Ymax: 128.36,
    Mag: 1,
  }

  storage: InkStorage = InkStorage.getInstance();
  manager: PenManager = PenManager.getInstance();
  dispatcher: Dispatcher = new Dispatcher();


  /**
   *
   * @param customStorage
   */
  constructor(customStorage: InkStorage = null) {
    // this.appPen = appPenHandler;
    if (customStorage) {
      console.log("use custom Ink Storage");
      this.storage = customStorage;
    }
    else {
      console.log("use default Ink Storage");
      this.storage = InkStorage.getInstance();
    }

  }

  /**
   *
   */
  getMac = (): string => {
    return this.mac;
  }


  /**
   *
   */
  getBtDevice = (): BluetoothDevice => {
    return this.protocolHandler.getBtDevice();
  }


  /**
   *
   */
  async connect(): Promise<boolean> {
    let device = await deviceSelectDlg();

    if (this.manager.alreadyConnected(device)) {
      console.error(`bluetooth device(id:${device.id}) already connectged or connecting process is being processed`);
      return false;
    }

    if (device) {
      this.protocolHandler.connect(device);
      this.manager.add(this, device);
    }
    else {
      console.error("Device NULL");
      return false;
    }

    return true;
  }


  /**
   *
   * @param device
   */
  async connectByWebBtDevice(device: BluetoothDevice) {
    this.protocolHandler.connect(device);
  }


  /**
   *
   * @param mac
   */
  async connectByMacAddress(mac: string) {
    throw new Error(`connectByMacAddress() not implemented yet.`);
  }

  /**
   *
   */
  resetPenStroke = () => {
    // let { currPenMovement} = this;
    let p = this.currPenMovement;

    p.downEvent = null;
    p.infoEvent = null;
    p.numMovement = 0;
    p.moveEvents = [];
    p.upEvent = null;
  }


  /**
   *
   * @param event
   */
  onPenDown = (event: IPenEvent) => {
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
    let stroke = this.storage.openStroke(mac, time, event.penTipMode, event.color);


    let strokeKey = stroke.key;
    this.currPenMovement.stroke = stroke;

    console.log(`NeoSmartpen dispatch event ON_PEN_DOWN`);
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
   *
   * @param event
   * @param hover
   */
  onPageInfo = (event: IPenEvent, hover: boolean) => {
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
   * @param event
   */
  private adjustPaperXminYmin = (event: IPenEvent) => {
    event.x -= this.surfaceInfo.Xmin;
    event.y -= this.surfaceInfo.Ymin;

    return event;
  }

  /**
   * pen down 상태에서 움직임
   * @param event
   */
  onPenMove = (event: IPenEvent) => {
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
   * @param event
   */
  onHoverMove = (event: IPenEvent) => {
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
    this.dispatcher.dispatch(PenEventName.ON_HOVER_MOVE, { pen: this, mac, event });
  }

  /**
   * pen up
   * @param event
   */
  onPenUp = (event: IPenEvent) => {
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
    this.dispatcher.dispatch(PenEventName.ON_PEN_UP, { strokeKey, mac, pen: this, stroke, section, owner, book, page });

    this.resetPenStroke();
  }

  /**
   * ncode error
   * @param event
   */
  onNcodeError = (event: IPenEvent) => {
    // console.log(event);

    // let ph = this.appPen;
    // ph.onNcodeError(event);
    let mac = this.mac;
    if (!mac) {
      throw new Error("mac address was not registered");
    }

    this.manager.onNcodeError({ pen: this, event });
    this.dispatcher.dispatch(PenEventName.ON_NCODE_ERROR, { pen: this, mac, event });
  }



  /**
   *
   * @param event
   */
  onPasscodeRequired = (event: IPenEvent) => {
    console.log("onPasscodeRequired" + event);
    let passcode = prompt("please enter passcode " + (9 - event.retryCount));
    this.protocolHandler.sendPasscode(passcode);

    let mac = this.protocolHandler.getMac();
    if (!mac) {
      throw new Error("mac address was not registered");
    }
    this.dispatcher.dispatch(PenEventName.ON_PW_REQUIRED, { pen: this, mac, event });
    // throw new Error("Not implemented: onPasscodeRequired");
  }



  /**
   *
   * @param event
   */
  onConnected = (event: IPenEvent) => {
    // let ph = this.appPen;
    // ph.onConnected(event);

    console.log("CONNECTED");
    let mac = this.protocolHandler.getMac();
    this.mac = mac;
    console.log(`Connected: ${mac}`);

    this.manager.onConnected({ pen: this, event });
    this.dispatcher.dispatch(PenEventName.ON_CONNECTED, { pen: this, mac, event });
  }


  /**
   *
   * @param event
   */
  onFirmwareUpgradeNeeded = (event: IPenEvent) => {
    // let ph = this.appPen;
    // ph.onFirmwareUpgradeNeeded(event);

    let mac = this.mac;
    if (!mac) {
      throw new Error("mac address was not registered");
    }
    this.dispatcher.dispatch(PenEventName.ON_UPGRADE_NEEDED, { pen: this, mac, event });
  }


  /**
   *
   * @param event
   */
  onDisconnected = (event: IPenEvent) => {
    // let event = makePenEvent(DeviceTypeEnum.PEN, PenEventEnum.ON_DISCONNECTED);
    // let ph = this.appPen;
    // ph.onDisconnected(event);
    let mac = this.mac;
    if (!mac) {
      throw new Error("mac address was not registered");
    }

    this.manager.onDisconnected({ pen: this, event });
    this.dispatcher.dispatch(PenEventName.ON_DISCONNECTED, { pen: this, mac, event });
  }



  /**
   *
   * @param eventName
   * @param listener
   */
  public addEventListener(eventName: PenEventName, listener: Function) {
    if (eventName === PenEventName.ON_PEN_DOWN) {
      console.log(`NeoSmartpen: addEventListener ${eventName}`);
    }

    this.dispatcher.on(eventName, listener, null);
  }


  /**
   *
   * @param eventName
   * @param listener
   */
  public removeEventListener(eventName: PenEventName, listener: Function) {
    this.dispatcher.off(eventName, listener);
  }
}
