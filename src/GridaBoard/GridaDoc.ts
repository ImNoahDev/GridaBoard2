import { IPageMapItem, IPdfToNcodeMapItem } from "../NcodePrintLib/Coordinates";
import { IFileBrowserReturn } from "../NcodePrintLib/NcodePrint/PrintDataTypes";
import NeoPdfDocument, { IGetDocumentOptions } from "../NcodePrintLib/NeoPdf/NeoPdfDocument";
import NeoPdfManager, { IPenToViewerEvent, PdfManagerEventName } from "../NcodePrintLib/NeoPdf/NeoPdfManager";
import { MappingStorage } from "../NcodePrintLib/SurfaceMapper";
import { IAutoLoadDocDesc, IMappingStorageEvent, MappingStorageEventName } from "../NcodePrintLib/SurfaceMapper/MappingStorage";
import { makeNPageIdStr } from "../NcodePrintLib/UtilFunc/functions";
import { IPageSOBP } from "../neosmartpen/DataStructure/Structures";
import { forceToRenderPanes, setActivePdf, setDocNumPages, setUrlAndFilename } from "../store/reducers/activePageReducer";
import GridaPage from "./GridaPage";

let _doc_instance = undefined as GridaDoc;

export default class GridaDoc {
  private _pages: GridaPage[] = [];


  private _pdfDescs: {
    pdf: NeoPdfDocument,
    fingerprint: string,
    pdfNames: IGetDocumentOptions,
    promise: Promise<NeoPdfDocument>,
    startPageInDoc: number,       // starting from 0
    endPageInDoc: number,         // starting from 0
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
    const docMap = event.mapper.docMap;
    const pdfDescs = this._pdfDescs.filter(pdfDesc => pdfDesc.fingerprint === docMap.fingerprint);
    pdfDescs.forEach(pdfDesc => pdfDesc.pdf.addNcodeMapping(docMap));

    forceToRenderPanes();
  }

  public handleSetNcodeMapping = (docMap: IPdfToNcodeMapItem) => {
    // 내장한 PDF들에 대해서 pageInfo를 등록
    const pdfDescs = this._pdfDescs.filter(pdfDesc => pdfDesc.fingerprint === docMap.fingerprint);
    pdfDescs.forEach(pdfDesc => pdfDesc.pdf.addNcodeMapping(docMap));
    forceToRenderPanes();

    // GridaPage에 pageInfo를 등록
    docMap.params.forEach(params => {
      this._pages.forEach(page => {
        if (page.fingerprint === docMap.fingerprint && params.pdfDesc.pageNo === page.pageNo) {
          page.addPageToNcodeMaps([params]);
        }
      });
    })
  }

  public openPdfFile = async (option: { url: string, filename: string }) => {
    // setUrlAndFilename(option.url, option.filename);
    const pdfDoc = await NeoPdfManager.getInstance().getDocument({ url: option.url, filename: option.filename, purpose: "open pdf by GridaDoc" });
    setActivePdf(pdfDoc);

    if (pdfDoc) {
      this.registerPdfDoc(pdfDoc);
    }
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

  }

  private registerPdfDoc = (pdfDoc: NeoPdfDocument) => {
    const found = this._pdfDescs.findIndex(item => item.fingerprint === pdfDoc.fingerprint);

    if (found < 0) {
      this._pdfDescs.push({
        pdf: pdfDoc,
        fingerprint: pdfDoc.fingerprint,
        pdfNames: { url: pdfDoc.url, filename: pdfDoc.filename, purpose: "to be stored by GridaDoc", },
        promise: Promise.resolve(pdfDoc),
        startPageInDoc: this.numPages,
        endPageInDoc: this.numPages + pdfDoc.numPages - 1,
      });

      // 2) 페이지를 넣어 주자
      const numPages = pdfDoc.numPages;
      for (let i = 0; i < numPages; i++) {
        const maps = pdfDoc.getPage(i + 1).pageToNcodeMaps;
        this.addPage(maps, pdfDoc, i + 1);
      }
    }
  }

  private addPage = (maps: IPageMapItem[], pdf: NeoPdfDocument, pageNo: number) => {
    const page = new GridaPage(maps);
    page.setPdfPage(pdf, pageNo)

    this._pages.push(page);

    setDocNumPages(this._pages.length);
  }

  public handleActivePageChanged = (pageInfo: IPageSOBP) => {
  }

  public addNcodePage = (pageInfo: IPageSOBP) => {
    console.log(` GRIDA DOC , ncode page added ${makeNPageIdStr(pageInfo)}`);

    const map: IPageMapItem = {
      pdfPageNo: undefined,
      pageInfo,
      basePageInfo: pageInfo,
      npageArea: undefined,
      pdfDesc: undefined,
      h: undefined,
      h_rev: undefined,
    }
  }

  public removePdfDoc = (pdf: NeoPdfDocument) => {
    const targets = this._pdfDescs.filter(item => item.pdf.fingerprint === pdf.fingerprint);

    targets.forEach(target => {
      const len = target.endPageInDoc - target.startPageInDoc;
      this._pages = this._pages.splice(target.startPageInDoc, len);
    });

    this._pdfDescs = this._pdfDescs.filter(item => item.pdf.fingerprint !== pdf.fingerprint);
  }


  get pages() {
    return this._pages;
  }
}
