export const SINGLE_CODE_SIZE_PER_INCH = 0.09333333333333334; // (8 / 600) * 7;

export const NCODE_TO_MM_SCALE = 2.3706666666666663; // (25.4 * 8 * 7) / 600; // 1개 ncode의 mm 크기 (600dpi * 8pixel * 7ncode_dots) = 25.4/600 * 8 * 7

export const NCODE_TO_INCH_SCALE = 0.09333333333333334; // (8 * 7) / 600; // 1/600 * 8 * 7

export const PDF_SCALE_TO_INCH = 0.013888888888888888; // 1 / 72; // 72 DPI

export const PDF_DEFAULT_DPI = 72;

export const DISPLAY_DEFAULT_DPI = 96;

export const NCODE_TO_SCREEN_SCALE = 8.96; // NCODE_TO_INCH_SCALE * DISPLAY_DEFAULT_DPI;

export const PDF_TO_SCREEN_SCALE = PDF_SCALE_TO_INCH * DISPLAY_DEFAULT_DPI; // PDF_SCALE_TO_INCH * DISPLAY_DEFAULT_DPI;

export const INCH_TO_MM = 25.4;

export const DEFAULT_SECTION = 3;

export const DEFAULT_OWNER = 27;

export const DEFAULT_BOOK = 168;


/** 그리다보드 뷰의 확대 최소 값 */
export const PDFVIEW_ZOOM_MIN = 0.1;
/** 그리다보드 뷰의 확대 최대 값 */
export const PDFVIEW_ZOOM_MAX = 5.0;