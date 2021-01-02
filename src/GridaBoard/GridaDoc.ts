import { IPageMapItem, IPdfToNcodeMapItem } from "../NcodePrintLib/Coordinates";
import { IFileBrowserReturn } from "../NcodePrintLib/NcodePrint/PrintDataTypes";
import NeoPdfDocument, { IPdfOpenOption } from "../NcodePrintLib/NeoPdf/NeoPdfDocument";
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
    pdfOpenInfo: IPdfOpenOption,
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
    // pdfDescs.forEach(pdfDesc => pdfDesc.pdf.addNcodeMapping(docMap));
    pdfDescs.forEach(pdfDesc => pdfDesc.pdf.refreshNcodeMappingTable());

    forceToRenderPanes();
  }

  public handleSetNcodeMapping = (docMap: IPdfToNcodeMapItem) => {
    // 내장한 PDF들에 대해서 pageInfo를 등록
    const pdfDescs = this._pdfDescs.filter(pdfDesc => pdfDesc.fingerprint === docMap.fingerprint);
    // pdfDescs.forEach(pdfDesc => pdfDesc.pdf.addNcodeMapping(docMap));
    pdfDescs.forEach(pdfDesc => pdfDesc.pdf.refreshNcodeMappingTable());

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
      this.appendPagesFromPdf(pdfDoc);
    }
  }

  private appendPagesFromPdf = (pdfDoc: NeoPdfDocument) => {
    // 0) PDF가 있는지 찾아보고 있으면 return, (없으면 1, 2를 통해서 넣는다)
    const found = this._pdfDescs.findIndex(item => item.fingerprint === pdfDoc.fingerprint);
    if (found >= 0) return;

    // 1) page와 maps(MappingStorage)에 있는 정보를 매핑해둔다.
    pdfDoc.refreshNcodeMappingTable();

    // 2) PDF 배열에 정보를 추가하고
    this._pdfDescs.push({
      pdf: pdfDoc,
      fingerprint: pdfDoc.fingerprint,
      pdfOpenInfo: { url: pdfDoc.url, filename: pdfDoc.filename, purpose: "to be stored by GridaDoc", },
      promise: Promise.resolve(pdfDoc),
      startPageInDoc: this.numPages,
      endPageInDoc: this.numPages + pdfDoc.numPages - 1,
    });

    // 3) 페이지를 넣어 주자
    const numPages = pdfDoc.numPages;
    for (let i = 0; i < numPages; i++) {
      const maps = pdfDoc.getPage(i + 1).pageToNcodeMaps;
      this.addPage(maps, pdfDoc, i + 1);
    }
  }

  private addPage = (maps: IPageMapItem[], pdf: NeoPdfDocument, pageNo: number) => {
    const page = new GridaPage(maps);
    page.setPdfPage(pdf, pageNo)

    this._pages.push(page);

    setDocNumPages(this._pages.length);
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
