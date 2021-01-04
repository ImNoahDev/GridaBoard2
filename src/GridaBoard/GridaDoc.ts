import { store } from "../client/Root";
import { IPageMapItem, IPdfToNcodeMapItem } from "../NcodePrintLib/Coordinates";
import { IFileBrowserReturn } from "../NcodePrintLib/NcodePrint/PrintDataTypes";
import { g_availablePagesInSection } from "../NcodePrintLib/NcodeSurface/SurfaceInfo";
import NeoPdfDocument, { IPdfOpenOption } from "../NcodePrintLib/NeoPdf/NeoPdfDocument";
import NeoPdfManager, { IPenToViewerEvent, PdfManagerEventName } from "../NcodePrintLib/NeoPdf/NeoPdfManager";
import { MappingStorage } from "../NcodePrintLib/SurfaceMapper";
import { IAutoLoadDocDesc, IGetNPageTransformType, IMappingStorageEvent, MappingStorageEventName } from "../NcodePrintLib/SurfaceMapper/MappingStorage";
import { isSamePage, makeNPageIdStr } from "../NcodePrintLib/UtilFunc/functions";
import { IPageSOBP } from "../neosmartpen/DataStructure/Structures";
import { forceToRenderPanes, setActivePageNo, setActivePdf, setDocNumPages, setUrlAndFilename } from "../store/reducers/activePageReducer";
import { RootState } from "../store/rootReducer";
import GridaPage from "./GridaPage";

let _doc_instance = undefined as GridaDoc;

export default class GridaDoc {
  _pages: GridaPage[] = [];


  _pdfd: {
    pdf: NeoPdfDocument,

    fingerprint: string,
    pdfOpenInfo: IPdfOpenOption,
    promise: Promise<NeoPdfDocument>,
    startPageInDoc: number,       // starting from 0
    endPageInDoc: number,         // starting from 0

    pdfToNcodeMap: IPdfToNcodeMapItem,
  }[] = [];

  get numPages() {
    return this._pages.length;
  }

  constructor() {
    if (_doc_instance) return _doc_instance;

    const pdfManager = NeoPdfManager.getInstance();
    pdfManager.addEventListener(PdfManagerEventName.ON_PDF_LOADED, this.onPdfLoaded);

    const msi = MappingStorage.getInstance();
    msi.addEventListener(MappingStorageEventName.ON_MAPINFO_ADDED, this.handleMapInfoAdded);
    msi.addEventListener(MappingStorageEventName.ON_MAPINFO_REFRESHED, this.refreshNcodeMappingTable);
  }


  getPage = (pageNo: number) => {
    return this._pages[pageNo];
  }


  static getInstance() {
    if (_doc_instance) return _doc_instance;
    _doc_instance = new GridaDoc();

    return _doc_instance;
  }

  handleMapInfoAdded = (event: IMappingStorageEvent) => {
    // const docMap = event.mapper.docMap;
    // const pdfDescs = this._pdfd.filter(pdfDesc => pdfDesc.fingerprint === docMap.fingerprint);
    // pdfDescs.forEach(pdfDesc => pdfDesc.pdf.refreshNcodeMappingTable());

    forceToRenderPanes();
  }

  refreshNcodeMappingTable = (event: IMappingStorageEvent) => {
    // const docMap = event.mapper.docMap;
    // const pdfDescs = this._pdfd.filter(pdfDesc => pdfDesc.fingerprint === docMap.fingerprint);
    // pdfDescs.forEach(pdfDesc => pdfDesc.pdf.refreshNcodeMappingTable());

    forceToRenderPanes();
  }



  public handleSetNcodeMapping = (docMap: IPdfToNcodeMapItem) => {
    // 내장한 PDF들에 대해서 pageInfo를 등록
    const pdfDescs = this._pdfd.filter(pdfDesc => pdfDesc.fingerprint === docMap.fingerprint);
    // pdfDescs.forEach(pdfDesc => pdfDesc.pdf.refreshNcodeMappingTable());

    forceToRenderPanes();

    // GridaPage에 pageInfo를 등록
    docMap.params.forEach(params => {
      this._pages.forEach(page => {
        if (page.fingerprint === docMap.fingerprint && params.pdfDesc.pageNo === page.pdfPageNo) {
          // page.addPageToNcodeMaps([params]);
        }
      });
    })
  }

