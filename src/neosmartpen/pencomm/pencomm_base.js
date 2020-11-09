import {
  PEN_PACKET_START,
  PEN_PACKET_END,
  PEN_SERVICE_UUID_16,
  PEN_CHARACTERISTICS_WRITE_UUID_16,
  PEN_CHARACTERISTICS_NOTIFICATION_UUID_16,
  PEN_SERVICE_UUID_128,
  PEN_CHARACTERISTICS_WRITE_UUID_128,
  PEN_CHARACTERISTICS_NOTIFICATION_UUID_128,
} from "./pencomm_const";

import { unescapePacket } from "./pen_util_func";
import * as Bluetooth from 'react-bluetooth';
import "../types";

/**
 * @return {Promise.<BluetoothDevice>}
 */
export async function deviceSelectDlg() {
  console.log("********* Requesting any Bluetooth Device... **********");

  let options = {
    // acceptAllDevices: true,
    filters: [
      { services: [PEN_SERVICE_UUID_16] },
      { services: [PEN_SERVICE_UUID_128] },
      { namePrefix: "Neosmartpen" },
      { namePrefix: "Smartpen" }
    ]
  }
  let result = await Bluetooth.requestDeviceAsync(options);
  if (result.type === 'cancel') {
    return null;
  }

  return result.device;
}

const DEVICE_STATE = {
  disconnected: 0,
  connecting: 1,
  connected: 2,
};

const PEN_BT_UUID = {
  // for F30, and future devices
  "new": {
    service: PEN_SERVICE_UUID_128,
    write: PEN_CHARACTERISTICS_WRITE_UUID_128,
    noti: PEN_CHARACTERISTICS_NOTIFICATION_UUID_128,
  },

  // for F51, F50, F121, F120
  "old": {
    service: PEN_SERVICE_UUID_16,
    write: PEN_CHARACTERISTICS_WRITE_UUID_16,
    noti: PEN_CHARACTERISTICS_NOTIFICATION_UUID_16,
  }
}

export class PenCommBase {

    protocolHandler = null;

    /**@type {BluetoothDevice} */
    btDevice = null;
    // this.btServer = null;

    _btWriteSocket = null;
    _btNotifyIndicate = null;

    // this._bluetooth_MTU = 1024;

    _bt_buffer = new Uint8Array(0);
    // this.modelNameString = null;

    inConnecting = false;
    inDisconnecting = false;
    connected = false;

    _state = DEVICE_STATE.disconnected;


  /**
   *
   * @param {ProtocolHandlerBase} protocolHandler
   */
  constructor(protocolHandler) {
    this.protocolHandler = protocolHandler;
  }


  /**
   *
   * @param {BT_UUID_DEF} uuids
   * @param {BluetoothRemoteGATTServer} server
   *
   * @return {Promise.<{service: BluetoothRemoteGATTService, writeSocket:BluetoothRemoteGATTCharacteristic, notifyIndicate:BluetoothRemoteGATTCharacteristic}>}
   */
  async getServiceProcess(uuids, server) {
    console.log(`  2-1. M1 getPrimaryService, connected:${server.connected}`);
    /** @type {BluetoothRemoteGATTService} */
    let service = await server.getPrimaryService(uuids.service);

    console.log(`  2-2. M1 getCharacteristic, connected:${server.connected}`);
    /** @type {BluetoothRemoteGATTCharacteristic} */
    let writeSocket = await service.getCharacteristic(uuids.write);

    console.log(`  2-3. M1 getCharacteristic, connected:${server.connected}`);
    /** @type {BluetoothRemoteGATTCharacteristic} */
    let notifyIndicate = await service.getCharacteristic(uuids.noti);

    return { service, writeSocket, notifyIndicate };
  }

  /**
   *
   * @param {BluetoothRemoteGATTServer} server
   *
   * @return {Promise.<{service: BluetoothRemoteGATTService, writeSocket:BluetoothRemoteGATTCharacteristic, notifyIndicate:BluetoothRemoteGATTCharacteristic}>}
   */
  async getService(server) {
    let uuids = [PEN_BT_UUID.old, PEN_BT_UUID.new];
    if (server.device.name === "Smartpen dimo_d") {
      uuids = [PEN_BT_UUID.new, PEN_BT_UUID.old];
    }

    try {
      let result = await this.getServiceProcess(uuids[0], server);
      return result;
    } catch (e) {
      console.log(`  ==> failed`);
      if (e.message.indexOf("No Services matching UUID") > -1) {
        let result = await this.getServiceProcess(uuids[1], server);
        return result;
      } else {
        throw e;
      }
    }
  }

