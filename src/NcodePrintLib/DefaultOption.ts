import { ColorConvertMethod } from ".";
import { IPrintOption, MediaSize } from "./NcodePrint/PrintDataTypes";

export const g_defaultPrintOption: IPrintOption = {
  assignNewCode: true,

  pageInfo: { section: 3, owner: 27, book: 1068, page: 401 },

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
  pagesPerSheet: 2,

  debugMode: 0,
  hasToPutNcode: true,
};
