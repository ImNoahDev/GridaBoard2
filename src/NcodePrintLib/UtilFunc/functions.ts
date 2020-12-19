/// util functions, UTIL, utils

import { sprintf } from "sprintf-js";
import { isObject } from "util";
import { IPageSOBP } from "../DataStructure/Structures";
import { IUnitString } from "../NcodePrint/PrintDataTypes";
import { g_availablePagesInSection } from "../NcodeSurface/SurfaceInfo";

export function compareObject(curr: Object, next: Object, header = "") {
  for (const [key, value] of Object.entries(next)) {
    if (curr[key] !== value) {
      console.log(`[${header}] state[${key}] was changed, from "${curr[key]} to "${value}"`);
    }
  }
}



export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}


export function makePdfId(fingerprint: string, pagesPerSheet: number) {
  return fingerprint + "/" + pagesPerSheet.toString();
}


export function makeNPageId(pi: IPageSOBP) {
  const nPageId = (pi.section << 48) + (pi.owner << 32) + (pi.book << 16) + pi.page;
  return nPageId;
}

export function makeNPageIdStr(info: IPageSOBP) {
  const { section, book, owner, page } = info;
  return `${section}.${book}.${owner}.${page}`;
}

export function cloneObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function isSameObject(a: any, b: any) {
  if (a === b) return true;
  for (const key in a) {
    if (typeof a[key] === "object") {
      if (!isSameObject(a[key], b[key])) return false;
    }
    else if (a[key] !== b[key]) {
      console.log(`[printOption diff] key=${key} values="${a[key]}", "${b[key]}`);
      return false;
    }
  }
  return true;
}


export function isSamePage(pg1: IPageSOBP, pg2: IPageSOBP): boolean {
  if (pg1.page !== pg2.page || pg1.book !== pg2.book || pg1.owner !== pg2.owner || pg1.section !== pg2.section) {
    return false;
  }
  return true;
}

export function isPageInRange(pg: IPageSOBP, arrStart: IPageSOBP, numPages: number): boolean {
  if (pg.book !== arrStart.book || pg.owner !== arrStart.owner || pg.section !== arrStart.section) {
    return false;
  }

  const arr: number[] = [];
  const availablePages = g_availablePagesInSection[arrStart.section];
  for (let i = 0; i < numPages; i++) {
    const page = (arrStart.page + i + availablePages) % availablePages;
    arr.push(page);
  }

  return arr.indexOf(pg.page) >= 0;
}



export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const result = Array.isArray(obj) ? [] : {};

  for (const key of Object.keys(obj)) {
    result[key] = deepClone(obj[key])
  }

  return result;
}



export function getNowTimeStr() {
  const now = new Date();
  const timeStr = sprintf("%04d-%02d-%02d %02d:%02d:%02d.%03d",
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  );

  return timeStr;
}




export function addZeros(num, digit) {
  // 자릿수 맞춰주기
  let zero = "";
  num = num.toString();
  if (num.length < digit) {
    for (let i = 0; i < digit - num.length; i++) {
      zero += "0";
    }
  }
  return zero + num;
}


export function getNextNcodePage(curr: IPageSOBP, delta = 1) {
  const { section, owner, book } = curr;
  const page = (curr.page + delta) % g_availablePagesInSection[section];
  const pi: IPageSOBP = {
    section, owner, book, page,
  }

  return pi;
}

export function diffPropsAndState(prefix, obj, nextProps, nextState = undefined) {
  console.log(`[${prefix}]==============================================================================================================================`);
  console.log(`[${prefix}] [update props and state test] CHECK START`);
  for (const [key, value] of Object.entries(nextProps)) {
    if (typeof value === "function" || typeof value === "object") continue;
    if (obj.props[key] !== value) {
      console.log(`[${prefix}] property[${key}] was changed, from "${obj.props[key]}" to "${value}"`);
    }
  }

  console.log(`[${prefix}]..............................................................................................................................`);
  if (nextState) {
    for (const [key, value] of Object.entries(nextState)) {
      if (typeof value === "function" || typeof value === "object") continue;
      if (obj.state[key] !== value) {
        console.log(`[${prefix}] state[${key}] was changed, from "${obj.state[key]}" to "${value}"`);
      }
    }
  }

  console.log(`[${prefix}] [update props and state test] CHECK END`);
  console.log(`[${prefix}]==============================================================================================================================`);
}


export function clearCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D = undefined, color = "rgb(255,255,255)") {
  if (!ctx) ctx = canvas.getContext("2d");

  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}


