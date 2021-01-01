import { DeviceTypeEnum } from "./Enums";

type UNIT_STRING = "nu" | "pu" | "css" | "150dpi" | "200dpi" | "300dpi" | "600dpi";

/**
 *
 */
export const UNIT_TO_DPI = {
  "mm": 25.4,
  "pu": 72,
  "css": 96,
  "nu": 10.71428571,    // 600 / (8*7)
  "600dpi": 600,
  "300dpi": 300,
  "200dpi": 200,
  "150dpi": 150,
};


export const DPI_TO_UNIT = {
  25.4: "mm",
  72: "pu",
  96: "css",
  10.71428571: "nu",    // 600 / (8*7)
  600: "600dpi",
  300: "300dpi",
  200: "200dpi",
  150: "150dpi",
};


export type ISize = {
  width: number;
  height: number;
}

export type ICssSize = {
  width: string;
  height: string;
}

export type IPoint = {
  x: number,
  y: number,
}

export type IPointDpi = {
  unit?: UNIT_STRING,
  dpi?: number,
  x: number,
  y: number,
}


export type ISizeDpi = {
  unit?: UNIT_STRING,
  dpi?: number,
  width: number;
  height: number;
}


export type IPointForce = {
  x: number,
  y: number,
  f: number,
}

export type IPageSOBP = {
  section: number,
  book: number,
  owner: number,
  page: number
}



export type IRectDpi = {
  unit?: UNIT_STRING,
  dpi?: number,
  x: number,
  y: number,
  width: number,
  height: number,
}

export function stringToDpiNum(unit: string) {
  let dpi = UNIT_TO_DPI[unit];

  if (!dpi) {
    const index = unit.indexOf("dpi");
    if (index > 0)
      dpi = parseInt(unit.substr(0, index));
    else
      dpi = parseInt(unit);
  }

  return dpi;
}

export function autoSetDpi(opt: any) {
  if (opt.unit && !opt.dpi) {
    opt.dpi = stringToDpiNum(opt.unit);
  }
  return opt;
}

export function scalePoint(pt: IPointDpi, scale: number) {
  pt.x = pt.x / scale;
  pt.y = pt.y / scale;
  return pt;
}



export type INcodeSOBPxy = IPageSOBP & IPoint;
// export type INcodeSOBPxy = {
//   section: number,
//   book: number,
//   owner: number,
//   page: number,
//   x: number,
//   y: number,
// }


export type IWritingSurfaceInfo = {
  section?: number,
  owner?: number,
  book?: number,
  page?: number,
  Xmin: number,
  Ymin: number,
  Xmax: number,
  Ymax: number,
  Mag?: number
};


export type INoteServerSizeInfo = {
  section?: number,
  owner?: number,
  books?: number[],
  page?: number,
  Xmin: number,
  Ymin: number,
  Xmax: number,
  Ymax: number,
  Mag?: number
};



export type IPenEvent = {
  timeString: number;  //timeString;
  systemTime?: number;

  event?: string; // eventName;
  timediff?: number;  //timediff; // pen에서 나오는 pen down 부터의 ms단위의 time diff

  penType?: DeviceTypeEnum;

  penId?: string; // - BT MAC address
  penTipMode?: number; //  0: pen, 1: eraser
  color?: number;  //color;

  section?: number;  //section;
  owner?: number;  //owner;
  book?: number;  //book;
  page?: number;  //page;

  // coordinates
  x?: number;  //x;
  y?: number;  //y;

  // pen state
  force?: number;  //force;
  tilt_x?: number;  //tilt_x;
  tilt_y?: number;  //tilt_y;
  twist?: number;  //twist;

  retryCount?: number;  //retryCount;
  errorCode?: number;  //errorCode;
  infoMessage?: string;  //infoMessage;
  successRate_ndac?: number;   //successRate_ndac;
  successRate_optical?: number;    //successRate_optical;
  isFirstDot?: boolean;    //false;

  // for error
  brightness?: number;
  exposureTime?: number;
  ndacProcessTime?: number;
  labelCount?: number;
  ndacErrorCode?: number;
  ndacClassType?: number;  // - (0:G3C6, 1:N3C6)
  continuousErrorCount?: number;
}


export type IBrushState = {
  thickness: number,
  color: string,    // "rgba(0,0,0,255)"

}



export type IPageOverview = {
  rotation: number,

  /** pdf의 viewport가 rotation 0일 때의 크기로 판단(rotation은 고려하지 않음) */
  landscape: boolean,

  /** pdf의 viewport의 rotation은 고려하지 않음, 각 페이지에서 rotation된 것으로 rendering */
  sizePu: ISize,
}