  /**
   *
   * @param option
   * @param basePageInfo - 이게 있는 경우에는 이미 mapping 테이블에 등록되어 있는 pdf
   */
  public openPdfFile = async (option: { url: string, filename: string },
    pageInfo: IPageSOBP = undefined, basePageInfo: IPageSOBP = undefined) => {

    const pdfDoc = await NeoPdfManager.getInstance().getDocument({ url: option.url, filename: option.filename, purpose: "open pdf by GridaDoc" });
    // setActivePdf(pdfDoc);

    if (pdfDoc) {
      const activatePageNo = this.appendPdfDocument(pdfDoc, pageInfo, basePageInfo);
      this.setActivePageNo(activatePageNo);
    }
  }

  private appendPdfDocument = (pdfDoc: NeoPdfDocument, pageInfo: IPageSOBP, basePageInfo: IPageSOBP) => {
    // 0) PDF가 있는지 찾아보고 있으면 return, (없으면 1, 2를 통해서 넣는다)
    const found = this._pdfd.find(item => item.fingerprint === pdfDoc.fingerprint);
    if (found) {
      return found.startPageInDoc;
    }

    // 1) page와 maps(MappingStorage)에 있는 정보를 매핑해둔다.
    // pdfDoc.refreshNcodeMappingTable();

    // 2) PDF 배열에 정보를 추가하고
    this._pdfd.push({
      pdf: pdfDoc,
      fingerprint: pdfDoc.fingerprint,
      pdfOpenInfo: { url: pdfDoc.url, filename: pdfDoc.filename, purpose: "to be stored by GridaDoc", },
      promise: Promise.resolve(pdfDoc),
      startPageInDoc: this.numPages,
      endPageInDoc: this.numPages + pdfDoc.numPages - 1,
      pdfToNcodeMap: pdfDoc.pdfToNcodeMap,
    });

    // 3) 페이지를 넣어 주자
    const numPages = pdfDoc.numPages;
    const pageNoArr = [] as number[];

    if (!basePageInfo && !pageInfo) {
      const msi = MappingStorage.getInstance();
      let theBase = msi.findAssociatedBaseNcode(pdfDoc.fingerprint);
      if (!theBase) {
        const { url, filename, fingerprint, numPages } = pdfDoc;
        theBase = msi.makeTemporaryAssociateMapItem({ pdf: { url, filename, fingerprint, numPages }, n_paper: undefined });
      }

      basePageInfo = theBase.basePageInfo;
      pageInfo = theBase.printPageInfo;
    }

    const m0 = g_availablePagesInSection[pageInfo.section];
    const m1 = g_availablePagesInSection[basePageInfo.section];

    for (let i = 0; i < numPages; i++) {
      const pi = { ...pageInfo, page: (pageInfo.page + i + m0) % m0 };
      const bpi = { ...basePageInfo, page: (basePageInfo.page + i + m1) % m1 };
      // const maps = pdfDoc.getPage(i + 1).pageToNcodeMaps;
      const pageNo = this.addPdfPage(pdfDoc, i + 1, pi, bpi);
      pageNoArr.push(pageNo);
    }

    return pageNoArr[0];
  }

  private addPdfPage = (pdf: NeoPdfDocument, pdfPageNo: number, pageInfo: IPageSOBP, basePageInfo: IPageSOBP) => {
    // const page = this._pages.find(pg => isSamePage(pg.basePageInfo, newBasePageInfo));
    const page = new GridaPage(this.numPages, pageInfo, basePageInfo);
    page.setPdfPage(pdf, pdfPageNo)

    this._pages.push(page);
    setDocNumPages(this._pages.length);

    return this._pages.length - 1;
  }


  /**
   * Message handlers
   * @param event
   */
  public onPdfLoaded = (event: IPenToViewerEvent) => {
    const pdf = event.pdf;
    console.log(`file ${pdf.filename} loaded`);
    console.log(`-GRIDA DOC-, onPdfLoaded ${pdf.filename},  purpose:${pdf.purpose} - ${pdf.url}`);
  }

  public setActivePageNo = (pageNo: number) => {
    setActivePageNo(pageNo);
  }


