import {
  // SINGLE_CODE_SIZE_PER_INCH,
  // NCODE_TO_MM_SCALE,
  NCODE_TO_INCH_SCALE,
  // NCODE_TO_SCREEN_SCALE,
  // INCH_TO_MM,

  DEFAULT_SECTION,
  DEFAULT_OWNER,
  DEFAULT_BOOK,

  // PDF_DEFAULT_DPI,
  // DISPLAY_DEFAULT_DPI,
} from "../constants";

import { IPageSOBP, INcodeSOBPxy, ISize, INoteServerSizeInfo } from "../DataStructure/Structures";

const PaperType = {
  paperA4_dummy: {
    name: "paperA4_dummy",
    section: 3,
    owner: 27,
    books: [0],
    Xmin: 0,
    Ymin: 0,
    Xmax: 88.56,
    Ymax: 125.24,
    Mag: 1,
  },

  paperSCKP: {
    section: 3,
    owner: 1013,
    books: [1],
    Xmin: 4.91,
    Ymin: 4.91,
    Xmax: 113.28,
    Ymax: 81.66,
    Mag: 1,
  },
  paperSCKPad: {
    section: 3,
    owner: 1013,
    books: [2],
    Xmin: 0,
    Ymin: 0,
    Xmax: 88.55,
    Ymax: 49.76,
    Mag: 2,
  },

  paperA4300: {
    section: 3,
    owner: 27,
    books: [168],
    Xmin: 3.12,
    Ymin: 3.12,
    Xmax: 91.68,
    Ymax: 128.36,
    Mag: 1,
  },

  paperResearch: {
    section: 3,
    owner: 27,
    books: [205],
    Xmin: 5.48,
    Ymin: 5.48,
    Xmax: 102.47,
    Ymax: 131.99,
    Mag: 1,
  },

  paperDnote: {
    section: 3,
    owner: 27,
    books: [232, 233, 234, 235, 236],
    Xmin: 5.48,
    Ymin: 5.48,
    Xmax: 84.76,
    Ymax: 113.85,
    Mag: 1,
  },

  paperA450: {
    section: 3,
    owner: 27,
    book: 517,
    Xmin: 5.48,
    Ymin: 5.48,
    Xmax: 94.04,
    Ymax: 130.72,
    Mag: 1,
  },

  paperNring: {
    section: 3,
    owner: 27,
    book: 603,
    Xmin: 5.48,
    Ymin: 5.48,
    Xmax: 68.73,
    Ymax: 94.04,
    Mag: 1,
  },

  paperIdeaPad: {
    section: 3,
    owner: 27,
    book: 609,
    Xmin: 5.48,
    Ymin: 16.02,
    Xmax: 94.04,
    Ymax: 130.72,
    Mag: 1,
  },

  paperNpro: {
    section: 3,
    owner: 27,
    book: 615,
    Xmin: 5.48,
    Ymin: 5.48,
    Xmax: 64.52,
    Ymax: 83.07,
    Mag: 1,
  },

  paperCollege: {
    section: 3,
    owner: 27,
    books: [619, 655, 656, 657],
    Xmin: 5.48,
    Ymin: 5.48,
    Xmax: 96.57,
    Ymax: 123.55,
    Mag: 1,
  },

  paperMskin: {
    section: 3,
    owner: 27,
    books: [700],
    Xmin: 1.26,
    Ymin: 1.67,
    Xmax: 55.91,
    Ymax: 89.21,
    Mag: 1,
  },
  paperMSK701: {
    section: 3,
    owner: 27,
    books: [701],
    Xmin: 4.22,
    Ymin: 4.22,
    Xmax: 59.53,
    Ymax: 92.85,
    Mag: 1,
  },

  paperMSK703: {
    section: 3,
    owner: 27,
    books: [703, 704],
    Xmin: 4.61,
    Ymin: 4.61,
    Xmax: 59.43,
    Ymax: 93.17,
    Mag: 1,
  },

  paperMSK705: {
    section: 3,
    owner: 27,
    book: 705,
    Xmin: 3.12,
    Ymin: 3.12,
    Xmax: 57.94,
    Ymax: 91.68,
    Mag: 1,
  },

  paperMSK708: {
    section: 3,
    owner: 27,
    book: 708,
    Xmin: 3.12,
    Ymin: 3.12,
    Xmax: 83.24,
    Ymax: 108.54,
    Mag: 1,
  },

  paperA4_POD: {
    section: 3,
    owner: 27,
    book: 1068,
    Xmin: 5,
    Ymin: 5,
    Xmax: 93.46,
    Ymax: 130.24,
    Mag: 1,
  },
};



class PaperInfo {
  CODE_DEFAULT: IPageSOBP;

  constructor() {
    this.CODE_DEFAULT = {
      section: DEFAULT_SECTION,
      owner: DEFAULT_OWNER,
      book: DEFAULT_BOOK,
      page: 1,
    }
  }

  /**
   *
   * @param pageInfo
   */
  isPlatePaper = (pageInfo: IPageSOBP): boolean => {
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
  isPUI = (coordInfo: INcodeSOBPxy): boolean => {
    const { owner, book, page, } = coordInfo;
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
   */
  getPaperSize = (pageInfo: IPageSOBP): ISize => {
    // const { section, owner, book, page } = pageInfo;
    let size: ISize = { width: 0, height: 0 };
    let paper_info = this.getPaperInfo(pageInfo);

    size.width = paper_info.Xmax - paper_info.Xmin;
    size.height = paper_info.Ymax - paper_info.Ymin;

    // console.log("width=" + size.width + "  height=" + size.height);
    return size;
  }

  /**
   * paper size를 해당 DPI의 pixel 단위로 돌려 준다.
   * @param pageInfo
   * @param dpi
   */
  getPaperSize_px = (pageInfo: IPageSOBP, dpi: number): ISize => {
    // const { section, owner, book, page } = pageInfo;
    let size = this.getPaperSize(pageInfo);
    size.width = size.width * NCODE_TO_INCH_SCALE * dpi;
    size.height = size.height * NCODE_TO_INCH_SCALE * dpi;

    return size;
  }

  /**
   * paper size를 해당 inch 단위로 돌려 준다.
   * @param pageInfo
   */
  getPaperSize_inch = (pageInfo: IPageSOBP): ISize => {
    // const { section, owner, book, page, } = pageInfo;

    let size = this.getPaperSize(pageInfo);
    size.width = size.width * NCODE_TO_INCH_SCALE;
    size.height = size.height * NCODE_TO_INCH_SCALE;

    return size;
  };

  /**
   * paper size를 해당 inch 단위로 돌려 준다.
   * @public
   * @param {{section?:number, owner:number, book:number, page?:number}} pageInfo
   */
  getPaperInfo = (pageInfo: IPageSOBP): INoteServerSizeInfo => {
    const { owner, book } = pageInfo;

    let info = PaperType.paperA4_dummy;
    // let found = false;

    let keys = Object.keys(PaperType);
    for (let j = 0; j < keys.length; j++) {
      let key = keys[j];
      let value = PaperType[key];

      if (Array.isArray(value.book)) {
        let idx = value.book.findIndex((elem) => elem === book);
        if (value.owner === owner && idx > -1) {
          info = value;
          info.name = key;
          // found = true;
          break;
        }
      } else {
        // array가 아니면 숫자
        if (value.owner === owner && value.book === book) {
          info = value;
          info.name = key;
          // found = true;
          break;
        }
      }
    }
    return info;
  }
}

export const paperInfo = (function () {
  return new PaperInfo();
})();