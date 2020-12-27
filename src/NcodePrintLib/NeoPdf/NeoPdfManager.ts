import { openFileBrowser } from "./FileBrowser";
import NeoPdfDocument, { IGetDocumentOptions } from "./NeoPdfDocument";
import EventDispatcher, { EventCallbackType } from "../../neosmartpen/penstorage/EventSystem";
import { MappingStorage } from "../SurfaceMapper";
import { IMappingStorageEvent, MappingStorageEventName } from "../SurfaceMapper/MappingStorage";

let _pdf_manager: NeoPdfManager = undefined;



/** @enum {string} */
export enum PdfManagerEventName {
  ON_PDF_LOADED = "on_pdf_loaded",
}

export type IPenToViewerEvent = {
  pdf?: NeoPdfDocument,     // ON_PDF_LOADED
}


export default class NeoPdfManager {
  _pdfs: NeoPdfDocument[];

  dispatcher: EventDispatcher = new EventDispatcher();

  constructor() {
    if (_pdf_manager) return _pdf_manager;

    this._pdfs = [];
  }

  static getInstance() {
    if (_pdf_manager) return _pdf_manager;

    _pdf_manager = new NeoPdfManager();
    const ms = MappingStorage.getInstance();
    ms.addEventListener(MappingStorageEventName.ON_MAPINFO_CHANGED, _pdf_manager.refreshNcodeMappingTable);

    return _pdf_manager;
  }

  refreshNcodeMappingTable = (event: IMappingStorageEvent) => {
    this._pdfs.forEach(pdf => pdf.refreshNcodeMappingTable());
  }

  getDocument = async (options: IGetDocumentOptions) => {
    if (options.url && !options.fingerprint) {
      const doc = new NeoPdfDocument();
      const load = await doc.load(options);

      this.dispatcher.dispatch(PdfManagerEventName.ON_PDF_LOADED, { pdf: doc });
      return load;

    }
    else {
      if (!options.fingerprint) {
        throw new Error(`PDF Manager: URL or fingerprint should be passed to load a document`);
      }

      // 이 부분을 수정할 것 (구글 드라이브에서 로드하려면)
      // google drive, 2020/12/05
      const status = await NeoPdfManager.getUrl(options);

      if (status.result === "success") {
        const doc = new NeoPdfDocument();
        return await doc.load({ url: status.url, filename: status.file.name });
      }

      if (status.result === "not match") {
        console.log("같은 파일이 아닙니다. 다시 여시겠습니까...라는 다이얼로그를 넣어서 루프를 돌 것");
        alert("같은 파일이 아닙니다. 다시 여시겠습니까...라는 다이얼로그를 넣어서 루프를 돌 것");
        return null;
      }

      return null;
    }
  }


  static getUrl = async (options: IGetDocumentOptions) => {
    const fingerprint = options.fingerprint;

    if (!fingerprint) {
      throw new Error(`PDF Manager: Fingerprint has not been passed`);
    }

    const result = await openFileBrowser();
    console.log(result.result);

    if (result.result === "success") {
      const { url, file } = result;
      console.log(url);
      const isSame = NeoPdfManager.checkFingerprint({ url, filename: file.name }, fingerprint);
      if (isSame)
        return { result: "success", url, file };
      return { result: "not match", url, file };
    }
    else {
      alert("파일 열기를 취소 했습니다");
      return { result: "canceled", url: null, file: null };

      // alert("파일 열기가 실패했습니다");
      // return { result: "failed", url: null };
    }
  }

  static checkFingerprint = async (options: IGetDocumentOptions, fingerprint: string) => {

    let doc = new NeoPdfDocument();
    await doc.load(options);

    const docFingerprint = doc.fingerprint;

    doc.destroy();
    doc = null;

    if (fingerprint !== docFingerprint) return false;
    return true;
  }


  public addEventListener(eventName: PdfManagerEventName, listener: EventCallbackType) {
    this.dispatcher.on(eventName, listener, null);
  }

  /**
   *
   * @param eventName
   * @param listener
   */
  public removeEventListener(eventName: PdfManagerEventName, listener: EventCallbackType) {
    this.dispatcher.off(eventName, listener);
  }

}