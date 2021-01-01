/// <reference types="pdfjs-dist"/>
/// <reference types="@types/pdfjs-dist" />

import { IPageSOBP } from "../DataStructure/Structures";
import { IPaperSize } from "../NcodeSurface/SurfaceDataTypes";
import { ColorConvertMethod } from "../NcodeSurface/CanvasColorConverter";
import { CoordinateTanslater, IPdfToNcodeMapItem } from "../Coordinates";
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
  file: File,
}



export enum NcodePdfScaleMode {
  IMAGE_SIZE_UP_TO_PAGE,
  PAGE_SIZE_DOWN_TO_IMAGE,
  NO_SCALE,

  IMAGE_SIZE_UP_TO_PAGE_PADDING,
}



export interface IPrintOption {
  /** 선택 */
  targetPages: number[],

  /** 선택 */
  pagesPerSheet: 1 | 2 | 4 | 8 | 9 | 16 | 18 | 25 | 32,

  /** 선택 */
  forceToUpdateBaseCode: boolean;

  /** 선택 */
  downloadNcodedPdf: boolean;

  /** 선택 */
  showTooltip: boolean;

  /** 선택 */
  codeDensity: number;      // 1 dot, 2dots, 3dots



  /** 준선택 */
  mediaSize: IPaperSize;

  /** 준선택 */
  printDpi: number;         // 600 DPI, 300 DPI

  /** 준선택 */
  pdfRenderingDpi: number,    // 200DPI 또는 300DPI가 적당

  /** 준선택 */
  colorMode: ColorConvertMethod;

  /** 준선택, 색 농도 최대치, (최대값은 1.0) */
  luminanceMaxRatio: number,

  /** 준선택, 십자가 표시를 그릴지 안 그릴지 */
  drawCalibrationMark: boolean,

  /** 준선택, 페이지의 테두리를 그릴지 안 그릴지 */
  drawFrame: boolean,





  /** 상태 */
  url: string;

  /** 상태 */
  filename: string,

  /** 상태 */
  fingerprint?: string,

  /** 상태 */
  printNcode: boolean;

  /** 상태 */
  readonly dotsInACell: number;   // 7, 바꾸지 말것!

  /** 상태, 문서 전체의 방향, 실제 출력되는 방향은 pages per sheet에 의해 달라짐 (2, 8, 18, 32 등) */
  direction?: "auto" | "portrait" | "landscape";

  /** 상태 */
  docNumPages: number,



  /** 상태, 1페이지/장으로 인쇄할 때의 pageInfo, 복수 페이지/장은 모두, 1페이지/장의 basePageInfo를 가져야 한다 */
  basePageInfo: IPageSOBP;

  /** 상태, mapping storage에 의해 */
  prevBasePageInfo?: IPageSOBP;

  /** 상태, mapping storage에 의해, start page index = 0 */
  basedNcodes?: IPageSOBP[];



  /** 상태, 첫 페이지에 발행된 ncode, Ncode는 pageInfo ~ pageInfo.page + (numPages-1) */
  printPageInfo: IPageSOBP;

  /** 상태, mapping storage에 의해 */
  prevPrintPageInfo?: IPageSOBP;

  /** 상태, 문서 전체에 발행된 코드들, 페이지수 만큼 있다. start page index = 0 */
  printedNcodes?: IPageSOBP[];



  /** 상태, SOBP에 해당되는 페이지에 할당된 인쇄 마진 */
  ncodeMargin: { left: number, top: number },


  /** 상태 */
  needToIssuePrintCode: boolean;

  /** 상태 */
  needToIssueBaseCode: boolean;

  /** 상태, 그리다보드와의 호환성을 위해 */
  magnification: number,

  /** 상태 */
  hasToPutNcode: boolean,

  /** 상태 */
  pdfToNcodeMap?: IPdfToNcodeMapItem;



  /** 시스템, 마크를 그릴 분할 면의 최대 갯수, default: 1 */
  maxPagesPerSheetToDrawMark: number,

  /** 시스템, 십자가 표시가 표시되는 영역, width에 대한 ratio, typically 0.1 (1 = 100%) */
  drawMarkRatio: number,


  /** 시스템, 용지 크기에서 이미지를 배치할 때, 상하좌우 여백  mm 단위*/
  imagePadding: number,     // mm 단위

  /**
   * 시스템
   *
   * 0: scale up image size to papersize,     (default: O, fit printable area: O, fit paper: O, 100%: O)
   * 1: Size down PDF page size to Ncode sheet     (default: X, fit printable area: O, fit paper: O, 100%: X)
   * 2: keep original image size              (default: X, fit printable area: O, fit paper: O, 100%: X)
   * 3: scale down image, and finally scale up image size to paperSize at creating PDF
   * */
  drawImageOnPdfMode: NcodePdfScaleMode,

  /**
   * 시스템
   *
   * 생성할 PDF에서 용지 크기에서, 상하좌우 여백
   *
   *    +------------------------+
   *    |                        |<------- physical paper size
   *    |     +-----------+      |
   *    |     |  +----+   |<-------------- pdfPage size
   *    |     |  |    |<-------------------Ncoded sheet image size
   *    |     |  |    |   |      |
   *    |     |  |    |~~~~~~~~~~|  <== imagePadding (mm)
   *    |     |  +----+   |~~~~~~|  <== pdfPagePadding (mm)
   *    |     +-----------+      |
   *    |                        |
   *    +------------------------+
   *
   *  pdfPagePadding should be smaller than imagePadding
   */
  pdfPagePadding: number, // mm단위



  /**
   * 시스템, 라이브러리
   *
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

  /** 시스템, 라이브러리 */
  completedCallback?: IProgressCallbackFunction;




  /**
   * 시스템,
   *
   * 0: no debug mode, 1: draw lines, 2: draw Ncode debugging info, 3: canvas 색상 값 점검
   */
  debugMode: 0 | 1 | 2 | 3,


  /** 시스템, 프린팅 시트 렌더러 promise 최대 개수 */
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



