import { PenCommBase, ProtocolHandlerBase, deviceSelectDlg } from "./pencomm_base";
import { DeviceTypeEnum } from "./pencomm_enum";
import { PenEventEnum, makePenEvent } from "./pencomm_event";
import { intFromBytes, decimalToHex } from "./pen_util_func";
import { PEN_PACKET_START, PEN_PACKET_END } from "./pencomm_const";
// import { NeoSmartpen } from "./neosmartpen";



const bufferArray_first = new Uint8Array(
  [
    PEN_PACKET_START, // start packet
    // cmd (1)
    0x01,

    // length (2)
    0x2a, 0x00,

    // connection code (16)
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,

    // app type (2)
    0x00, 0x00,

    // app version (16)
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,

    // protocol version(8) 2.18
    0x32, 0x2e, 0x31, 0x38, 0x00, 0x00, 0x00, 0x00,
    PEN_PACKET_END,
  ] // end packet
);


/**
 *
 * @param {number} typeNumber - 0:pen, 1:eraser, 2:player, on 2020/10/01
 * @return {DeviceTypeEnum} - a member of DeviceTypeEnum
 */
function getPenType(typeNumber) {
  let result = DeviceTypeEnum.PEN;
  switch (typeNumber) {
    case 0:
      result = DeviceTypeEnum.PEN;
      break;

    case 1:
      result = DeviceTypeEnum.ERASER;
      break;

    case 2:
      result = DeviceTypeEnum.PLAYER;
      break;

    default:
      result = DeviceTypeEnum.PEN;
      console.error(`device type mismatch (not 0, 1, neither 2), Pen type from pen is ${typeNumber}`);
      break;
  }

  return result;
}


export default class PenComm extends ProtocolHandlerBase {
  /** @type {BluetoothDevice} */
  btDevice = null;

    // device information
  deviceInfo = {
    /** @type {string} */
      modelName: "", // NWP-F30 ~ NWP-F121HL

    /** @type {number} */
      protocolVer: 100, // 1.00 ==> 100

    /** @type {DeviceTypeEnum} */
      deviceType: DeviceTypeEnum.NONE,

    /** @type {string} */
    mac: "00:00:00:00:00:00",
    };

  isPenDown = false;

  penCommBase = new PenCommBase(this);

  /**
   *
   * @param {NeoSmartpen} penHandler
   */
  constructor(penHandler) {
    super();
    this.penHandler = penHandler;
  }

  getMac = () => {
    return this.deviceInfo.mac;
  }

  /**
   * @return {string}
   */

  getModelName = () => {
    return this.deviceInfo.modelName;
  }

  /**
   * @return {number}
   */
  getProtocolVer = () => {
    return this.deviceInfo.protocolVer;
  }


  /**
   * @public
   * @return {BluetoothDevice}
   */
  getBtDevice = () => {
    return this.btDevice;
  }


  /**
   *
   * @param {BluetoothDevice} btDevice
   */
  connect = (btDevice) => {
    this.btDevice = btDevice;
    this.penCommBase.connect(btDevice, this.onPhysicallyConnected);
  }

  write = (buf) => {
    try {
      this.penCommBase.write(buf);
    }
    catch (e) {
      throw e;
    }
  }



  onDisconnected = () => {
    const e = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.ON_DISCONNECTED, {});

