export const SINGLE_CODE_SIZE_PER_INCH = 0.09333333333333334; // (8 / 600) * 7;

export const NCODE_TO_MM_SCALE = 2.3706666666666663; // (25.4 * 8 * 7) / 600; // 1개 ncode의 mm 크기 (600dpi * 8pixel * 7ncode_dots) = 25.4/600 * 8 * 7

export const NCODE_TO_INCH_SCALE = 0.09333333333333334; // (8 * 7) / 600; // 1/600 * 8 * 7


export const PDF_SCALE_TO_INCH = 0.013888888888888888; // 1 / 72; // 72 DPI

export const PDF_DEFAULT_DPI = 72;

export const DISPLAY_DEFAULT_DPI = 96;

export const NCODE_TO_SCREEN_SCALE = 8.96; // NCODE_TO_INCH_SCALE * DISPLAY_DEFAULT_DPI;

export const PDF_TO_SCREEN_SCALE = PDF_SCALE_TO_INCH * DISPLAY_DEFAULT_DPI; // PDF_SCALE_TO_INCH * DISPLAY_DEFAULT_DPI;

export const INCH_TO_MM_SCALE = 25.4;
export const INCH_TO_NCODE_SCALE = 10.7142857142857; // 600 / (8 * 7)

export const DEFAULT_SECTION = 3;

export const DEFAULT_OWNER = 27;

export const DEFAULT_BOOK = 168;



export const NCODE_CLASS6_NUM_DOTS = 7;


export const NU_TO_PU = 6.72; // = 56 / 600 * 72;

export const PU_TO_NU = 0.148809523809524;



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

  // 임시 mapping을 위한 섹션코드, 256
  256: 4096,
}




export const g_nullNcode = { section: -1, owner: -1, book: -1, page: -1 };
export const nullNcode = () => { return { ...g_nullNcode } }