  /**
   *
   * @param {BluetoothDevice} btDevice
   */
  async connect(btDevice, protocalStartCallback) {
    if (this._state !== DEVICE_STATE.disconnected)
      return false;

    this.connected = false;
    this.inConnecting = true;

    /** @type {BluetoothRemoteGATTServer} */
    let server = null;
    try {
      console.log("1. Connecting to GATT Server...");
      btDevice.addEventListener("gattserverdisconnected", this.onDeviceDisconnected);
      server = await btDevice.gatt.connect();
    }
    catch (e) {
      let isBTdevice = e.message.indexOf("adapter");
      if (isBTdevice > -1) console.log("Bluetooth LE dongle is not found");

      console.error(e);
      return false;
    }

    console.log(`2. get Service and Sockets, connected:${server.connected}`);

    try {
      let { writeSocket, notifyIndicate } = await this.getService(server);

      console.log("3. Add Event listeners");
      notifyIndicate.addEventListener("characteristicvaluechanged", this.onPenPacketReceived);
      await notifyIndicate.startNotifications();

      this.btDevice = btDevice;
      this._btWriteSocket = writeSocket;
      this._btNotifyIndicate = notifyIndicate;
      console.log("BLE Connected...");

      this.connected = true;
      this.inConnecting = false;


    }
    catch (e) {
      let isBTdevice = e.message.indexOf("adapter");
      if (isBTdevice > -1) console.log("Bluetooth LE dongle is not found");
      console.error(e);
      return false;
    }

    protocalStartCallback();
    // this.protocolHandler.onPhysicallyConnected();
    return true;
  }

  // disconnect function:
  disconnect = () => {
    console.log(`     DISCONNECT operation`);
    this.inDisconnecting = true;
    let self = this;
    if (!self.connected || self.btDevice === null) {
      return;
    }

    if (self.btDevice !== null) {
      self.btDevice.gatt.disconnect();
    }
  }

  preDisconnected = () => {
    throw new Error("Not implemented: preDisconnected");
  }

  onDeviceDisconnected = () => {
    this.inDisconnecting = false;
    this.btDevice = null;
    this.btServer = null;

    this._btWriteSocket = null;
    this._btNotifyIndicate = null;

    this._bt_buffer = new Uint8Array(0);

    // 상위로 전달
    let handler = this.protocolHandler;
    if (handler) handler.onDisconnected();
    // this.protocolHandler = null;
  }

  write = (buf) => {
    try {
      this._btWriteSocket.writeValue(buf);
    }
    catch (e) {
      throw e;
    }
  }


  // PEN PACKET PROCESSOR
  //
  // process raw packets from pen
  // slice packets in to a unit packet
  // process the unit packet command code
  onPenPacketReceived = (event) => {
    // console.log("    handle Data");
    let self = this;

    var value = event.target.value;
    var data_length = event.target.value.byteLength;

    // 이전에 있던 buf에 concatenate
    var prev_buf = self._bt_buffer;
    var prev_len = prev_buf.length;
    var buffer = new Uint8Array(prev_buf.length + data_length);

    // https://stackoverflow.com/questions/14071463/how-can-i-merge-typedarrays-in-javascript
    buffer.set(prev_buf);
    for (var i = 0; i < value.byteLength; i++) {
      buffer[prev_len + i] = value.getUint8(i);
    }

    var start = buffer.indexOf(PEN_PACKET_START);
    var end = buffer.indexOf(PEN_PACKET_END);

    // let idx = 0;
    // let cnt = 0;

    // console.log("packet length: " + data_length);
    while (start !== -1 && end !== -1) {
      // console.log("   [" + cnt + "]  packet found: (" + (idx + start) + ", " + (idx + end) + ")");

      // buffer 잘라 주기
      var curCmdPacket = buffer.slice(start, end + 1);
      // idx += end;

      // escape code 처리
      var unescapedBuf = unescapePacket(curCmdPacket);

      // packet 처리
      if (unescapedBuf[0] === PEN_PACKET_START) {
        // pen command 처리
        this.protocolHandler.processUnitPacket(unescapedBuf);
      } else {
        // 위의 slice 처리가 이상하든지 메모리가 깨졌다.
      }

      // buffer 정리
      // cnt++;
      buffer = buffer.slice(end + 1);
      start = buffer.indexOf(PEN_PACKET_START);
      end = buffer.indexOf(PEN_PACKET_END);
    }

    self._bt_buffer = buffer;
  }
}

export class ProtocolHandlerBase {
  onPhysicallyConnected() {
    throw new Error("Not implemented: processUnitPacket");

  }
  onDisconnected() {
    throw new Error("Not implemented: processUnitPacket");
  }
  processUnitPacket(buf) {
    throw new Error("Not implemented: processUnitPacket");
  }
}

