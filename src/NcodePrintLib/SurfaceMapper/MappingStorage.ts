import { IPageMapItem, IPdfPageDesc, IPdfToNcodeMapItem, IPolygonArea } from "../Coordinates";
import { INcodeSOBPxy, IPageSOBP, IRectDpi } from "../DataStructure/Structures";
import PdfDocMapper from "./PdfDocMapper";
import * as cloud_util_func from "../../cloud_util_func";
import { g_defaultNcode, nullNcode } from "../DefaultOption";
import { isSamePage } from "../../neosmartpen/utils/UtilsFunc";
import * as Util from "../UtilFunc";
import NeoPdfManager from "../NeoPdf/NeoPdfManager";
import EventDispatcher, { EventCallbackType } from "../../neosmartpen/penstorage/EventSystem";
import { IPrintOption } from "../NcodePrint/PrintDataTypes";
import { makePdfId } from "../UtilFunc";
import { MappingItem } from ".";
import { getNPaperInfo, getNPaperSize_pu } from "../NcodeSurface/SurfaceInfo";
import { INoteServerItem } from "../NcodeSurface/SurfaceDataTypes";

export const BASECODE_PAGES_PER_SHEET = 16384;

export enum MappingStorageEventName {
  ON_MAPINFO_REFRESHED = "on_map_refreshed",
  ON_MAPINFO_ADDED = "on_map_changed",
}


export type IMappingStorageEvent = {
  status: string,
  mapper?: PdfDocMapper,      // ON_MAP_INFO_CHANGED
}



const _debug = false;
let _ms_i: MappingStorage = null;
const LOCAL_STORAGE_ID = "GridaBoard_codeMappingInfo_v2";

export type IMappingData = {
  nextIssuable: IPageSOBP;
  arrDocMap: IPdfToNcodeMapItem[];
}

export type IAutoLoadDocDesc = {
  pdf: IPdfToNcodeMapItem,
  pageMapping: IPageMapItem,
}

export default class MappingStorage {
  _data: IMappingData = {
    nextIssuable: { ...g_defaultNcode },
    arrDocMap: []
  };

  _testStorage;

  dispatcher: EventDispatcher = new EventDispatcher();


  private constructor() {
    if (_ms_i) return _ms_i;

    this.initNextIssuable();
  }

  static getInstance() {
    if (_ms_i) return _ms_i;

    _ms_i = new MappingStorage();
    return _ms_i;
  }

  static makeAssignedNcodeArray = (startPage: IPageSOBP, numPages: number) => {
    const pages: IPageSOBP[] = [];
    for (let i = 0; i < numPages; i++) {
      const pi = Util.getNextNcodePage(startPage, i);
      pages.push(pi);
    }

    return pages;
  }

  private initNextIssuable = () => {
    if (this._data.nextIssuable.section === -1) {
      this.nextIssuable = g_defaultNcode;
    }
  }

  public reset = () => {
    this._data = {
      nextIssuable: { ...g_defaultNcode },
      arrDocMap: [],
    };
  }
  get nextIssuable() {
    return this._data.nextIssuable;
  }

  set nextIssuable(pageInfo: IPageSOBP) {
    this._data.nextIssuable = { ...pageInfo };
  }


  /**
   * 이 함수를 dialog로 수정함으로써 프린터 옵션을 바꿀 수 있다.
   */
  public getAssociatedMappingInfo = (fingerprint: string, pagesPerSheet: number, docNumPages: number) => {
    const theSames = this.findAssociatedPrintNcode(fingerprint, pagesPerSheet);
    const theSame: IPdfToNcodeMapItem = theSames.length > 0 ? theSames[0] : undefined;

    return theSame;
  }

