import * as Util from "../UtilFunc";

export const _uuid: string = Util.uuidv4();
const _fileInputId = _uuid;

let _fileOpenPromise: Promise<IFileBrowserResult> = null;
let _resolveFunc = null;
let _filename = "";


export type IFileBrowserResult = {
  result: "success" | "canceled" | "failed",
  file: any,
  url?: any
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

export function onSuccess(e) {
  window.removeEventListener('focus', handleFocusBack);

  const file = e.target.files[0];
  console.log("OK : " + file.name);

  _filename = file.name;
  e.target.value = null;

  _resolveFunc({ result: "success", file });
}

function handleFocusBack(e) {
  // console.log('focus-back');
  setTimeout(() => {
    if (_filename.length) {
      // 이것은 time delay를 주어야 동작한다.
      console.log('Files Loaded');
    }
    // Alert the user if the number
    // of file is zero
    else {
      console.log('Cancel clicked');
      _resolveFunc("");
    }
  }, 500);

  document.body.onfocus = null;
  // window.removeEventListener('focus', handleFocusBack);
}

export function onOpenClicked(e) {
  document.body.onfocus = handleFocusBack;
  // window.addEventListener('focus', handleFocusBack);
}

