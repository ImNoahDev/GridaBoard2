/// <reference types="pdfjs-dist"/>
/// <reference types="@types/pdfjs-dist" />

import { IPageSOBP } from "../DataStructure/Structures";
import { IPaperSize } from "../NcodeSurface/SurfaceDataTypes";
import { ColorConvertMethod } from "../NcodeSurface/CanvasColorConverter";
import { CoordinateTanslater, IPdfMappingDesc } from "../Coordinates";
import { IPrintingSheetDesc } from "../NcodeSurface/SheetRenderer";



export interface IPrintingEvent {
  /** 인쇄한 종이 번호 */
  sheetIndex: number,

  /** 인쇄된 페이지들 */
  pageNums: number[],

  /** 0% ~ 100% (0~100) */
  completion: number,

  /** code mapping 정보 */
  mappingItems?: CoordinateTanslater[],

  /** sheet의 image */
  sheetDesc?: IPrintingSheetDesc,
}

export interface IPrintingReport {
  status: string,
  /** 준비된 페이지들 */
  preparedPages?: number[],
  /** 준비된 페이지 수 */
  numPagesPrepared?: number,

  /** 인쇄할 총 페이지 수 */
  numPagesToPrint?: number,

  /** 준비된 시트 단위 (용지) 수 */
  numSheetsPrepared?: number,

  /** 100 = 100% */
  pageCompletion?: number,

  /** 인쇄할 당시의 인쇄 옵션 */
  printOption?: IPrintOption,

  totalCompletion: number,
}


export interface IFileBrowserReturn {
  result: "success" | "canceled" | "failed",
  url: string,
  fileDesc: any,
}


export interface IPrintOption {
  url: string;

  filename: string,

  codeDensity: number;      // 1 dot, 2dots, 3dots
  printDpi: number;         // 600 DPI, 300 DPI
  pdfRenderingDpi: number,    // 200DPI 또는 300DPI가 적당
  printNcode: boolean;

  readonly dotsInACell: number;   // 7, 바꾸지 말것!
  mediaSize: IPaperSize;

  /** 문서 전체의 방향, 실제 출력되는 방향은 pages per sheet에 의해 달라짐 (2, 8, 18, 32 등) */
  direction?: "auto" | "portrait" | "landscape";

  colorMode: ColorConvertMethod;

  /** 출력할 종이보다 작은 경우에는 확대할 것 */
  scaleUpToMedia: boolean,

  /* 출력할 종이보다 큰 경우에는 축소할 것 */
  scaleDownToMedia: boolean,

  docNumPages: number,

  targetPages: number[],
  pagesPerSheet: 1 | 2 | 4 | 8 | 9 | 16 | 18 | 25 | 32,

  /** 첫 페이지에 발행된 ncode, Ncode는 pageInfo ~ pageInfo.page + (numPages-1) */
  pageInfo: IPageSOBP;

  /** SOBP에 해당되는 페이지에 할당된 인쇄 마진 */
  ncodeMargin: { left: number, top: number },
  /** 문서 전체에 발행된 코드들, 페이지수 만큼 있다. start page = 0 */
  issuedNcodes?: IPageSOBP[];

  needToIssueCode: boolean;

  forceToIssueNewCode: boolean;

  downloadNcodedPdf: boolean;

  /** 그리다보드와의 호환성을 위해 */
  magnification: number,

  hasToPutNcode: boolean,

  /** 색 농도 최대치, (최대값은 1.0) */
  luminanceMaxRatio: number,


  /** 마크를 그릴 분할 면의 최대 갯수, default: 1 */
  maxPagesPerSheetToDrawMark: number,

  /** 십자가 표시가 표시되는 영역, width에 대한 ratio, typically 0.1 (1 = 100%) */
  drawMarkRatio: number,

  /** 십자가 표시를 그릴지 안 그릴지 */
  drawCalibrationMark: boolean,
  // putCalibrationMark: boolean;


  /** 페이지의 테두리를 그릴지 안 그릴지 */
  drawFrame: boolean,

  /** 상하좌우 여백  mm 단위*/
  padding: number,     // mm 단위

  pdfMappingDesc?: IPdfMappingDesc;

  /**
   * 인쇄할 페이지에서 4씩 카운트가 증가되는 call back,
   * 100% = (numPages * 4) +(numSheets * 3)
   *
   *
   * 이 카운트를 받아서, 누적한 값을 countAcc라고 하면,
   *
   *  const { targetPages, pagesPerSheet } = this.printOption;
   *  const numPages = targetPages.length;
   *  const numSheets = Math.ceil(numPages / pagesPerSheet);
   *  const maxCount = (numPages * 4) + (numSheets * 3);
   *  const progressPercent = (countAcc / maxCount)*100;
   *
   **/
  progressCallback?: IProgressCallbackFunction;
  completedCallback?: IProgressCallbackFunction;

  showTooltip: boolean;



  
  /** 0: no debug mode, 1: draw lines, 2: draw Ncode debugging info, 3: canvas 색상 값 점검 */
  debugMode: 0 | 1 | 2 | 3,


  /** 프린팅 시트 렌더러 promise 최대 개수 */
  numThreads: number,

}

export type IProgressCallbackFunction = (event?: { status: string }) => void;

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

  /** 10mm씩 줄인 것 */
  // A4: { unit: "mm", width: 200, height: 287 },
  // A3: { unit: "mm", width: 297, height: 410 },
  // B4: { unit: "mm", width: 240, height: 343 },
  // B5: { unit: "mm", width: 166, height: 240 },
  // Letter: { unit: "mm", width: 206, height: 270 },

  /** 정상적인 것 */
  A4: { unit: "mm", name: "A4", width: 210, height: 297 },
  A3: { unit: "mm", name: "A3", width: 297, height: 420 },
  B4: { unit: "mm", name: "B4", width: 250, height: 353 },
  B5: { unit: "mm", name: "B5", width: 176, height: 250 },
  Letter: { unit: "mm", name: "Letter", width: 216, height: 280 },
};


export type IUnitString = "mm" | "pt" | "pu" | "css" | "px" | "in" | "cm" | "pc" | "em" | "ex";



export const PageInfo: { [key: string]: IPageSOBP } = {
  first_page: { section: 3, owner: 27, book: 1068, page: 1 },
  second_page: { section: 3, owner: 27, book: 1069, page: 1 },
  third_page: { section: 3, owner: 27, book: 1070, page: 1 }
}