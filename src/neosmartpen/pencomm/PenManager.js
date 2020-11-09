import { StorageRenderer } from "..";
import { NeoSmartpen } from "./neosmartpen";

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
   * @public
   * @return {NeoSmartpen}
   */
  createPen = () => {
    let pen = new NeoSmartpen();
    return pen;
  }

  /**
   * @public
   * @param {NeoSmartpen} pen 
   * @param {BluetoothDevice} device
   */
  add = (pen, device) => {
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
   * @public
   * @param {BluetoothDevice} device
   * @return {boolean}
   */
  alreadyConnected = (device) => {
    const index = this.penArray.findIndex(penInfo => penInfo.id === device.id);
    if ( index > -1 ) return true;

    return false;
  }

  /**
   * @private
   * @param {NeoSmartpen} pen 
   */
  removePen = (pen) => {
    const btDeviceId = pen.getBtDevice().id;

    const index = this.penArray.findIndex( penInfo => penInfo.id === btDeviceId );
    if (index > -1) {
      this.penArray.splice(index, 1);
    }
  }

  registerRenderContainer = (renderContainer) => {
    this.render.push(renderContainer);
  }

  unregisterRenderContainer = (renderContainer) => {
    const sameRender = (item) => item === renderContainer;
    const index = this.penArray.findIndex( sameRender);

    if (index > -1) {
      this.render.splice(index, 1);
    }
  }



  /**
   * @public
   * @param {{pen:NeoSmartpen, event:PenEvent}} opt
   */
  onConnected = (opt) => {
    const { pen, event } = opt;
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
   * @public
   * @param {{pen:NeoSmartpen, event:PenEvent}} opt
   */
  onDisconnected = (opt) => {
    const { pen, event } = opt;
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
   * @public
   * @param {{pen:NeoSmartpen, event:PenEvent}} opt
   */
  onNcodeError = (opt) => {
    const { pen, event } = opt;

  }

  /**
   * @public
   * @return {Array<NeoSmartpen>}
   */
  getConnectedPens = () => {
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