import { CoordinateTanslater } from "../mapper";
import { IPrintingEvent } from "./PrintDataTypes";
import { ICssSize, ISize } from "./Structures";

export type ICanvasShapeDesc = {
  /** before applying rotation */
  originalPixel: ISize,

  /** after applying rotation */
  pixel: ISize,
  rotation: number,

  /** based on originalPixel */
  css: ICssSize,

  /** based on originalPixel */
  isLandscape: boolean,
}

export type IOnPagePreparedFunction = (event: IPrintingEvent) => void;

export type IPrintingSheetDesc = {
  canvas: HTMLCanvasElement;
  canvasDesc: ICanvasShapeDesc,
  mappingItems: CoordinateTanslater[];
}