  /**
   *  이 함수가 불려지기 전에, printOption에는 다음과 같은 항목이 설정되어 있어야만 한다.
   * * url, filename, fingerprint, pagesperSheet, docNumPages
   *
   * 이 리턴 값은 printOption으로 바로 들어가서 대체될 수 있다.
   * * printOption = {...printOption, ...returnValue }
   * * 또는, for (const key in returnValue) printOption[key] = returnValue[key];
   */
  public getCodePrintInfo = (printOption: IPrintOption, forceToUpdateBaseCode: boolean) => {
    if (forceToUpdateBaseCode === undefined) forceToUpdateBaseCode = printOption.forceToUpdateBaseCode;

    const { fingerprint, pagesPerSheet, docNumPages } = printOption;
    let needToIssueBaseCode: boolean;
    let needToIssuePrintCode: boolean;

    let basePageInfo: IPageSOBP;
    let printPageInfo: IPageSOBP;

    let prevBasePageInfo = nullNcode();
    let prevPrintPageInfo = nullNcode();
    let baseCodeIssued = false;


    /** 코드 할당에 대한 기본 값을 써 주자 */
    const theBase = this.findAssociatedBaseNcode(fingerprint);
    const theSames = this.findAssociatedPrintNcode(fingerprint, pagesPerSheet);
    const theSame = theSames.length > 0 ? theSames[0] : undefined as IPdfToNcodeMapItem;

    let codeDelta = 0;

    // base 코드 재활용 또는 할당
    if (theBase) prevBasePageInfo = { ...theBase.basePageInfo };
    if (theBase && !forceToUpdateBaseCode) {
      // 재활용할 수 있는 경우
      needToIssueBaseCode = false;
      basePageInfo = { ...theBase.basePageInfo };
    }
    else {
      // 할당해야만 하는 경우
      if (!theBase) needToIssueBaseCode = true;
      const nextCode = Util.getNextNcodePage(this.nextIssuable, codeDelta);
      basePageInfo = { ...nextCode };
      baseCodeIssued = true;
      codeDelta += docNumPages;
    }


    // 인쇄될 페이지의 코드 재활용 또는 할당

    if (theSame) prevPrintPageInfo = { ...theSame.printPageInfo };

    const reUsable = (!!theSame) && isSamePage(theSame.basePageInfo, theBase.basePageInfo);
    if (reUsable && !forceToUpdateBaseCode) {
      // 재활용할 수 있는 경우
      needToIssuePrintCode = false;
      printPageInfo = { ...theSames[0].printPageInfo };
    }
    else {
      // 할당해야만 하는 경우
      if (!(theSames.length > 0)) needToIssuePrintCode = true;
      const nextCode = Util.getNextNcodePage(this.nextIssuable, codeDelta);
      printPageInfo = { ...nextCode };
      codeDelta += docNumPages;
    }

    return {
      prevBasePageInfo,
      needToIssueBaseCode,
      basePageInfo,
      baseCodeIssued,

      prevPrintPageInfo,
      needToIssuePrintCode,
      printPageInfo,

      numNcodeComsumed: codeDelta,
    }
  }


  public getNextIssuablePageInfo = (printOption: IPrintOption) => {
    const codeInfo = this.getCodePrintInfo(printOption, true);

    return [codeInfo.basePageInfo, codeInfo.printPageInfo];
  }

