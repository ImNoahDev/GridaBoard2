import { paperType } from "./NcodeSurfaceDataJson";
import { INoteServerItem, IPaperSize } from "./SurfaceDataTypes";

import { IPageSOBP, INcodeSOBPxy, ISize, UNIT_TO_DPI } from "../DataStructure/Structures";
import { INCH_TO_MM_SCALE, NCODE_TO_INCH_SCALE, PDF_DEFAULT_DPI } from "./NcodeConstans";


// kitty, Ncode SDK를 읽고 다음의 페이지수를 채워 넣을 것
// 2020/12/13
export const g_availablePagesInSection = {
  0: 512,
  1: 512,
  2: 512,
  3: 512,
  4: 512,
  5: 512,
  6: 512,
  7: 512,
  8: 512,
  9: 512,
  10: 512,
  11: 512,
  12: 512,
  13: 512,
  14: 512,
  15: 512,
}


/**
 *
 * @param pageInfo
 */
export function isPlatePaper(pageInfo: IPageSOBP): boolean {
  const { owner, book } = pageInfo;
  if (owner === 1013 && book === 2) {
    return true;
  }

  return false;
}



/**
 *
 * @param coordInfo
 */
export function isPUI(pageInfo: INcodeSOBPxy): boolean {
  const { owner, book, page, } = pageInfo;
  // console.log( `isPUI: ${owner}.${book}.${page}`);
  if (owner === 27 && book === 161 && page === 1) {
    return true;
  }

  if (owner === 1013 && book === 1) {
    // page === 4, Smart plate
    // page === 1, Plate paper

    return true;
  }

  return false;
}



/**
 *
 * @param pageInfo
 * @return paper size in NU
 */
function getNPaperSize_nu(item: IPageSOBP | INoteServerItem): ISize {
  let desc = item as INoteServerItem;

  if (!Object.prototype.hasOwnProperty.call(item, "margin")) {
    const pageInfo = item as IPageSOBP;
    desc = getNPaperInfo(pageInfo);
  }
  const margin = desc.margin;
  return {
    width: margin.Xmax - margin.Xmin,
    height: margin.Ymax - margin.Ymin
  };
}


function getNPaperSize_dpi(item: IPageSOBP | INoteServerItem, dpi: number): ISize {
  // const { section, owner, book, page } = pageInfo;
  const size = getNPaperSize_nu(item);

  return {
    width: size.width * NCODE_TO_INCH_SCALE * dpi,
    height: size.height * NCODE_TO_INCH_SCALE * dpi,
  }
}

export function getNPaperSize_pu(item: IPageSOBP | INoteServerItem): ISize {
  return getNPaperSize_dpi(item, PDF_DEFAULT_DPI);
}


export function getMediaSize_pu(mediaType: IPaperSize): ISize {
  const { width, height } = mediaType;

  return {
    width: width * INCH_TO_MM_SCALE * PDF_DEFAULT_DPI,
    height: height * INCH_TO_MM_SCALE * PDF_DEFAULT_DPI,
  }
}

/**
 * paper size를 해당 inch 단위로 돌려 준다.
 * @param pageInfo
 */
export function getNPaperInfo(pageInfo: IPageSOBP): INoteServerItem {
  let section = -1, owner = -1, book = -1;
  if( pageInfo ) {
    section = pageInfo.section;
    owner = pageInfo.owner;
    book = pageInfo.book;
  }
  // const { section, owner, book } = pageInfo;

  let found = paperType.paperA4_dummy;
  let found_key = "paperA4_dummy";

  const keys = Object.keys(paperType);
  for (let j = 0; j < keys.length; j++) {
    const key = keys[j];
    const value = paperType[key];

    const idx = value.books.indexOf(book);
    if (idx > -1) {
      if (section === value.section && owner === value.owner) {
        found = value;
        found_key = key;
        break;
      }
    }
  }

  const desc: INoteServerItem = {
    id: found_key,
    pageInfo,
    margin: {
      Xmin: found.Xmin,
      Xmax: found.Xmax,
      Ymin: found.Ymin,
      Ymax: found.Ymax,
    },
    glyphData: "",
  };

  return desc;
}



export function getSurfaceSize_dpi(size: IPaperSize, dpi: number, isLandscape, padding = 0) {

  /** numerator of converting to INCH */
  const numerator = UNIT_TO_DPI[size.unit];
  const mm_numerator = UNIT_TO_DPI["mm"];
  const ratio = 1.0;

  let width = size.width * ratio * dpi / numerator;
  let height = size.height * ratio * dpi / numerator;

  padding = padding * ratio * dpi / mm_numerator;
  width -= padding;
  height -= padding;

  width = Math.floor(width);
  height = Math.floor(height);

  if (isLandscape) {
    return {
      width: height,
      height: width,
    };
  }

  return {
    width: width,
    height: height,
  };
}


export function getSurfaceSize_px_600dpi(size: IPaperSize, isLandscape, padding = 0) {
  return getSurfaceSize_dpi(size, UNIT_TO_DPI["600dpi"], isLandscape, padding);
}

export function getSurfaceSize_inch(size: IPaperSize, isLandscape, padding = 0) {
  return getSurfaceSize_dpi(size, 1, isLandscape, padding);
}

export function getSurfaceSize_mm(size: IPaperSize, isLandscape, padding = 0) {
  return getSurfaceSize_dpi(size, UNIT_TO_DPI["mm"], isLandscape, padding);
}

export function getSurfaceSize_css(size: IPaperSize, isLandscape, padding = 0) {
  return getSurfaceSize_dpi(size, UNIT_TO_DPI["css"], isLandscape, padding);
}


export function getSurfaceSize_pu(size: IPaperSize, isLandscape, padding = 0) {
  return getSurfaceSize_dpi(size, UNIT_TO_DPI["pu"], isLandscape, padding);
}

export function isPortrait(size: ISize) {
  return size.width < size.height;
}

export function getCssDpi() {
  return UNIT_TO_DPI["css"];
}


