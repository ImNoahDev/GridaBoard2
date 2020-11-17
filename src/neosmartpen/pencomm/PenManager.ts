import { NeoSmartpen } from "./neosmartpen";
import { IPenEvent } from "../DataStructure/Structures";

let _penmanager_instance = null;

export default class PenManager {
  /** @type {Array.<{id:string, mac:string, pen:NeoSmartpen, connected:boolean}>} */
  penArray = [];

  /** @type {Array.<StorageRenderer>} */
  render = [];


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