  private makeDummyParamsForBasePageInfo = (codeNeeded, printOption: IPrintOption) => {
    const { docNumPages, pagesPerSheet, fingerprint, url, filename } = printOption;

    // dummy
    const params: IPageMapItem[] = [];
    for (let i = 0; i < docNumPages; i++) {
      const pageNo = i + 1;
      const mapData = new MappingItem(pageNo);      // h의 기본값은 여기서 세팅된다.
      const basePageInfo = codeNeeded.basePageInfo;

      const pi: INoteServerItem = getNPaperInfo(codeNeeded.basePageInfo);
      const paperSize_pu = getNPaperSize_pu(codeNeeded.basePageInfo);

      // dummy Ncode page info
      const { Xmin: x0, Xmax: x1, Ymin: y0, Ymax: y1 } = pi.margin;
      const pdfDrawnRect: IRectDpi = { unit: "nu", x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
      const npageArea: IPolygonArea = [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
      mapData.setNcodeArea({ pageInfo: basePageInfo, basePageInfo: basePageInfo, pdfDrawnRect, npageArea });

      // dummy PDF page info
      const { url, filename, fingerprint, docNumPages: numPages } = printOption;
      const pdfPageInfo: IPdfPageDesc = { url, filename, fingerprint, id: makePdfId(fingerprint, BASECODE_PAGES_PER_SHEET), numPages, pageNo };
      mapData.setPdfArea({ pdfPageInfo, rect: { unit: "pu", x: 0, y: 0, width: paperSize_pu.width, height: paperSize_pu.height } });

      params.push(mapData._params);
    }

    const basePdfToNcodeMap: IPdfToNcodeMapItem = {
      url,
      filename,
      fingerprint,
      pagesPerSheet: BASECODE_PAGES_PER_SHEET,
      id: makePdfId(fingerprint, BASECODE_PAGES_PER_SHEET),
      numPages: docNumPages,

      printPageInfo: { ...codeNeeded.basePageInfo },
      basePageInfo: { ...codeNeeded.basePageInfo },

      params,
      timeString: Util.getNowTimeStr(),
    }
    return basePdfToNcodeMap;
  }


  public issueNcode = (printOption: IPrintOption) => {
    // 한번도 코드를 발행해 본적이 없는 경우의 default
    this.initNextIssuable();

    // 리턴 값을 준비
    const { docNumPages, pagesPerSheet, fingerprint, url, filename } = printOption;
    const codeNeeded = this.getCodePrintInfo(printOption, undefined);

    // Base map을 등록해야 한다면, 아래와 같이 더미의 base code map을 등록
    // 아래의 맵에서는 h가 정의되어 있지 않으므로, 직접 불러서 transform할 수 없다
    if (codeNeeded.baseCodeIssued) {
      const basePdfToNcodeMap = this.makeDummyParamsForBasePageInfo(codeNeeded, printOption);
      this._data.arrDocMap.push(basePdfToNcodeMap);
    }

    // 현재 인쇄 상태의 map의 코드 정보를 전달
    const pdfToNcodeMap: IPdfToNcodeMapItem = {
      url,
      filename,
      fingerprint,
      pagesPerSheet,
      id: makePdfId(fingerprint, pagesPerSheet as number),
      numPages: docNumPages,

      printPageInfo: { ...codeNeeded.printPageInfo },
      basePageInfo: { ...codeNeeded.basePageInfo },

      params: undefined,
      timeString: Util.getNowTimeStr(),
    }
    this.nextIssuable = Util.getNextNcodePage(this.nextIssuable, codeNeeded.numNcodeComsumed);

    return pdfToNcodeMap;
  }

  register = (mapper: PdfDocMapper) => {
    mapper.makeSummary();

    const docMap: IPdfToNcodeMapItem = Util.cloneObj(mapper.docMap);
    docMap.timeString = Util.getNowTimeStr();
    this._data.arrDocMap.push(docMap);

    // NeoPdfManager.getInstance().refreshNcodeMappingTable();
    this.dispatcher.dispatch(MappingStorageEventName.ON_MAPINFO_ADDED, { status: "new map added", mapper });

    this.storeMappingInfo();
    if (_debug) this.dump("mapping");
  }

  clear = () => {
    this.reset();
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
      "IPageMapItem": {
        timeString: "1111",
        pageInfo: { section: "1", book: "1", owner: "1", page: "1" },
      }
    }
    const params2 = {
      "IPageMapItem": {
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

    const found = this._data.arrDocMap.find(m => Util.isPageInRange(ncodeXy, m.printPageInfo, m.numPages));
    if (found) {
      /** 원래는 폴리곤에 속했는지 점검해야 하지만, 현재는 같은 페이지인지만 점검한다  2020/12/06 */
      const pageMap = found.params.find(param => isSamePage(ncodeXy, param.pageInfo));
      return { pdf: found, pageMapping: pageMap } as IAutoLoadDocDesc;
    }

    return undefined;
  }


  /**
   * Ncode가 발행된 적이 있는지를 점검하기 위해서 쓰인다.
   */
  findAssociatedNcode = (fingerprint: string, pagesPerSheet: number) => {
    const theBase = this.findAssociatedBaseNcode(fingerprint);
    const theSames = this.findAssociatedPrintNcode(fingerprint, pagesPerSheet);

    return { theBase, theSames }
  }

  findAssociatedPrintNcode = (fingerprint: string, pagesPerSheet: number) => {
    const id = Util.makePdfId(fingerprint, pagesPerSheet as number);

    const theSames = this._data.arrDocMap.filter(m => id === m.id);
    theSames.sort((a, b) => b.timeString > a.timeString ? 1 : (b.timeString === a.timeString ? 0 : -1));

    return theSames;
  }

  findAssociatedBaseNcode = (fingerprint: string) => {
    const baseId = Util.makePdfId(fingerprint, BASECODE_PAGES_PER_SHEET);

    // const theBase = this._data.arrDocMap.find(m => baseId === m.id);
    const theBases = this._data.arrDocMap.filter(m => baseId === m.id);
    theBases.sort((a, b) => b.timeString > a.timeString ? 1 : (b.timeString === a.timeString ? 0 : -1));
    const theBase = theBases.length > 0 ? theBases[0] : undefined;

    return theBase;
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
  public addEventListener(eventName: MappingStorageEventName, listener: EventCallbackType) {
    this.dispatcher.on(eventName, listener, null);
  }

  /**
   *
   * @param eventName
   * @param listener
   */
  public removeEventListener(eventName: MappingStorageEventName, listener: EventCallbackType) {
    this.dispatcher.off(eventName, listener);
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
  const msi = MappingStorage.getInstance();
  msi.loadMappingInfo();

  // https://developer.chrome.com/docs/apps/offline_storage/#query ==> enter

  // https://stackoverflow.com/questions/26257183/detecting-available-storage-with-indexeddb/38905723#38905723 ==> right!
  // https://storage.spec.whatwg.org/#dom-storagemanager-estimate ==> this one, also.
  // navigator.storage.estimate().then((data) => {
  //   console.log(data);
  // }); // Object { quota: 2147483648, usage: 0 }

  // for (let i = 0; i < 4 * 1024; i++) {
  //   const key = `storage_test_${i}`;
  //   localStorage.removeItem(key);
  // }

  // let acc = 0;
  // for (let i = 0; i < 4 * 1024; i++) {

  //   const key = `storage_test_${i}`;
  //   const value = { key: Array.from({ length: 1024 * 65 }) };
  //   const json = JSON.stringify(value);
  //   const size = json.length;
  //   acc += size;
  //   localStorage.setItem(key, json);
  //   console.log( `acc = ${acc} ${size}`);

  //   const ret = localStorage.getItem(key);
  //   const confirmJson = JSON.parse(ret);
  //   const confirm = JSON.stringify(confirmJson);

  //   if (ret.length < 10) {
  //     console.log(`storing #${i} chunk FAILED`);
  //   }
  //   else {
  //     console.log(`storing #${i} chunk success`);

  //   }

  // }

  // navigator.webkitTemporaryStorage.queryUsageAndQuota(
  //   function (usedBytes, grantedBytes) {
  //     console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes');
  //   },
  //   function (e) { console.log('Error', e); }
  // );

})();




