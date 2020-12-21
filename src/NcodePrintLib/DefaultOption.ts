import { IPageSOBP } from "./DataStructure/Structures";
import { IPrintOption, MediaSize } from "./NcodePrint/PrintDataTypes";
import { ColorConvertMethod } from "./NcodeSurface/CanvasColorConverter";

// export const g_debugURL = "./Portrait, 초등학교 4학년 4P.pdf";
// export const g_debugFilename = "./Portrait, 초등학교 4학년 4P.pdf";

export const g_debugURL = "./2P_test.pdf";
export const g_debugFilename = "./2P_test.pdf";

export const g_nullNcode = { section: -1, owner: -1, book: -1, page: -1 };

export const g_defaultPrintOption: IPrintOption = {
  /** DO NOT MODIFY */
  dotsInACell: 7,  // DO NOT MODIFY

  /** DO NOT MODIFY */
  maxPagesPerSheetToDrawMark: 1,    // DO NOT MODIFY

  // url: "./landscape, 그리다보드_테스트.pdf",
  // url: "./A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf",
  // url: "./A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf",
  url: undefined,
  filename: undefined,

  needToIssueCode: true,
  forceToIssueNewCode: false,
  pageInfo: { ...g_nullNcode },
  ncodeMargin: { left: -1, top: -1 },

  codeDensity: 2,
  printDpi: 600,
  pdfRenderingDpi: 300,
  downloadNcodedPdf: true,

  printNcode: true,
  mediaSize: MediaSize.A4,

  // colorMode: ColorConvertMethod.BLUEPRINT,
  colorMode: ColorConvertMethod.ANDROID_STYLE,

  /** 출력할 종이보다 작은 경우에는 확대할 것 */
  scaleUpToMedia: false,

  /** 출력할 종이보다 큰 경우에는 축소할 것 */
  scaleDownToMedia: false,

  magnification: 1,

  docNumPages: 0,
  targetPages: [],

  hasToPutNcode: true,
  luminanceMaxRatio: 0.8,
  drawCalibrationMark: true,
  drawMarkRatio: 0.1,
  drawFrame: false,

  pagesPerSheet: 4,

  /** 코드 출력물의 상하좌우 여백, mm단위 */
  padding: 15,     // mm 단위

  showTooltip: true,

  numThreads: 10,
  debugMode: 0
};

export const g_defaultNcode: IPageSOBP = {
  section: 3,
  owner: 27,
  book: 1068,
  page: 0,
}