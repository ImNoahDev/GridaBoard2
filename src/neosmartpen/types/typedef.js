// /**
//  * @typedef {Object} PenManagerConfiguration
//  *
//  * @property {?function} penEventCallback
//  * @property {?function} puiEventCallback
//  */

// /**
//  * @typedef {Object} PenEventEnum
//  *
//  * @property {string} PEN_UP
//  * @property {string} PEN_MOVE
//  * @property {string} PEN_MOVE_HOVER
//  * @property {string} PEN_DOWN
//  * @property {string} PAGE_INFO
//  * @property {string} PAGE_INFO_HOVER
//  * @property {string} PASSWORD_REQUIRED
//  * @property {string} FIRMWARE_UPDATE_REQUIRED
//  * @property {string} DISCONNECTED
//  * @property {string} CONNECTED
//  * @property {string} ON_CONNECTED
//  * @property {string} ON_DISCONNECTED
//  * @property {string} ERROR
//  * @property {string} NONE
//  */


// /**
//  * @typedef {Object} PenEvent
//  * @property {DeviceTypeEnum} penType
//  * @property {string} event = eventName;
//  *
//  * @property {string=} penId - BT MAC address
//  * @property {number=} penTipMode = 0:pen, 1:eraser
//  *
//  * @property {number=} color = color;
//  * 
//  * @property {number=} section = section;
//  * @property {number=} owner = owner;
//  * @property {number=} book = book;
//  * @property {number=} page = page;
//  *
//  * 
//  * @property {number=} x = x;
//  * @property {number=} y = y;
//  * @property {number=} force = force;
//  * @property {number=} tilt_x = tilt_x;
//  * @property {number=} tilt_y = tilt_y;
//  * @property {number=} twist = twist;
//  * @property {number=} timediff = timediff; // pen에서 나오는 pen down 부터의 ms단위의 time diff
//  * @property {number=} retryCount = retryCount;
//  * @property {number=} timeStamp = timeStamp;
//  * @property {number=} errorCode = errorCode;
//  * @property {string=} infoMessage = infoMessage;
//  * @property {number=} successRate_ndac = successRate_ndac;
//  * @property {number=} successRate_optical = successRate_optical;
//  * @property {boolean=} isFirstDot = false;
//  *
//  * for error
//  * @property {number=} brightness
//  * @property {number=} exposureTime
//  * @property {number=} ndacProcessTime
//  * @property {number=} labelCount
//  * @property {number=} ndacErrorCode
//  * @property {number=} ndacClassType - (0:G3C6, 1:N3C6)
//  * @property {number=} continuousErrorCount
//  */

// /**
//  * @typedef {Object} PUIEvent
//  *
//  * @property {string} penId - BT MAC address
//  * @property {string} cmd
//  * @property {string} dataArea
//  */



// // /********
// //  * RenderDot, kitty 2020-08-10
// //  ********/
// // /**
// //  * @typedef {Object} RenderDot - kitty
// //  *
// //  *
// //  * @property {number} dotType - 1:pen-down(first), 2:moving, 3:pen-up(last)
// //  * @property {number} deltaTime - time delta from the beginning of the stroke
// //  * @property {number} time - absolute time (unix timetick)
// //  * @property {number} f - force
// //  * @property {number} x - x
// //  * @property {number} y - y
// //  */



