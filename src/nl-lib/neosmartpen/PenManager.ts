import $ from "jquery";
import { EventDispatcher, EventCallbackType } from "../common/event";
import { IBrushType, PenEventName } from "../common/enums";
import { IPenEvent } from "../common/structures";


import ThemeManager from "../../styles/ThemeManager"
import { INeoSmartpen, IPenToViewerEvent } from "../common/neopen/INeoSmartpen";
import NeoSmartpen from "./NeoSmartpen";
import { IPenManager } from "../common/neopen/IPenManager";
import VirtualPen from "./VirtualPen";
import { sprintf } from "sprintf-js";


let _penmanager_instance = null as PenManager;
let _active_pen: INeoSmartpen = null;



export const DEFAULT_PEN_COLOR_NUM = 3;
export const DEFAULT_PEN_THICKNESS = 2;
export const DEFAULT_PEN_RENDERER_TYPE: IBrushType = IBrushType.PEN;



export default class PenManager {
  penArray: { id: string, mac: string, pen: INeoSmartpen, connected: boolean }[] = new Array(0);

  /** @type {Array.<StorageRenderer>} */
  // render = [];

  pen_colors: string[] = [
    "rgb(255,2,0)", // 0 DARK_GARY #FFAAAAAA #A9A9A9
    "rgb(229,229,229)", // 1 RED #FFFF0200 #FF0000  rgb(255, 0, 0, 0)
    "rgb(151,151,151)", // 2 YELLOW #FFFFD001 #FFFF02
    "rgb(0,0,0)", // 3 NAVY #FF012EE2 #000080

    "rgb(108,0,226)", // 4 BLACK #FF000000 #000000

    "rgb(240,168,60)", // 5 LIGHT_GRAY #FFE5E5E5 #D3D3D3
    "rgb(0,171,235)", // 6 ORANGE #FFFF6500 #FFA500
    "rgb(60,221,0)", // 7 GREEN #FF3CDD00 #008000

    "rgb(255,208,1)", // 8 BLUE #FF00ABEB #0000FF
    "rgb(255,101,0)", // 9 PURPLE #FF6C00E2 #800080
    "rgb(255,2,0)" // 10 DARK_GARY #FFAAAAAA #A9A9A9
  ];

  marker_colors: string[] = [
    "rgb(217, 217, 224)", // 0
    "rgb(214, 215, 228)", // 1
    "rgb(191, 192, 205)", // 2
    "rgb(145, 146, 159)", // 3

    "rgb(178, 146, 227)", // 4

    "rgb(217, 197, 177)", // 5
    "rgb(145, 198, 230)", // 6
    "rgb(163, 213, 159)", // 7

    "rgb(222, 209, 159)", // 8
    "rgb(222, 176, 159)", // 9
    "rgb(222, 147, 159)" // 10
  ];

  color: string = this.pen_colors[DEFAULT_PEN_COLOR_NUM];
  thickness: number = DEFAULT_PEN_THICKNESS;
  penRendererType: IBrushType = DEFAULT_PEN_RENDERER_TYPE;


  dispatcher: EventDispatcher = new EventDispatcher();

  virtualPenSerial = 0;

  _virtualPen: INeoSmartpen;

  init = () => {
    this.setThickness(DEFAULT_PEN_THICKNESS);
    this.setPenRendererType(DEFAULT_PEN_RENDERER_TYPE);
    this.setColor(DEFAULT_PEN_COLOR_NUM);
  }

  getColorNum = (color: string) => {
    const index = this.pen_colors.findIndex((c) => c == color);
    return index;
  }

  constructor() {
    if (_penmanager_instance) return _penmanager_instance;


  }

  static getInstance() {
    if (_penmanager_instance) return _penmanager_instance;

    _penmanager_instance = new PenManager();
    return _penmanager_instance;
  }

  get virtualPen() {
    if (!this._virtualPen) {
      this._virtualPen = this.createVirtualPen();
    }

    return this._virtualPen;
  }

  /**
   *
   */
  public createPen = (): INeoSmartpen => {
    const pen = new NeoSmartpen();
    pen.addEventListener(PenEventName.ON_CONNECTED, this.onConnected);
    pen.addEventListener(PenEventName.ON_DISCONNECTED, this.onDisconnected);
    pen.addEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo);

