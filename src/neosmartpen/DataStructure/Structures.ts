import { DeviceTypeEnum } from "./Enums";

export interface ISize {
  width: number;
  height: number;
}

export interface IPoint {
  x: number,
  y: number,
}

export interface IPointForce {
  x: number,
  y: number,
  f: number,
}

export interface IPageSOBP {
  section: number,
  book: number,
  owner: number,
  page: number
}



export interface INcodeSOBPxy {
  section: number,
  book: number,
  owner: number,
  page: number,
  x: number,
  y: number,
}


export interface IWritingSurfaceInfo {
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


export interface INoteServerSizeInfo {
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



export interface IPenEvent {
  event?: string; // eventName;

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

  timediff?: number;  //timediff; // pen에서 나오는 pen down 부터의 ms단위의 time diff
  retryCount?: number;  //retryCount;
  timeStamp?: number;  //timeStamp;
  errorCode?: number;  //errorCode;
  infoMessage?: string;  //infoMessage;
  successRate_ndac?: number;   //successRate_ndac;
  successRate_optical?: number;    //successRate_optical;
  isFirstDot?: boolean;    //false;

  // for error
  brightness?: number;
  exposureTime?: number;
  ndacTime?: number;
  labelCount?: number;
  ndacErrorCode?: number;
  ndacClassType?: number;  // - (0:G3C6, 1:N3C6)
  continuousErrorCount?: number;
}
