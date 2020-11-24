import { NeoSmartpen } from "./neosmartpen";
import { IPenEvent } from "../DataStructure/Structures";
import { IBrushType } from "../DataStructure/Enums"
import PenBasedRenderer from "../renderer/pageviewer/PenBasedRenderer";
import ThemeManager from "../../styles/ThemeManager"
import jQuery from "jquery";

let $ = jQuery;
let _penmanager_instance = null;
var _active_pen:NeoSmartpen = null;

export const DEFAULT_PEN_COLOR_NUM: number = 2;
export const DEFAULT_PEN_THICKNESS: number = 2;
export const DEFAULT_PEN_RENDERER_TYPE: IBrushType = IBrushType.PEN;

export default class PenManager {
  /** @type {Array.<{id:string, mac:string, pen:NeoSmartpen, connected:boolean}>} */
  penArray = new Array(0);

  /** @type {Array.<StorageRenderer>} */
  render = [];
  
  colors: string[] = [
    "rgb(101, 44, 179, 255)", // 0 보라
    "rgb(255,255,255, 255)", // 하양
    "rgb(0,0,0, 255)", // 검정
    "rgb(180, 180, 180, 255)", // 회색

    "rgb(254, 244, 69, 255)", // 노랑

    "rgb(250, 199, 16, 255)", //주황
    "rgb(227, 95, 72, 255)", //주홍
    "rgb(16, 205, 212, 255)", //파랑빛

    "rgb(11, 167, 137, 255)", //초록
    "rgb(218, 34, 99, 255)", // 9 자주
    "rgb(101, 44, 179, 255)" // 10 보라
  ];

  color: string = this.colors[DEFAULT_PEN_COLOR_NUM];
  thickness: number = DEFAULT_PEN_THICKNESS;
  penRendererType: IBrushType = DEFAULT_PEN_RENDERER_TYPE;

  init = () => {
    this.setThickness(DEFAULT_PEN_THICKNESS);
    this.setPenRendererType(DEFAULT_PEN_RENDERER_TYPE);
    this.setColor(DEFAULT_PEN_COLOR_NUM);
  }

  constructor() {
    if (_penmanager_instance) return _penmanager_instance;
  }

  /**
   * @return {PenManager}
   */
  static getInstance() {
    if (_penmanager_instance) return _penmanager_instance;

    _penmanager_instance = new PenManager();
    return _penmanager_instance;
  }

  /**
   * 
   */
  public createPen = (): NeoSmartpen => {
    let pen = new NeoSmartpen();
    return pen;
  }


  /**
   * 
   * @param pen 
   * @param device 
   */
  public add = (pen: NeoSmartpen, device: BluetoothDevice) => {
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
    const index = this.penArray.findIndex(penInfo => penInfo.id === device.id);
    if (index > -1) return true;

    return false;
  }

  /**
   * 
   * @param pen 
   */
  private removePen = (pen: NeoSmartpen) => {
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
    this.toggleColorRadioButton(color_num);
    this.color = this.colors[color_num];

    if (_active_pen) {
        _active_pen.setColor(this.color);
    }
  }

  toggleColorRadioButton(color_num) {
    var $elem = $(`.color_${color_num}`);
    this.toggleColorRadioButton_inner(undefined, $elem);
  }
  
  toggleColorRadioButton_inner(e, $elem) {
    if ($elem === undefined) {
        $elem = $(e.target);
    }
    if ($elem.hasClass("color_icon")) {
        $(".color_icon").each(function (item) {
          $(item).removeClass("pressed");
        });
        $elem.addClass("pressed");
    }
  }
  
  setPenRendererType(type) {
    var $elem = $("#btn_brush").find(".c2");
    this.setPenTypeStatus($elem, type);
  
    this.penRendererType = type;
  
    if (_active_pen) {
        _active_pen.setPenRendererType(this.penRendererType);
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
  
    thickness = thickness * 2;
    this.thickness = thickness;
  
    if (_active_pen) {
        _active_pen.setThickness(this.thickness);
    }
  }
  
  registerRenderContainer = (renderContainer) => {
    this.render.push(renderContainer);
  }

  unregisterRenderContainer = (renderContainer) => {
    const sameRender = (item) => item === renderContainer;
    const index = this.penArray.findIndex(sameRender);

    if (index > -1) {
      this.render.splice(index, 1);
    }
  }


  /**
   * 
   * @param opt 
   */
  public onConnected = (opt: { pen: NeoSmartpen, event: IPenEvent }) => {
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

    const themeManager = ThemeManager.getInstance();
    themeManager.enablePenRelatedButtons(true);
  }

  /**
   * 
   * @param opt 
   */
  public onDisconnected = (opt: { pen: NeoSmartpen, event: IPenEvent }) => {
    const { pen } = opt;
    const btDeviceId = pen.getBtDevice().id;

    const index = this.penArray.findIndex(penInfo => penInfo.id === btDeviceId);
    if (index > -1) {
      this.penArray.splice(index, 1);
    }
    else {
      console.log("PenManager: something wrong, un-added pen disconnected");
    }
  }

  /**
   * 
   * @param opt 
   */
  public onNcodeError = (opt: { pen: NeoSmartpen, event: IPenEvent }) => {
    // const { pen, event } = opt;

  }

  /**
   * 
   */
  getConnectedPens = (): NeoSmartpen[] => {
    /** @type {Array<NeoSmartpen>} */
    let ret = new Array(0);

    this.penArray.forEach(penInfo => {
      if (penInfo.connected) {
        ret.push(penInfo.pen);
      }
    });

    return ret;
  }

}