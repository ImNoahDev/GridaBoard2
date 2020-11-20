/** @enum {string} */
export enum DeviceTypeEnum {
  PEN = "pen",
  ERASER = "eraser",
  PLAYER = "player",
  STYLUS = "stylus",
  FSIR = "fsir",
  NONE = "none",
};



/** @enum {number} */
export enum PEN_STATE {
  NONE = 0,
  PEN_DOWN = 1,
  PEN_MOVE = 2,
  PEN_UP = 9,

  HOVER_MOVE = 101,
};



/** @enum {string} */
export enum PenEventName {
  ON_PEN_DOWN = "pendown",
  ON_PEN_PAGEINFO = "penpageinfo",
  ON_PEN_HOVER_PAGEINFO = "hoverpageinfo",
  ON_PEN_MOVE = "penmove",
  ON_PEN_UP = "penup",
  ON_HOVER_MOVE = "hovermove",

  ON_NCODE_ERROR = "error",
  ON_PW_REQUIRED = "pw_req",
  ON_CONNECTED = "connected",
  ON_DISCONNECTED = "disconnected",

  ON_UPGRADE_NEEDED = "fw_up",
};





export enum IBrushType {
  PEN = 0,
  MARKER = 1,
  PENCIL = 2,
  ERASER = 3,
  BRUSH = 4,
  FOUNTAINPEN = 5,
};

