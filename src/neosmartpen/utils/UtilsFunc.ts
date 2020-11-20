import { backingStoreRatio } from "./JsUtils";
import * as CONST from "../constants";
import { IPageSOBP } from "../DataStructure/Structures";
export { backingStoreRatio };


/**
 * @return {string} - uuid
 */
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    let r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

export function getDisplayRatio(): number {
  let dpr = window.devicePixelRatio || 1;
  return dpr;
}

export function scaleCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');

  // Get the device pixel ratio, falling back to 1.
  let dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  let rect = canvas.getBoundingClientRect();
  const { width, height } = rect;

  // determine the actual ratio we want to draw at
  const ratio = dpr / backingStoreRatio(context);

  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.


  if (devicePixelRatio !== backingStoreRatio(context)) {
    // set the 'real' canvas size to the higher width/height
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    // ...then scale it back down with CSS
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }
  else {
    // this is a normal 1:1 device; just scale it simply
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = '';
    canvas.style.height = '';
  }

  // scale the drawing context so everything will work at the higher ratio
  context.scale(ratio, ratio);
}


export function ncodeToInch(n: number): number {
  return n * CONST.NCODE_TO_INCH_SCALE;
}

export function ncodeToDisplayPixel(n: number): number {
  return n * CONST.NCODE_TO_INCH_SCALE * CONST.DISPLAY_DEFAULT_DPI * getDisplayRatio();
}



export function pdfSizeUnitToInch(n: number): number {
  // 72 DPI
  return n * CONST.PDF_SCALE_TO_INCH;
}

export function pdfSizeUnitToDIsplayPixel(n: number): number {
  return n * CONST.PDF_SCALE_TO_INCH * CONST.DISPLAY_DEFAULT_DPI * getDisplayRatio();
}


export function pdfSizeToDIsplayPixel(sz: { width: number, height: number }): { width: number, height: number } {
  return {
    width: pdfSizeUnitToDIsplayPixel(sz.width),
    height: pdfSizeUnitToDIsplayPixel(sz.height),
  };
}


export function isSamePage(page1: IPageSOBP, page2: IPageSOBP): boolean {
  if (page1.page !== page2.page || page1.book !== page2.book || page1.owner !== page2.owner || page1.section !== page2.section) {
    return false;
  }

  return true;
}