    return pen;
  }

  public createVirtualPen = (): INeoSmartpen => {
    const pen = new VirtualPen();
    this.add(pen, { id: pen.id });
    this.setActivePen(pen.id);
    this.virtualPenSerial++;

    return pen;
  }


  onLivePenPageInfo = (event: IPenToViewerEvent) => {
    this.dispatcher.dispatch(PenEventName.ON_PEN_PAGEINFO, event);
  }

  /**
   *
   * @param pen
   * @param device
   */
  public add = (pen: INeoSmartpen, device: { id: string }) => {
    console.log(device);
    this.penArray.push({
      id: device.id,
      mac: pen.getMac(),
      pen,
      connected: false
    });

    console.log(`PenManager: pen added, mac=${pen.getMac()}`);
  }

  /**
   *
   * @param device
   */
  public isAlreadyConnected = (device: BluetoothDevice): boolean => {
    const index = this.penArray.findIndex(pen => pen.id === device.id);
    if (index > -1) return true;

    return false;
  }

  /**
   *
   * @param pen
   */
  private removePen = (pen: INeoSmartpen) => {
    const btDeviceId = pen.getBtDevice().id;

    const index = this.penArray.findIndex(penInfo => penInfo.id === btDeviceId);
    if (index > -1) {
      this.penArray.splice(index, 1);
    }
  }

  setActivePen = (penId: string) => {
    _active_pen = this.penArray.find(penInfo => penInfo.pen.mac === penId).pen;
  }

  setColor(color_num: number) {
    // this.toggleColorRadioButton(color_num);
    this.color = this.pen_colors[color_num];

    if (_active_pen) {
      _active_pen.setColor(this.color);
    }
    this.dispatcher.dispatch(PenEventName.ON_COLOR_CHANGED, this);
  }

  toggleColorRadioButton(color_num: number) {
    const $elem = $(`.color_${color_num}`);
    this.toggleColorRadioButton_inner(undefined, $elem);
  }

  toggleColorRadioButton_inner(e, $elem) {
    if ($elem === undefined) {
      $elem = $(e.target);
    }
    if ($elem.hasClass("color_icon")) {
      $(".color_icon").each(function () {
        $(this).removeClass("pressed");
      });
      $elem.addClass("pressed");
    }
  }

  setPenRendererType(type: IBrushType) {
    const $elem = $("#btn_brush").find(".c2");
    this.setPenTypeStatus($elem, type);

    if (type === IBrushType.MARKER) {
      for (let i = 0; i < 11; i++) {
        $('#clr_' + [i]).find(".color_" + [i]).css('background-color', this.marker_colors[i]);
      }
    }
    else if (type === IBrushType.PEN) {
      for (let i = 0; i < 11; i++) {
        $('#clr_' + [i]).find(".color_" + [i]).css('background-color', this.pen_colors[i]);
      }
    }

    this.penRendererType = type;

    if (_active_pen) {
      _active_pen.setPenRendererType(this.penRendererType);
      _active_pen.setColor(this.color);
    }
  }

  setPenTypeStatus($elem, type) {
    if (type == IBrushType.MARKER) {
      $elem.removeClass("state_0");
      $elem.removeClass("state_2");

      $elem.addClass("state_1");
    } else if (type == IBrushType.ERASER) {
      $elem.removeClass("state_0");
      $elem.removeClass("state_1");

      $elem.addClass("state_2");
    } else if (type == IBrushType.PEN) {
      $elem.removeClass("state_1");
      $elem.removeClass("state_2");

      $elem.addClass("state_0");
    }
  }

  setThickness(thickness: number) {
    $("#thickness_num").text(thickness);

    thickness = thickness / 10;
    this.thickness = thickness;

    if (_active_pen) {
      _active_pen.setThickness(this.thickness);
    }
  }

  // registerRenderContainer = (renderContainer) => {
  //   this.render.push(renderContainer);
  // }

  // unregisterRenderContainer = (renderContainer) => {
  //   const sameRender = (item) => item === renderContainer;
  //   const index = this.penArray.findIndex(sameRender);

  //   if (index > -1) {
  //     this.render.splice(index, 1);
  //   }
  // }


  /**
   *
   * @param opt
   */
  public onConnected = (opt: { pen: INeoSmartpen, event: IPenEvent }) => {
    const { pen } = opt;
    const btDeviceId = pen.getBtDevice().id;

    const index = this.penArray.findIndex(penInfo => penInfo.id === btDeviceId);

    if (index > -1) {
      this.penArray[index].connected = true;
    }
    else {
      console.log("PenManager: something wrong, un-added pen connected");
      this.penArray.push({ id: pen.getBtDevice().id, mac: pen.getMac(), pen, connected: true });
    }

    const $elem = $("#btn_connect").find(".c2");
    $elem.addClass("checked");
    $("#pen_id").text(`${this.penArray.length}`);

    const themeManager = ThemeManager.getInstance();
    themeManager.enablePenRelatedButtons(true);
  }

  /**
   *
   * @param opt
   */
  public onDisconnected = (opt: { pen: INeoSmartpen, event: IPenEvent }) => {
    const { pen } = opt;
    const btDeviceId = pen.getBtDevice().id;

    const index = this.penArray.findIndex(penInfo => penInfo.id === btDeviceId);
    if (index > -1) {
      this.penArray.splice(index, 1);
    }
    else {
      console.log("PenManager: something wrong, un-added pen disconnected");
    }

    $("#pen_id").text(`${this.penArray.length}`);
    if (this.penArray.length === 0) {
      const $elem = $("#btn_connect").find(".c2");
      $elem.removeClass("checked");
    }
  }

  /**
   *
   * @param opt
   */
  public onNcodeError = (opt: { pen: INeoSmartpen, event: IPenEvent }) => {
    // const { pen, event } = opt;

  }

  /**
   *
   */
  getConnectedPens = (): INeoSmartpen[] => {
    /** @type {Array<NeoSmartpen>} */
    const ret = new Array(0);

    this.penArray.forEach(penInfo => {
      if (penInfo.connected) {
        ret.push(penInfo.pen);
      }
    });

    return ret;
  }



  public addEventListener(eventName: PenEventName, listener: EventCallbackType) {
    this.dispatcher.on(eventName, listener, null);
  }


  /**
   *
   * @param eventName
   * @param listener
   */
  public removeEventListener(eventName: PenEventName, listener: EventCallbackType) {
    this.dispatcher.off(eventName, listener);
  }

}