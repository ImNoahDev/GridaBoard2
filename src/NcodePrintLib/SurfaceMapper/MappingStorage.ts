import { CoordinateTanslater, IMappingParams, IPdfMappingDesc } from "../Coordinates";
import { INcodeSOBPxy, IPageSOBP } from "../DataStructure/Structures";
import PdfDocMapper from "./PdfDocMapper";
import * as cloud_util_func from "../../cloud_util_func";
import { g_defaultNcode } from "../DefaultOption";
import { isSamePage } from "../../neosmartpen/utils/UtilsFunc";
import * as Util from "../UtilFunc";
import { isObject } from "util";

const _debug = false;
let _instance: MappingStorage = null;
const LOCAL_STORAGE_ID = "GridaBoard_codeMappingInfo_v2";

type IMappingData = {
  nextIssuable: IPageSOBP;
  arrDocMap: IPdfMappingDesc[];
}

export default class MappingStorage {
  _data: IMappingData = {
    nextIssuable: { section: -1, owner: -1, book: -1, page: -1 },
    arrDocMap: []
  };

  _testStorage;
  private constructor() {
    if (_instance) return _instance;
  }

  static getInstance() {
    if (_instance) return _instance;

    _instance = new MappingStorage();
    return _instance;
  }

  static makeAssignedNcodeArray = (startPage: IPageSOBP, numPages: number) => {
    const pages: IPageSOBP[] = [];
    for (let i = 0; i < numPages; i++) {
      const pi = Util.getNextNcodePage(startPage, i);
      pages.push(pi);
    }

    return pages;
  }

  public getNextIssuableNcodeInfo = () => {
    return this._data.nextIssuable;
  }

  public issueNcode = (options: IPdfMappingDesc): IPdfMappingDesc => {
    const { numPages } = options;

    // this._nextIssuableNcode를 참조해서
    if (this._data.nextIssuable.section === -1) {
      this._data.nextIssuable = { ...g_defaultNcode } as IPageSOBP;
    }

    const pages: IPageSOBP[] = [];
    for (let i = 0; i < numPages; i++) {
      const pi = Util.getNextNcodePage(this._data.nextIssuable, i);
      pages.push(pi);
    }

    this._data.nextIssuable = { ...Util.getNextNcodePage(this._data.nextIssuable, numPages) };
    options.nPageStart = pages[0];
    return options;
  }

  register = (mapper: PdfDocMapper) => {
    mapper.makeSummary();

    const docMap: IPdfMappingDesc = Util.cloneObj(mapper.docMap);
    docMap.timeString = Util.getNowTimeStr();
    this._data.arrDocMap.push(docMap);

    this.storeMappingInfo();

    if (_debug) this.dump("mapping");
  }

  clear = () => {
    this._data = {
      nextIssuable: { section: -1, owner: -1, book: -1, page: -1 },
      arrDocMap: []
    };
    this.storeMappingInfo();
    console.log("Mapping information cleared");
  }

  public getCloudData() {
    cloud_util_func.readMappingInfo();
  }
  public setTestStorage(obj) {
    this._testStorage = obj;

    console.log(this._testStorage);
  }
  public saveOnCloud = () => {

    const params = {
      "IMappingParams": {
        timeString: "1111",
        pageInfo: { section: "1", book: "1", owner: "1", page: "1" },
      }
    }
    const params2 = {
      "IMappingParams": {
        timeString: "1111",
        pageInfo: { section: "1", book: "1", owner: "1", page: "2" },
      }
    }
    const lastCode = { section: "1", book: "1", owner: "1", page: "2" };
    const nextCode = { section: "1", book: "1", owner: "1", page: "3" };

    const mappingInfoObj = {
      "code": {
        "last": lastCode,
        "next": nextCode,
      },
      "map": [params, params2]
    }

    cloud_util_func.uploadMappingInfo(mappingInfoObj);
  }

  /**
   * pen down시에 새로운 SOBP라면, 관련된 PDF가 있는지 찾을 때 쓰인다
   */
  findPdfPage = (ncodeXy: INcodeSOBPxy) => {
    // const pdfPageInfo: IPdfPageDesc = null;
    // const pdfDocInfo: IPdfDocDesc = null;

    // let found = -1;
    // for ( let i=0; i<this._arrMapped.length; i++ ) {
    //   const trans = this._arrMapped[i];
    //   if ( isSamePage(ncodeXy as IPageSOBP, trans.pageInfo) ) {
    //     found = i;
    //     break;
    //   }
    // }

    const found = this._data.arrDocMap.find(m => Util.isPageInRange(ncodeXy, m.nPageStart, m.numPages));
    if (found) {
      /** 원래는 폴리곤에 속했는지 점검해야 하지만, 현재는 같은 페이지인지만 점검한다  2020/12/06 */
      const pageMap = found.params.find(param => isSamePage(ncodeXy, param.pageInfo));
      return pageMap;
    }

    return undefined;
  }