// /********
//  * NeoStroke, kitty 2020-08-10
//  ********/
// /**
//  * @typedef {Object} NeoStroke - kitty
//  *
//  * @property {string} key : uuidv4 + mac
//  *
//  * @property {number=} color - :-16777216
//  * @property {number=} dotCount - :28
//  * @property {string=} dotsEncoded - :'AACNjAw/heuxQXsUB0JuZ5ILANLRUT9cj7JBj8IHQpNokgwA+/p6PylcsUGuRwhCnWeSCwD9/Hw/cT2uQXsUCUKiaJIMAAAAgD97FKpBXI8KQp9mkgsAAACAPwrXo0H2KAxCoHGSDAAAAIA/cT2eQQrXDUKaZpELAAAAgD97FJZB4XoOQqZ8kQwAAACAP3sUkEFSuA5CoGSQDAAAAIA/9iiKQexRDkKgWo8KAAAAgD8UroNB7FEMQp9XjwwAAACAP/YogEEzMwpCmFuOOwAAAIA/SOGAQY/C/UGfTY4LAAAAgD+F64VBmpn5QaJUjwwAAACAP83MjEEpXPdBnk+PCwAAAIA/CteTQWZm9kGgU48XAAAAgD+F651BSOH4QZpTkQwAAACAP/YooEHsUfxBnFKRIwAAAIA/cT2iQdejBUKbWJIKAAAAgD+amaFBPQoJQppbkQwAAACAP7gen0EK1wxCmFmRDAAAAIA/ZmaaQSlcEEKXZpEMAP38fD8fhZVBj8IUQpJlkAsAvLs7P7gej0FcjxlCjXCQDADR0NA+ZmaIQaRwHUJxc48LAIWEhD5mZoJBFK4eQmxxkAwAlZQUPoXreUGF6x1CaW+QEQDx8PA9H4VzQY/CG0JoZZA='
//  * @property {string=} mac - :'9c:7b:d2:53:09:66'
//  * @property {number=} penTipMode - :0: pen, 1:eraser
//  * @property {number=} strokeType - :1
//  * @property {number=} thickness - :0.20000000298023224
//  * @property {number=} updated - :1597202355308
//  *
//  * @property {number=} startTime - :1597202355308
//  * @property {number=} endTime - :1597202355308
//  * @property {number=} duration - : last dot's time - first dot's time, it should be increase by 1 to use properly
//  *
//  * @property {number=} section - :3
//  * @property {number=} owner - :27
//  * @property {number=} book - :1089
//  * @property {number=} page - :1
//  *
//  * @property {number=} max_force - :1
//  * @property {number=} min_force - :1
//  * @property {number=} avr_force - :1
//  *
//  * @property {number=} max_speed - :1
//  * @property {number=} min_speed - :1
//  * @property {number=} avr_speed - :1
//  *
//  * @property {number=} time_len - :1
//  * @property {number=} min_speed - :1
//  * @property {number=} avr_speed - :1
//  *
//  * @property {Array.<NeoDot>} dotArray
//  *
//  * @property {boolean=} opened
//  */

// /**
//  * @typedef {Object} BT_UUID_DEF - kitty
//  *
//  * @property {string|number} service - PEN_SERVICE_UUID_128
//  * @property {string|number} write - PEN_CHARACTERISTICS_WRITE_UUID_128
//  * @property {string|number} noti - PEN_CHARACTERISTICS_NOTIFICATION_UUID_128
//  */



// /********
//  * NeoDot, kitty 2020-08-10
//  ********/

// /**
//  * @typedef {Object} NeoDot - kitty
//  *
//  *
//  * @property {number} dotType - 1:pen-down(first), 2:moving, 3:pen-up(last)
//  * @property {number} deltaTime - time delta from the beginning of the stroke
//  * @property {number} time - absolute time (unix timetick)
//  * @property {number} f - force
//  * @property {number} x - x
//  * @property {number} y - y
//  */




// /********
//  * TimebasedRenderStrokes, kitty 2020-08-10
//  ********/
// /**
//  * @typedef {Object} TimebasedRenderStrokes - kitty
//  *
//  * @property {number} numStrokes - :-16777216
//  * @property {number} startTime
//  * @property {Array.<NeoStroke>} strokes
//  */

// /**
//  * @typedef {Object} StrokeTimeInfo - kitty
//  *
//  * @property {number} start - whole stroke start time, absoulute time, ms
//  * @property {number} end - whole stroke end time, absoulute time, ms
//  * @property {number} duration - duration (start-end), ms
//  * @property {Array.<NeoStroke>} strokes
//  */