  public handleActivePageChanged = (pageInfo: IPageSOBP, found: IGetNPageTransformType) => {
    const newBasePageInfo = found.basePageInfo;
    const page = this._pages.find(pg => isSamePage(pg.basePageInfo, newBasePageInfo));

    const retVal = {
      needToLoadPdf: false,
      pageInfo: undefined as IPageSOBP,
      basePageInfo: undefined as IPageSOBP,
    };

    if (page) {
      // 페이지가 찾아졌으면
      const newPageNo = page.pageNo;

      const msi = MappingStorage.getInstance();
      const map = msi.getNPageTransform(pageInfo);
      page.addPageInfo(pageInfo, map.basePageInfo);

      const state = store.getState() as RootState;
      const currActivePage = state.activePage.activePageNo;
      if (newPageNo !== currActivePage) {
        setActivePageNo(newPageNo);
      }
    }
    else {
      // 페이지가 찾기지 않았으면
      switch (found.type) {
        case "pod": {
          // POD인 경우 file을 로드하라고 전달
          retVal.needToLoadPdf = true;

          const pageInfo = { ...found.pageInfo };
          const basePageInfo = { ...found.basePageInfo };

          // PDF의 시작 페이지
          const m0 = g_availablePagesInSection[pageInfo.section];
          pageInfo.page = (pageInfo.page - (found.pdf.pdfPageNo - 1) + m0) % m0;

          const m1 = g_availablePagesInSection[basePageInfo.section];
          basePageInfo.page = (basePageInfo.page - (found.pdf.pdfPageNo - 1) + m1) % m1;

          retVal.pageInfo = pageInfo;
          retVal.basePageInfo = basePageInfo;

          const firstPageNo = this.numPages;
          for (let i = 0; i < found.pdf.numPages; i++) {
            const bpi = { ...basePageInfo };
            bpi.page = (bpi.page + i) % m1;
            const activePageNo = this.addNcodePage(bpi);
          }
          setActivePageNo(firstPageNo);

          break;
        }

        case "note":
        case "default":
        default: {
          //
          const activePageNo = this.addNcodePage(pageInfo);
          setActivePageNo(activePageNo);
          break;
        }
      }
    }

    return retVal;
  }

  public addNcodePage = (pageInfo: IPageSOBP) => {
    console.log(` GRIDA DOC , ncode page added ${makeNPageIdStr(pageInfo)}`);
    const msi = MappingStorage.getInstance();
    const found = msi.getNPageTransform(pageInfo);

    const page = new GridaPage(this.numPages, pageInfo, pageInfo);
    this._pages.push(page);

    setDocNumPages(this._pages.length);
    return this._pages.length - 1;
  }

  public removePdfDoc = (pdf: NeoPdfDocument) => {
    const targets = this._pdfd.filter(item => item.pdf.fingerprint === pdf.fingerprint);

    targets.forEach(target => {
      const len = target.endPageInDoc - target.startPageInDoc;
      this._pages = this._pages.splice(target.startPageInDoc, len);
    });

    this._pdfd = this._pdfd.filter(item => item.pdf.fingerprint !== pdf.fingerprint);
  }


  get pages() {
    return this._pages;
  }

  getPdfUrlAt = (pageNo: number) => {
    if (pageNo < this.numPages) return this._pages[pageNo].url;
    return undefined;
  }

  getPdfFilenameAt = (pageNo: number) => {
    if (pageNo < this.numPages) return this._pages[pageNo].filename;
    return undefined;
  }

  getPdfFingerprintAt = (pageNo: number) => {
    if (pageNo < this.numPages) return this._pages[pageNo].fingerprint;
    return undefined;
  }

  getPageAt = (pageNo: number) => {
    if (pageNo < this.numPages) return this._pages[pageNo];
    return undefined;
  }

  getPdfPageNoAt = (pageNo: number) => {
    if (pageNo < this.numPages) return this._pages[pageNo].pdfPageNo;
    return undefined;
  }

  getPageInfosAt = (pageNo: number) => {
    if (pageNo < this.numPages) return this._pages[pageNo].pageInfos;
    return undefined;
  }

  getBasePageInfoAt = (pageNo: number) => {
    if (pageNo < this.numPages) return this._pages[pageNo].basePageInfo;
    return undefined;
  }
}
