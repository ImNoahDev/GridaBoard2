import { IPageSOBP, IPaperSize } from "../structures";

export const PageInfo: { [key: string]: IPageSOBP } = {
  first_page: { section: 3, owner: 27, book: 1068, page: 1 },
  second_page: { section: 3, owner: 27, book: 1069, page: 1 },
  third_page: { section: 3, owner: 27, book: 1070, page: 1 }
}




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


export const UNIT_TO_DPI = {
  "mm": 25.4,
  "pu": 72,
  "css": 96,
  "nu": 10.71428571,    // 600 / (8*7)
  "600dpi": 600,
  "300dpi": 300,
  "200dpi": 200,
  "150dpi": 150,
};


export const DPI_TO_UNIT = {
  25.4: "mm",
  72: "pu",
  96: "css",
  10.71428571: "nu",    // 600 / (8*7)
  600: "600dpi",
  300: "300dpi",
  200: "200dpi",
  150: "150dpi",
};

