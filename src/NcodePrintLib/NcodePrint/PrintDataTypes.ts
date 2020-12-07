/// <reference types="pdfjs-dist"/>
/// <reference types="@types/pdfjs-dist" />

import { IPageSOBP } from "../DataStructure/Structures";
import { IPaperSize } from "../NcodeSurface/SurfaceDataTypes";
import { ColorConvertMethod } from "../NcodeSurface/CanvasColorConverter";




export interface  IFileBrowserReturn {
  result: "success" | "canceled" | "failed",
  url: string,
  file: any,
}


export interface IPrintOption {
  codeDensity: number;      // 1 dot, 2dots, 3dots
  printDpi: number;         // 600 DPI, 300 DPI
  pdfRenderingDpi: number,    // 200DPI 또는 300DPI가 적당
  putCalibrationMark: boolean;
  printNcode: boolean;

  dotsInACell: number;   // 7, 바꾸지 말것!
  mediaSize: IPaperSize;

  /** 문서 전체의 방향, 실제 출력되는 방향은 pages per sheet에 의해 달라짐 (2, 8, 18, 32 등) */
  direction?: "auto" | "portrait" | "landscape";

  colorMode: ColorConvertMethod;

  /** 출력할 종이보다 작은 경우에는 확대할 것 */
  scaleUpToMedia: boolean,

  /* 출력할 종이보다 큰 경우에는 축소할 것 */
  scaleDownToMedia: boolean,

  targetPages: number[],
  pagesPerSheet: 1 | 2 | 4 | 8 | 9 | 16 | 18 | 25 | 32,

  /** 첫 페이지에 발행된 ncode, Ncode는 pageInfo ~ pageInfo.page + (numPages-1) */
  pageInfo: IPageSOBP;
  assignNewCode: boolean;

  /** 그리다보드와의 호환성을 위해 */
  magnification: number,
  marginLeft_nu: number,
  marginTop_nu: number,


  /** 0: no debug mode, 1: draw lines, 2: draw Ncode debugging info, 3: canvas 색상 값 점검 */
  debugMode: 0 | 1 | 2 | 3,

  hasToPutNcode: boolean,

}

/**
 * Page.js
 * Component rendering page of PDF
 **/
export const CSS_DPI = 96.0;

/**
 * width: mm unit
 *
 * height: mm unit
 */
export const MediaSize: { [key: string]: IPaperSize } = {
  A4: { unit: "mm", width: 210, height: 297 },
  A3: { unit: "mm", width: 297, height: 420 },
  B4: { unit: "mm", width: 250, height: 353 },
  B5: { unit: "mm", width: 176, height: 250 },
  Letter: { unit: "mm", width: 216, height: 280 },
};



export interface IPrintingProgress {
  preparedPages: number[],
  numSheetsPrepared: number,
  completion: number,   // 100 = 100%
}

export const PageInfo: { [key: string]: IPageSOBP } = {
  first_page: { section: 3, owner: 27, book: 1068, page: 1 },
  second_page: { section: 3, owner: 27, book: 1069, page: 1 },
  third_page: { section: 3, owner: 27, book: 1070, page: 1 }
}