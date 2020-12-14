import { sprintf } from "sprintf-js";
import { isObject } from "util";
import { IPageSOBP } from "../DataStructure/Structures";
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


export function makePdfId(arg: {
  fingerprint: string, pagesPerSheet: number
}): string {
  return arg.fingerprint + "/" + arg.pagesPerSheet.toString();
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