    this.penHandler.onDisconnected(e);
  }


  // PROCESS A UNIT PACKET GOTTEN FROm PEN
  //
  // unit packet should be start with 0xC0 and end by 0xC1
  processUnitPacket = (unit_packet) => {
    // let this = this;
    var cmd = unit_packet[1];
    // console.log(`  processUnitPacket: 0x${cmd.toString(16)}  size(${unit_packet.length})`);
    switch (cmd) {

      // Pen up/down #1
      case 0x63:
        this.process_63_penupdown_v100(unit_packet);
        break;

      case 0x64:
        this.process_64_pageinfo_v100(unit_packet);
        break;

      case 0x65:
        this.process_65_penmove_v100(unit_packet);
        break;

      case 0x66:
        this.process_66_penmove_simple_v200(unit_packet);
        break;

      case 0x68:
        this.process_68_ndac_error_v100(unit_packet);
        break;


      case 0x69:
        this.process_69_pendown_v212(unit_packet);
        break;

      case 0x6a:
        this.process_6a_penup_v212(unit_packet);
        break;

      case 0x6b:
        this.process_6b_pageinfo_v212(unit_packet);
        break;

      case 0x6c:
        this.process_6c_penmove_v212(unit_packet);
        break;

      case 0x6f:
        this.process_6f_hovermove_v218(unit_packet);
        break;

      case 0x6d:
        this.process_6d_ndacerror_v212(unit_packet);
        break;


      case 0x81:
        this.process_81_device_first_info(unit_packet);
        break;

      case 0x82:
        this.process_82_pw_result(unit_packet);
        break;

      case 0x84:
        this.process_84_device_status(unit_packet);
        break;

      case 0x85:
        this.process_85_config_response(unit_packet);
        break;


      case 0x91:
        this.process_91_realtime_mode_response(unit_packet);
        break;

      default:
        break;
    }
  }

  onPhysicallyConnected = () => {
    console.log("BT protocol #1 ->");
    console.log("4. send first packet");

    // CMD 0x01
    this.write(bufferArray_first); // request Pen information
  }

  /**
   * process response packet from cmd 0x01
   * @param {*} buf
   */
  // 디바이스이름, 펌웨어버전, 회사 이름, 펜 종류, 필압센서 종류 등의 reposnse
  process_81_device_first_info = (buf) => {
    /**
     *  0:  1 - header
     *  1:  1 - cmd (0x81)
     *  2:  1 - error code
     *  3:  2 - length
     *
     *  5: 16 - device name
     * 21: 16 - firmware version
     * 37:  8 - protocol version
     * 45: 16 - company name
     * 61:  2 - device type (0,:pen, 2:eraser, 3:player)
     * 63:  6 - MAC address
     * 69:  1 - FS (0:FSR, 1:FSC, 2:up/down, 3:FSIR)
     * 70:  4 - device color type id
     */

    var Errcode = buf[2];
    var modelNameArry = []; //NWP-F30 ~ NWP-F121HL
    for (var i = 5; i < 16; i++) {
      if (buf[i] > 0) modelNameArry.push(buf[i] & 0xff);
    }
    var modelNameString = String.fromCharCode.apply(null, modelNameArry);

    var protocolVer = (buf[37] - 0x30) * 100 + (buf[39] - 0x30) * 10 + (buf[40] - 0x30);
    console.log(`    BT protocol #1 <- connection result: ${Errcode} ${protocolVer}`);

    this.deviceInfo.modelName = modelNameString;
    this.deviceInfo.protocolVer = protocolVer;
    // this.deviceInfo.mac = intFromBytes(buf, 63, 6).toString(16).toUpperCase();
    this.deviceInfo.mac = decimalToHex(buf[63], 2) + ":" +
      decimalToHex(buf[64], 2) + ":" +
      decimalToHex(buf[65], 2) + ":" +
      decimalToHex(buf[66], 2) + ":" +
      decimalToHex(buf[67], 2) + ":" +
      decimalToHex(buf[68], 2);

    //
    let typeNumber = intFromBytes(buf, 61, 2);
    function getPenType_on_81(number) {
      let result = DeviceTypeEnum.PEN;
      switch (number) {
        case 0:
        case 1:
          result = DeviceTypeEnum.PEN;
          break;

        case 2:
          result = DeviceTypeEnum.ERASER;
          break;

        case 3:
          result = DeviceTypeEnum.FSIR;
          break;

        default:
          result = DeviceTypeEnum.PEN;
          console.error(`device type mismatch (not 0, 1, neither 2), Pen type from pen is ${typeNumber}`);
          break;
      }

      return result;
    }
    this.deviceInfo.deviceType = getPenType_on_81(typeNumber);

    // t.deviceType = getPenType(typeNumber);

    // CMD 0x04, 펜 설정을 확인하는 패킷을 보낸다. request pen status
    var bufferArray = new Uint8Array([0xc0, 0x04, 0x00, 0x00, 0xc1]);
    console.log(`    BT protocol #2 -> request pen status`);

    this.write(bufferArray);
  }


  /**
   * 펜 설정 확인의 response (CMD 0x04의 결과)
   * @param {*} buf
   */
  // response by write passcode
  process_84_device_status = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x82)
     *  2:  1 - error code
     *  3:  2 - length
     *
     *  5:  1 - locked or not (0:no password, 1:password locked)
     *  6:  1 - retry limit
     *  7:  1 - current retry count
     *  8:  8 - uint64, millisecond tick from 1970/01/01
     * 16:  2 - auto power off time (unit: minutes)
     * 18:  2 - maximum force (< 0x3ff)
     * 20:  1 - storage capacity % (100%)
     * 21:  1 - pencap auto on/off (0:false, 1:true)
     * 22:  1 - auto power on
     * 23:  1 - beep on
     * 24:  1 - hover on
     * 25:  1 - battery status (MSB:in charging, LSB 7bits: 100%)
     * 26:  1 - offline stroke store or not
     * 27:  1 - pressure sensor step (0~4, 0 is most sensitive)
     * 28:  1 - usb mode (0:disk, 1:bulk)
     * 29:  1 - down sampling (0:off, 1:on)
     * 30: 16 - BT model name
     * 46:  1 - data transfer mode (0:event, 1:requset/response, from 2.10 deleted)
     * 47:  1 - ndac error code offline store or not (0:false, 1:true)
     * 48: 21 - reserverd
     */

    // } else if ( buf[0] == PEN_PACKET_START && buf[1] == 0x84 ) {
    // response
    var isPwLocked = buf[5];
    var penMemory = buf[20];
    var penBattery = buf[25];
    console.log(`    BT protocol #2 <- IsLock? ${isPwLocked} memory:${penMemory}%, battery:${penBattery}%`);

    var bufferArray;
    if (isPwLocked === 1) {

      var e = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.PASSWORD_REQUIRED);
      this.penHandler.onPasscodeRequired(e);
      // var passcode = prompt("please enter passcode");

      // // input passcode
      // console.log("    BT protocol #3 -> input passcode ");
      // bufferArray = new Uint8Array([0xc0, 0x02, 0x10, 0x00, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xc1]);

      // bufferArray[4] = passcode.charCodeAt(0);
      // bufferArray[5] = passcode.charCodeAt(1);
      // bufferArray[6] = passcode.charCodeAt(2);
      // bufferArray[7] = passcode.charCodeAt(3);
      // console.log("    passcode1 :" + bufferArray[4]);
      // console.log("    passcode2 :" + bufferArray[5]);
      // console.log("    passcode3 :" + bufferArray[6]);
      // console.log("    passcode4 :" + bufferArray[7]);

      // this.write(bufferArray);
      // // g_btWriteSocket.writeValue(bufferArray);
    } // unlocked
    else {
      // request online
      console.log("    BT protocol #4 -> request online data");
      bufferArray = new Uint8Array([0xc0, 0x11, 0x02, 0x00, 0xff, 0xff, 0xc1]);
      // g_btWriteSocket.writeValue(bufferArray);
      this.write(bufferArray);
    }
  }

  // CMD 0x02
  sendPasscode(passcode) {

    console.log("    BT protocol #3 -> input passcode ");
    let bufferArray = new Uint8Array([0xc0, 0x02, 0x10, 0x00, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xc1]);

    bufferArray[4] = passcode.charCodeAt(0);
    bufferArray[5] = passcode.charCodeAt(1);
    bufferArray[6] = passcode.charCodeAt(2);
    bufferArray[7] = passcode.charCodeAt(3);

    // g_btWriteSocket.writeValue(bufferArray);
    this.write(bufferArray);
  }


  /**
   * 패스워드 송신 후의 reponse
   *
   * @param {*} buf
   *
   */
  process_82_pw_result = (buf) => {
    /**
     *  0:  1 - header
     *  1:  1 - cmd (0x81)
     *  2:  1 - error code
     *  3:  2 - length
     *  5:  1 - password response (0:pw needed, 1:success(or not needed), 2:pen was reset, 3:system error)
     *  6:  1 - retry limit
     *  7:  1 - current retry count
     */

    // response check passcode
    var pwCheckResult = buf[5];

    /** @type {number} */
    var retryCount = buf[6];
    var maxCount = buf[7];

    if (pwCheckResult === 1) {
      // passcode OK
      console.log("    BT protocol #3 <- passcode none ==> OK ");
      console.log("    BT protocol #4 -> request online data");

      // request online
      let bufferArray = new Uint8Array([0xc0, 0x11, 0x02, 0x00, 0xff, 0xff, 0xc1]);
      // g_btWriteSocket.writeValue(bufferArray);
      this.write(bufferArray);
    } else {
      console.log(`    BT protocol #3 <- passcode NG ${retryCount}/${maxCount}`);
      // retry input passcode
      //alert("wrong passcode");
      var e = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.PASSWORD_REQUIRED, { retryCount });
      this.penHandler.onPasscodeRequired(e);
    }
  }


  setTransferMode(val) {
    /**
     *  0:  1 - header
     *  1:  1 - cmd (0x05)
     *  2:  2 - length (0x02)
     *  4:  1 - attribute type (0x07)
     *  5:  1 - offline store mode (0:off, 1:offline while realtime available, 100:both of realtime and offline)
     */

    if (val !== 0 && val !== 1 && val !== 100) return;

    var bufferArray = new Uint8Array([0xc0, 0x05, 0x02, 0x00, 0x07, val, 0xc1]);
    // g_btWriteSocket.writeValue(bufferArray);
    this.write(bufferArray);
  }

  // Hover control
  setHoverMode(val) {
    /**
     *  0:  1 - header
     *  1:  1 - cmd (0x05)
     *  2:  2 - length (0x02)
     *  4:  1 - attribute type (0x06)
     *  5:  1 - hover on/off (0:hover mode off, 1:hover mode on)
     */

    val &= 0x01;
    var bufferArray = new Uint8Array([0xc0, 0x05, 0x02, 0x00, 0x06, val, 0xc1]);
    // g_btWriteSocket.writeValue(bufferArray);
    this.write(bufferArray);
  }


  /**
   * pen up/down #1
   * @param {*} buf
   */
  process_63_penupdown_v100 = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x63)
     *  2:  2 - length
     *
     *  4:  1 - up/down (0:down, 1:up)
     *  5:  8 - timestamp
     * 13:  1 - pen tip type (0:normal, 1:eraser)
     * 14:  4 - color (argb)
    */

    let isPenDown = buf[4] === 0;
    let penTipMode = buf[13];

    if (isPenDown) {
      console.log("------------ Pen down --------------");
      this.isPenDown = true;

      let event = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.PEN_DOWN, { penTipMode });
      this.penHandler.onPenDown(event);

      return;
    } else {
      console.log("^^^^^^^^^^^^^^ pen up ^^^^^^^^^^^^^");
      this.isPenDown = false;

      let event = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.PEN_UP, { penTipMode });
      this.penHandler.onPenUp(event);

      return;
    }
  }

  /**
   * info, #1
   * @param {*} buf
   */
  // 지우개, pen down 직후에 오는 info
  process_64_pageinfo_v100 = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x64)
     *  2:  2 - length
     *
     *  4:  3 - owner
     *  7:  1 - section
     *  8:  4 - note id
     * 12:  4 - page id
    */

    var section = buf[7];
    var owner = intFromBytes(buf, 4, 3);
    var book = intFromBytes(buf, 8, 4);
    var page = intFromBytes(buf, 12, 4);
    //console.log('owner:' + ownerId + ', book:' + bookId + ', page:' + pageId);

    var eventMode = PenEventEnum.PAGE_INFO;
    // if (!this.isPenDown) {
    //   eventMode = PenEventEnum.PAGE_INFO_HOVER;
    // }

    var e = makePenEvent(this.deviceInfo.deviceType, eventMode, { section, owner, book, page });

    // console.log("    #1 INFO");
    let isHover = eventMode === PenEventEnum.PAGE_INFO_HOVER;

    // console.log( "0x64");
    this.penHandler.onPageInfo(e, isHover);

    return;
  }

  /**
   * pen move, #1
   * @param {*} buf
   */
  // 지우개, dot code
  process_65_penmove_v100 = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x65)
     *  2:  2 - length
     *  4:  1 - time diff
     *
     *  5:  2 - force
     *  7:  2 - x
     *  9:  2 - y
     * 11:  1 - float x
     * 12:  1 - float y
     * 13:  1 - x tilt
     * 14:  1 - y tilt
     * 15:  2 - twist (0~180, 360 degree => 180)
    */

    var timediff = buf[4];
    var force = intFromBytes(buf, 5, 2);
    var dotX = intFromBytes(buf, 7, 2);
    var dotY = intFromBytes(buf, 9, 2);
    var dotFx = intFromBytes(buf, 11, 1);
    var dotFy = intFromBytes(buf, 12, 1);

    var x = dotX + dotFx / 100;
    var y = dotY + dotFy / 100;

    var e = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.PEN_MOVE);
    e.force = force;
    e.x = x;
    e.y = y;
    e.timediff = timediff;
    // this.penStroke.moveEvents.push(e);

    console.log(`    #1 MOVE ( ${x}, ${y} )`);
    this.penHandler.onPenMove(e);

    return;
  }

  /**
   * pen move, for slow connection, #2
   * @param {*} buf
   */
  // 지우개, dot code
  process_66_penmove_simple_v200 = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x66)
     *  2:  2 - length
     *  4:  1 - time diff
     *
     *  5:  2 - x
     *  7:  2 - y
     *  9:  1 - float x
     * 10:  1 - float y
    */

    var timediff = buf[4];
    var force = 100;
    var dotX = intFromBytes(buf, 5, 2);
    var dotY = intFromBytes(buf, 7, 2);
    var dotFx = intFromBytes(buf, 9, 1);
    var dotFy = intFromBytes(buf, 10, 1);

    var x = dotX + dotFx / 100;
    var y = dotY + dotFy / 100;

    var e = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.PEN_MOVE);
    e.force = force;
    e.x = x;
    e.y = y;
    e.timediff = timediff;
    // this.penStroke.moveEvents.push(e);

    console.log(`    #2 MOVE ( ${x}, ${y} )`);
    this.penHandler.onPenMove(e);

    return;
  }


  /**
   * ndac error
   * @param {*} buf
   */
  process_68_ndac_error_v100 = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x68)
     *  2:  2 - length
     *  4:  1 - delta time
     *
     *  5:  2 - force
     *  7:  1 - image brightness
     *  8:  1 - exposure time
     *  9:  1 - NDAC process time
     * 10:  2 - label count
     * 12:  1 - ndac error code
    */

    // let this = this;

    var e = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.PEN_DOWN);
    // this.isPenDown = true;

    console.log("    PEN DOWN");
    this.penHandler.onPenDown(e);
  }


  /**
   * pen down, v2.12
   * @param {*} buf
   */
  // pen down
  process_69_pendown_v212 = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x69)
     *  2:  2 - length
     *  4:  1 - event count
     *
     *  5:  8 - timestamp
     *  13:  1 - pen tip type (0:normal, 1:eraser)
     *  14:  4 - pen tip color (argb)
    */
    // console.log("    PEN DOWN");

    let penTipMode = buf[13];
    let color = intFromBytes(buf, 14, 4);   // ARGB

    this.isPenDown = true;

    var e = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.PEN_DOWN, { penTipMode, color });
    this.penHandler.onPenDown(e);
  }

  /**
   * pen up, v2.12
   * @param {*} buf
   */
  // pen up
  process_6a_penup_v212 = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x6A)
     *  2:  2 - length
     *  4:  1 - event count
     *
     *  5:  8 - timestamp
     *
     * 13:  2 - dot count (down-up 사이에 BT로 전송한 dot code 개수)
     * 15:  2 - total image count (down-up 사이에 촬영된 이미지 개수)
     * 17:  2 - proc image count (처리한 이미지 개수)
     * 19:  2 - success image count (처리에 성공한 이미지 개수)
     * 21:  2 - valid image count (밝기 등으로 유효한 이미지 개수)
    */
    // console.log("    PEN UP");

    // let dotCount = intFromBytes(buf, 13, 2);
    let totalImageCount = intFromBytes(buf, 15, 2);
    let procImageCount = intFromBytes(buf, 17, 2);
    let successImageCount = intFromBytes(buf, 19, 2);
    let validImageCount = intFromBytes(buf, 21, 2);

    // console.log(`totalImageCount: ${totalImageCount} `);
    // console.log(`procImageCount: ${procImageCount} `);
    // console.log(`successImageCount: ${successImageCount} `);
    // console.log(`validImageCount: ${validImageCount} `);

    let successRate_ndac = successImageCount / totalImageCount;
    let successRate_optical = validImageCount / totalImageCount;

    this.isPenDown = false;

    var e = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.PEN_UP, { successRate_ndac, successRate_optical });
    this.penHandler.onPenUp(e);
  }

  /**
   * info packet, v2.12
   * @param {*} buf
   */
  // pen info packet
  process_6b_pageinfo_v212 = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x6B)
     *  2:  2 - length
     *  4:  1 - event count
     *
     *  5:  3 - owner
     *  8:  1 - section
     *  9:  4 - book
     * 13:  4 - page
    */

    var o = intFromBytes(buf, 5, 3);
    var s = intFromBytes(buf, 8, 1);
    var b = intFromBytes(buf, 9, 4);
    var p = intFromBytes(buf, 13, 4);

    var eventMode = PenEventEnum.PAGE_INFO;
    // if (!this.isPenDown) {
    //   eventMode = PenEventEnum.PAGE_INFO_HOVER;
    // }
    var e = makePenEvent(this.deviceInfo.deviceType, eventMode);
    e.section = s;
    e.owner = o;
    e.book = b;
    e.page = p;

    let isHover = eventMode === PenEventEnum.PAGE_INFO_HOVER;

    // console.log("0x6b");

    // console.log(`    PEN INFO, page address: ${o}.${b}.${p} ${isHover ? "HOVER" : "PEN DOWN"} `);
    this.penHandler.onPageInfo(e, isHover);
  }


  /**
   * pen move, v2.12
   * @param {*} buf
   */
  // pen dot
  process_6c_penmove_v212 = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x6C)
     *  2:  2 - length
     *  4:  1 - event count
     *  5:  1 - delta time
     *
     *  6:  2 - force
     *  8:  2 - x
     * 10:  2 - y
     * 12:  1 - float x
     * 13:  1 - float y
     *
     * 14:  1 - x tilt
     * 15:  1 - y tilt
     * 16:  2 - twist
    */
    // pen down moving (or hover moving, in firmware <2.18 )
    let timediff = buf[5];
    let force = intFromBytes(buf, 6, 2);
    let dotX = intFromBytes(buf, 8, 2);
    let dotY = intFromBytes(buf, 10, 2);
    let dotFx = intFromBytes(buf, 12, 1);
    let dotFy = intFromBytes(buf, 13, 1);


    var x = dotX + dotFx / 100;
    var y = dotY + dotFy / 100;
    var e = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.PEN_MOVE, { x, y, force, timediff });
    this.penHandler.onPenMove(e);
  }


  // pen dot hover, v2.18
  process_6f_hovermove_v218 = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x6F)
     *  2:  2 - length
     *  4:  1 - delta time
     *
     *  8:  2 - x
     * 10:  2 - y
     * 12:  1 - float x
     * 13:  1 - float y
    */

    let timediff = buf[4];
    let force = 0;
    let dotX = intFromBytes(buf, 5, 2);
    let dotY = intFromBytes(buf, 7, 2);
    let dotFx = intFromBytes(buf, 9, 1);
    let dotFy = intFromBytes(buf, 10, 1);

    var x = dotX + dotFx / 100;
    var y = dotY + dotFy / 100;
    var e = makePenEvent(DeviceTypeEnum.PEN, PenEventEnum.PEN_MOVE_HOVER, { x, y, force, timediff });

    this.penHandler.onHoverMove(e);
  }

  /**
   * NDAC Error, v2.12
   * @param {*} buf
   */
  // NDAC recognize error
  process_6d_ndacerror_v212 = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x6D)
     *  2:  2 - length
     *  4:  1 - event count
     *  5:  1 - delta time
     *
     *  6:  2 - force
     *  8:  1 - image brightness
     *  9:  1 - exposure time
     * 10:  1 - NDAC process time
     * 11:  2 - label count
     * 13:  1 - ndac error code
     * 14:  1 - class type (0:G3C6, 1:N3C6)
     * 15:  1 - error count (down부터 카운트, 초기화:0)
    */

    let timediff = buf[5];
    let force = intFromBytes(buf, 6, 2);

    let brightness = buf[8];
    let exposureTime = buf[9];
    let ndacTime = buf[10];

    let labelCount = intFromBytes(buf, 11, 2);
    let ndacErrorCode = buf[13];
    let ndacClassType = buf[14];
    let continuousErrorCount = buf[15];

    let options = {
      timediff,
      force,

      brightness,
      exposureTime,
      ndacTime,
      labelCount,
      ndacErrorCode,
      ndacClassType,
      continuousErrorCount,
    }

    var e = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.CODE_ERROR, options);
    this.penHandler.onNcodeError(e);

    return;
  }



  /**
   * 펜 모드 설정에 대한 응답
   * @param {*} buf
   */

  // response by pen configuration (ex. hover mode)
  process_85_config_response = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x85)
     *  2:  1 - error code
     *  3:  2 - length
     *  5:  1 - type
     *  6:  1 - result (0:success, 1:fail)
    */
    // var error_code = buf[2];
    var res_type = buf[6];
    console.log(`    response from pen: ${res_type === 0 ? "success" : "fail:" + res_type.toString(16)}`);
  }


  // response, 실시간 필기 데이터 요청에 따른
  process_91_realtime_mode_response = (buf) => {
    /**
     *  0:  1 - header
     *
     *  1:  1 - cmd (0x91)
     *  2:  1 - error code
     *  3:  2 - length
    */

    var Errcode = buf[2];

    if (Errcode === 0) {
      console.log("    BT protocol #4 <- You can write.");
      console.log("    Device info ");
      console.log("         modelName: " + this.deviceInfo.modelName);
      console.log("         protocolVer: " + this.deviceInfo.protocolVer / 100);
      console.log("         deviceType: " + this.deviceInfo.deviceType);

      let errorCode = 0;
      let infoMessage = "";

      // callback
      if (this.deviceInfo.protocolVer < 218) {
        errorCode = 1;
        infoMessage = `need to upgrade firmware greater than 2.18 (current version=${this.deviceInfo.protocolVer / 100})`;
      }

      const e = makePenEvent(this.deviceInfo.deviceType, PenEventEnum.ON_CONNECTED, { errorCode, infoMessage });
      this.penHandler.onConnected(e);

      // set auto hover mode
      if (this.deviceInfo.protocolVer >= 218) {
        this.setHoverMode(1); // enable hover
      }
    } else {
      console.log("BT protocol #4 <- error : " + Errcode);
    }
  }

}

export { deviceSelectDlg };