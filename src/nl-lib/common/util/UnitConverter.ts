import {
  DISPLAY_DEFAULT_DPI,
  NCODE_TO_INCH_SCALE,
  PDF_SCALE_TO_INCH,
  NU_TO_PU,
  PU_TO_NU
} from "../constants";


export function getDisplayRatio(): number {
  const dpr = window.devicePixelRatio || 1;
  return dpr;
}


export function convertNuToInch(n: number) {
  return n * NCODE_TO_INCH_SCALE;
}

export function convertNuToPu(n: number) {
  return n * NU_TO_PU;
}

export function convertPuToNu(n: number) {
  return n * PU_TO_NU;
}

export function convertPuToInch(n: number) {
  // 72 DPI
  return n * PDF_SCALE_TO_INCH;
}

export function convertPuToCss(n: number) {
  return n * PDF_SCALE_TO_INCH * DISPLAY_DEFAULT_DPI * getDisplayRatio();
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

