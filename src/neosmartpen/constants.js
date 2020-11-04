/** @type {number} */
export const SINGLE_CODE_SIZE_PER_INCH = 0.09333333333333334; // (8 / 600) * 7;

/** @type {number} */
export const NCODE_TO_MM_SCALE = 2.3706666666666663; // (25.4 * 8 * 7) / 600; // 1개 ncode의 mm 크기 (600dpi * 8pixel * 7ncode_dots) = 25.4/600 * 8 * 7

/** @type {number} */
export const NCODE_TO_INCH_SCALE = 0.09333333333333334; // (8 * 7) / 600; // 1/600 * 8 * 7

/** @type {number} */
export const NCODE_TO_SCREEN_SCALE = 8.96; // NCODE_TO_INCH_SCALE * DISPLAY_DEFAULT_DPI;

/** @type {number} */
export const INCH_TO_MM = 25.4;


/** @type {number} */
export const DEFAULT_SECTION = 3;

/** @type {number} */
export const DEFAULT_OWNER = 27;

/** @type {number} */
export const DEFAULT_BOOK = 168;


/** @type {number} */
export const PDF_DEFAULT_DPI = 72;

/** @type {number} */
export const DISPLAY_DEFAULT_DPI = 96;
