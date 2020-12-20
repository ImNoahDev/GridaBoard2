import * as Util from "../UtilFunc";
import { sleep } from "../UtilFunc";

export const g_hiddenFileInputBtnId = "pdf_file_append_dynamic";
const _fileInputId = g_hiddenFileInputBtnId;

let _acc = 0;

let _fileOpenPromise: Promise<IFileBrowserResult> = null;
let _resolveFunc = null;
let _filename = "";
let _isRunning = false;


export type IFileBrowserResult = {
  result: "success" | "canceled" | "failed",
  file: any,
  url?: any
}



export async function openFileBrowser2() {
  const result: IFileBrowserResult = {
    result: "failed",
    file: null,
    url: null,
  }


  console.log(`try to load: click simulation ${_acc++}`);

  performClick2(_fileInputId);
  _fileOpenPromise = new Promise(resolve => _resolveFunc = resolve);
  return _fileOpenPromise;
}


async function performClick2(elemId) {
  _filename = "";

  const elem = document.getElementById(elemId);
  if (elem && document.createEvent) {
    const evt = document.createEvent("MouseEvents");
    evt.initEvent("click", true, false);
    elem.dispatchEvent(evt);
  }
}




export async function openFileBrowser(): Promise<IFileBrowserResult> {
  let result = await performClick(_fileInputId);
  const file = result.file;
  if (file) {
    const url = URL.createObjectURL(file);
    result = {
      ...result,
      url,
    }
    console.log(file.name);
  }

  return result;
}


async function performClick(elemId): Promise<IFileBrowserResult> {
  _filename = "";


  _fileOpenPromise = new Promise(resolve => {
    const elem = document.getElementById(elemId);
    if (elem && document.createEvent) {
      const evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
      _resolveFunc = resolve;

      return _fileOpenPromise;
    }
    else {
      resolve({ result: "failed", file: null });
    }
  });

  return _fileOpenPromise;
}


async function performClick_old(elemId): Promise<IFileBrowserResult> {
  _filename = "";
  const elem = document.getElementById(elemId);
  if (elem && document.createEvent) {
    _fileOpenPromise = new Promise(resolve => {
      const evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
      _resolveFunc = resolve;
    });

    return _fileOpenPromise;
  }

  return Promise.resolve({ result: "failed", file: null });
}


function handleFocusBack(e) {
  const func = _resolveFunc;
  _isRunning = false;

  setTimeout(() => {
    _resolveFunc = undefined;

    const result: IFileBrowserResult = {
      result: "failed",
      file: null,
      url: null,
    }

    if (_isRunning) {
      func(result);
    }
  }, 500);

  document.body.onfocus = null;
}


export function onFileInputChanged(e) {
  window.removeEventListener('focus', handleFocusBack);
  _isRunning = false;
  const func = _resolveFunc;
  _resolveFunc = undefined;

  const file = e.target.files[0];
  const url = URL.createObjectURL(file);
  console.log("OK : " + file.name);

  _filename = file.name;
  e.target.value = null;

  func({ result: "success", url, file });
}

export function onFileInputClicked(e) {
  document.body.onfocus = handleFocusBack;
  _isRunning = true;
  // window.addEventListener('focus', handleFocusBack);
}

