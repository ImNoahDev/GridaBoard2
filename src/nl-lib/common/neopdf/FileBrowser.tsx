import { IFileBrowserReturn } from "../structures";
import $ from "jquery";

export const g_hiddenFileInputBtnId = "pdf_file_append_dynamic";
const _fileInputId = g_hiddenFileInputBtnId;

let _acc = 0;

let _fileOpenPromise: Promise<IFileBrowserReturn> = null;
let _resolveFunc = null;
let _filename = "";
let _isRunning = false;


export async function openFileBrowser2() {
  const result: IFileBrowserReturn = {
    result: "failed",
    file: null,
    url: null,
  }


  console.log(`try to load: click simulation ${_acc++}`);
  _fileOpenPromise = new Promise(resolve => _resolveFunc = resolve);

  performClick2(_fileInputId);
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




export async function openFileBrowser(): Promise<IFileBrowserReturn> {
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


async function performClick(elemId): Promise<IFileBrowserReturn> {
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
      resolve({ result: "failed", file: undefined, url: undefined });
    }
  });

  return _fileOpenPromise;
}


async function performClick_old(elemId): Promise<IFileBrowserReturn> {
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

  return Promise.resolve({ result: "failed", file: undefined, url: undefined });
}


function handleFocusBack(e) {
  const func = _resolveFunc;
  _isRunning = false;

  setTimeout(() => {
    _resolveFunc = undefined;

    const result: IFileBrowserReturn = {
      result: "failed",
      file: null,
      url: null,
    }

    if (_isRunning) {
      func(result);
    }

    $('#back, #loadingBar').hide();
    $('#back, #loadingBar').remove();
  }, 500);

  // function FunLoadingBarEnd() {
    // $('#back, #loadingBar').hide();
    // $('#back, #loadingBar').remove();
  // }

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

  if (func !== undefined)
    func({ result: "success", url, file });
}

export function onFileInputClicked(e) {
  document.body.onfocus = handleFocusBack;
  _isRunning = true;
  // window.addEventListener('focus', handleFocusBack);
}