export function drawSingleCrossMark(ctx: CanvasRenderingContext2D, x: number, y: number, len: number) {
  const line_width = 4;
  const line_len = len;

  ctx.strokeStyle = "rgb(255, 0, 0)";
  ctx.save();

  ctx.beginPath();
  ctx.lineWidth = line_width;
  // 2020/08/31 kitty
  // canvas_context.arc(x, y, r, r, 0, Math.PI * 2, true); // Outer circle
  ctx.moveTo(x, y - line_len);
  ctx.lineTo(x, y + line_len);
  ctx.moveTo(x - line_len, y);
  ctx.lineTo(x + line_len, y);
  ctx.stroke();

  ctx.restore();
}

export function drawCrossMark(
  arg: {
    ctx: CanvasRenderingContext2D, drawMarkRatio: number, markPos: number,
    x: number, y: number, w: number, h: number
  }) {
  const ratio = arg.drawMarkRatio;
  const d = arg.w * ratio;
  const x = new Array(3) as number[];
  const y = new Array(3) as number[];

  x[0] = arg.x + d;
  y[0] = arg.y + d;

  x[1] = arg.x + arg.w - d;
  y[1] = arg.y + arg.h - d;

  x[2] = arg.x + arg.w / 2;
  y[2] = arg.y + arg.h / 2;

  const markPos = arg.markPos < 3 ? arg.markPos : 2;
  const len = arg.w * 0.04;
  drawSingleCrossMark(arg.ctx, x[markPos], y[markPos], len);

  return { x: x[markPos], y: y[markPos] };
}


function convertUnitToPt(unit: IUnitString, value: number) {
  let multiplier: number;

  switch (unit) {
    case 'pt': multiplier = 1; break;
    case 'mm': multiplier = 72 / 25.4; break;
    case 'cm': multiplier = 72 / 2.54; break;
    case 'in': multiplier = 72; break;
    case 'px': multiplier = 96 / 72; break;
    case 'css': multiplier = 72 / 96; break;
    case 'pc': multiplier = 12; break;
    case 'em': multiplier = 12; break;
    case 'ex': multiplier = 6; break;
    default:
      throw ('Invalid unit: ' + unit);
  }

  return value * multiplier;
}

export function convertUnit(fromUnit: IUnitString, value: number, toUnit: IUnitString) {
  const points = convertUnitToPt(fromUnit, value);

  let multiplier: number;
  switch (toUnit) {
    case 'pt': multiplier = 1; break;
    case 'mm': multiplier = 25.4 / 72; break;
    case 'cm': multiplier = 2.54 / 72; break;
    case 'in': multiplier = 1 / 72; break;
    case 'px': multiplier = 72 / 96; break;
    case 'css': multiplier = 96 / 72; break;
    case 'pc': multiplier = 1 / 12; break;
    case 'em': multiplier = 1 / 12; break;
    case 'ex': multiplier = 1 / 6; break;
    default:
      throw ('Invalid unit: ' + toUnit);
  }

  return points * multiplier;
}


export function getFilenameOnly(str: string) {
  const ext = getExtensionName(str);
  let name = str.split('/').pop().replace("." + ext, '');
  name = name.split('\\').pop().replace("." + ext, '');
  return name;
}

export function getExtensionName(str: string) {
  const re = /(?:\.([^.]+))?$/;

  const ext = re.exec(str)[1];   // "txt"
  return ext;
}


export function getNcodedPdfName(filename: string, pageInfo: IPageSOBP, pagesPerSheet: number) {
  const name = getFilenameOnly(filename);
  const { section, owner, book, page } = pageInfo;
  const fn = `${name}_${pagesPerSheet}(${section}_${owner}_${book}_${page})_ncoded.pdf`;

  return fn;
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



function rgb2Hex(rgb) {
  const splitted = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return (splitted && splitted.length === 4) ? "#" +
    ("0" + parseInt(splitted[1], 10).toString(16)).slice(-2) +
    ("0" + parseInt(splitted[2], 10).toString(16)).slice(-2) +
    ("0" + parseInt(splitted[3], 10).toString(16)).slice(-2) : '';
}

export function hex2ColorObject(hex) {
  if (hex.length !== 7 && hex.length !== 4) hex = rgb2Hex(hex);

  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }

    c = '0x' + c.join('');
    const r = (c >> 16) & 255;
    const g = (c >> 8) & 255;
    const b = c & 255;
    return { r, g, b };
  }
  throw new Error('Bad Hex');
}