  /**
   * Ncode가 발행된 적이 있는지를 점검하기 위해서 쓰인다.
   */
  findNcodeRange = (pdfId: string) => {
    const found = this._data.arrDocMap.find(m => pdfId === m.id);
    if (found) {

      return found;
    }
    // const found = this._arrMapped.find(trans => pdfId === trans.pdfDesc.id);
    return undefined;
  }

  /**
   * Ncode가 발행된 적이 있는지를 점검하기 위해서 쓰인다.
   */
  findAssociatedNcode = (fingerprint: string, pagesPerSheet: number) => {
    const id = Util.makePdfId(fingerprint, pagesPerSheet as number);
    const mapped = this.findNcodeRange(id);

    if (mapped && mapped.nPageStart.section !== -1) {
      return mapped;
    }

    return undefined;
  }

  dump = (prefix: string) => {
    console.log(`[${prefix}]==============================================================================================================================`);
    this.dumpJson(prefix, this._data.nextIssuable);
    console.log(`[${prefix}]..............................................................................................................................`);

    for (let i = 0; i < this._data.arrDocMap.length; i++) {
      const item = this._data.arrDocMap[i];
      const clone = Util.cloneObj(item);
      clone.params = null;
      this.dumpJson(prefix, clone);
      console.log(`[${prefix}]..............................................................................................................................`);
    }
    console.log(`[${prefix}]==============================================================================================================================`);
  }

  dumpJson = (prefix: string, obj) => {
    const str = JSON.stringify(obj, null, "  ");
    const arr = str.split("\n");

    for (let i = 0; i < arr.length; i++) {
      console.log(`[${prefix}] ${arr[i]}`);
    }
  }


  storeMappingInfo = () => {
    if (storageAvailable("localStorage")) {
      const key = LOCAL_STORAGE_ID;
      const value = JSON.stringify(this._data);
      // console.log(`Pdf Ncode Info Saved   ${key}: ${value}`);
      localStorage.setItem(key, value);

      return true;
    }

    return false;
  }


  /**
   * app이 기동되면 반드시 처음에 load하자
   *
   * @return {boolean}
   */
  loadMappingInfo = () => {
    if (storageAvailable("localStorage")) {
      const key = LOCAL_STORAGE_ID;
      const value = localStorage.getItem(key);

      if (value) {
        this._data = JSON.parse(value);

        this._data.arrDocMap.sort(function (a, b) {
          if (a.timeString < b.timeString) return 1;
          else if (a.timeString > b.timeString) return -1;
          else return 0;
        });

        this.dump("loading");


        // const debug = JSON.stringify(this._arrMapped);
        // console.log(`Pdf Ncode Info Loaded   ${key}: ${debug}`);
        return true;
      }
    }

    return false;
  }
}


function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // Firefox를 제외한 모든 브라우저
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // 코드가 존재하지 않을 수도 있기 떄문에 이름 필드도 확인합니다.
        // Firefox를 제외한 모든 브라우저
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // 이미 저장된 것이있는 경우에만 QuotaExceededError를 확인하십시오.
      storage &&
      storage.length !== 0
    );
  }
}


// https://www.bsidesoft.com/1426 , [js] localStorage 키별 용량 제약 처리
// 이것 참고해서 더 수정할 것

(function () {
  const instance = MappingStorage.getInstance();
  instance.loadMappingInfo();

  // https://developer.chrome.com/docs/apps/offline_storage/#query ==> enter

  // https://stackoverflow.com/questions/26257183/detecting-available-storage-with-indexeddb/38905723#38905723 ==> right!
  // https://storage.spec.whatwg.org/#dom-storagemanager-estimate ==> this one, also.
  navigator.storage.estimate().then((data) => {
    console.log(data);
  }); // Object { quota: 2147483648, usage: 0 }

  // navigator.webkitTemporaryStorage.queryUsageAndQuota(
  //   function (usedBytes, grantedBytes) {
  //     console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes');
  //   },
  //   function (e) { console.log('Error', e); }
  // );

})();




