import { DeviceTypeEnum } from "./pencomm_enum";
import { IPenEvent } from "../DataStructure/Structures";

import "../types";

export const PenEventEnum = {
  PEN_UP: "pen_up",
  PEN_MOVE: "pen_move",
  PEN_MOVE_HOVER: "pen_move_hover",
  PEN_DOWN: "pen_down",

  PAGE_INFO: "page_info",
  PAGE_INFO_HOVER: "page_info_hover",

  PASSWORD_REQUIRED: "pass_required",
  FIRMWARE_UPDATE_REQUIRED: "firmware_update_needed",

  DISCONNECTED: "disconnected",
  CONNECTED: "connected",
  ON_CONNECTED: "on_connected",
  ON_DISCONNECTED: "on_disconnected",

  CODE_ERROR: "recognize error",
  ERROR: "error",
  NONE: "none"
};


function getTimeTicks() {
  // 0.1 milliseconds tick
  var d = new Date();

  // https://stackoverflow.com/questions/7966559/how-to-convert-javascript-date-object-to-ticks
  //
  // The JavaScript Date type's origin is the Unix epoch: midnight on 1 January 1970.
  // The .NET DateTime type's origin is midnight on 1 January 0001.
  // var epochTicks = 621355968000000000;
  // var ticks = d.getTime() * 10000 + epochTicks;
  var ticks = d.getTime() * 10000;
  return ticks;
}

/**
 *
 * @param {DeviceTypeEnum} penType
 * @param {string} eventName
 *
 * @param {PenEvent=} options
 *
 * @return {PenEvent}
 */


export function makePenEvent(penType: DeviceTypeEnum, eventName: string, options: IPenEvent = null) {

  let timeStamp = options.timeStamp;
  if (!timeStamp) timeStamp = getTimeTicks();

  /** @type {PenEvent} */
  let event = {
    event: eventName,
    penType,
    timeStamp,
    isFirstDot: false,
    ...options,
  };

  return event;
}

