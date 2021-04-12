import { DeviceTypeEnum } from "./pencomm_enum";
import { IPenEvent } from "nl-lib/common/structures";

export const PenCommEventEnum = {
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

/**
 *
 */
function getTimeTicks(): number {
  // 0.1 milliseconds tick
  const d = new Date();

  // https://stackoverflow.com/questions/7966559/how-to-convert-javascript-date-object-to-ticks
  //
  // The JavaScript Date type's origin is the Unix epoch: midnight on 1 January 1970.
  // The .NET DateTime type's origin is midnight on 1 January 0001.
  // var epochTicks = 621355968000000000;
  // var ticks = d.getTime() * 10000 + epochTicks;
  const ticks = d.getTime() * 10000;
  return ticks;
}


/**
 *
 * @param penType
 * @param eventName
 * @param options
 */
export function makePenEvent(penType: DeviceTypeEnum, eventName: string, options: IPenEvent): IPenEvent {
  if ( !options || options.timeStamp === undefined ) {
    console.error("timeStamp has not been provided");
  }

  const timeStamp = options.timeStamp;
  // if (!timeStamp) timeStamp = getTimeTicks();

  const event: IPenEvent = {
    timeStamp,
    event: eventName,
    systemTime: getTimeTicks(),
    penType,
    isFirstDot: false,
    ...options,
  };

  return event;
}

