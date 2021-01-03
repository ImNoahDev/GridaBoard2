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
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

export function getDisplayRatio(): number {
  const dpr = window.devicePixelRatio || 1;
  return dpr;
}

export function scaleCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');

  // Get the device pixel ratio, falling back to 1.
  const dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  const rect = canvas.getBoundingClientRect();
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
    canvas.height = height;
    canvas.width = width;
    canvas.style.width = '';
    canvas.style.height = '';
  }

  // scale the drawing context so everything will work at the higher ratio
  context.scale(ratio, ratio);
}


export function convertNuToInch(n: number) {
  return n * CONST.NCODE_TO_INCH_SCALE;
}

export function convertNuToPu(n: number) {
  return n * CONST.NCODE_TO_INCH_SCALE * CONST.PDF_DEFAULT_DPI;
}
export function convertPuToInch(n: number) {
  // 72 DPI
  return n * CONST.PDF_SCALE_TO_INCH;
}

export function convertPuToCss(n: number) {
  return n * CONST.PDF_SCALE_TO_INCH * CONST.DISPLAY_DEFAULT_DPI * getDisplayRatio();
}


export function convertPuTOCssPoint(sz: { width: number, height: number }) {
  return {
    width: convertPuToCss(sz.width),
    height: convertPuToCss(sz.height),
  };
}


export function convertPuTOCssPoint_int(sz: { width: number, height: number }) {
  return {
    width: Math.floor(convertPuToCss(sz.width)),
    height: Math.floor(convertPuToCss(sz.height))
  };
}



export function isSamePage(page1: IPageSOBP, page2: IPageSOBP) {
  if (page1.page !== page2.page || page1.book !== page2.book || page1.owner !== page2.owner || page1.section !== page2.section) {
    return false;
  }

  return true;
}
