import { ColorConvertMethod } from ".";
import { IPrintOption, MediaSize } from "./NcodePrint/PrintDataTypes";

export const g_defaultPrintOption: IPrintOption = {
  url: "./landscape, 그리다보드_테스트.pdf",
  // url: "./A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf",
  // url: "./Portrait, 초등학교 4학년 4P.pdf",
  // url: "./A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf",


  assignNewCode: true,

  pageInfo: { section: 3, owner: 27, book: 1068, page: 114 },

  dotsInACell: 7,  // DO NOT MODIFY

  codeDensity: 2,
  printDpi: 600,
  pdfRenderingDpi: 300,
  putCalibrationMark: true,
  printNcode: true,
  mediaSize: MediaSize.A4,

  // colorMode: ColorConvertMethod.BLUEPRINT,
  colorMode: ColorConvertMethod.ANDROID_STYLE,

  /** 출력할 종이보다 작은 경우에는 확대할 것 */
  scaleUpToMedia: false,

  /** 출력할 종이보다 큰 경우에는 축소할 것 */
  scaleDownToMedia: false,

  magnification: 1,
  marginLeft_nu: -1,
  marginTop_nu: -1,

  targetPages: [],

  debugMode: 0,
  hasToPutNcode: true,
  luminanceMaxRatio: 0.8,
  drawCalibrationMark: true,
  drawMarkRatio: 0.1,
  drawFrame: false,

  pagesPerSheet: 1,

  padding: 10,     // mm 단위
};
