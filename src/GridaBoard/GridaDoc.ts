import { IPageMapItem } from "../NcodePrintLib/Coordinates";
import { IFileBrowserReturn } from "../NcodePrintLib/NcodePrint/PrintDataTypes";
import NeoPdfDocument, { IGetDocumentOptions } from "../NcodePrintLib/NeoPdf/NeoPdfDocument";
import NeoPdfManager, { IPenToViewerEvent, PdfManagerEventName } from "../NcodePrintLib/NeoPdf/NeoPdfManager";
import { MappingStorage } from "../NcodePrintLib/SurfaceMapper";
import { IMappingStorageEvent, MappingStorageEventName } from "../NcodePrintLib/SurfaceMapper/MappingStorage";
import { makeNPageIdStr } from "../NcodePrintLib/UtilFunc/functions";
import { IPageSOBP } from "../neosmartpen/DataStructure/Structures";
import { setActivePdf, setDocNumPages, setUrlAndFilename } from "../store/reducers/activePageReducer";
import GridaPage from "./GridaPage";

let _doc_instance = undefined as GridaDoc;

export default class GridaDoc {
  private pages: GridaPage[] = [];


  private _pdfDescs: {
    pdf: NeoPdfDocument,
    fingerprint: string,
    pdfNames: IGetDocumentOptions,
    promise: Promise<NeoPdfDocument>,
    startPageInDoc: number,       // starting from 0
    endPageInDoc: number,         // starting from 0
  }[] = [];

  get numPages() {
    return this.pages.length;
  }

  constructor() {
    if (_doc_instance) return _doc_instance;
  }

  getPage = (pageNo: number) => {
    return this.pages[pageNo];
  }

  static getInstance() {
    if (_doc_instance) return _doc_instance;
    _doc_instance = new GridaDoc();

    const pdfManager = NeoPdfManager.getInstance();
    pdfManager.addEventListener(PdfManagerEventName.ON_PDF_LOADED, _doc_instance.onPdfLoaded);

    const mapper = MappingStorage.getInstance();
    mapper.addEventListener(MappingStorageEventName.ON_MAPINFO_ADDED, _doc_instance.handleMapInfoAdded);


    return _doc_instance;
  }

  handleMapInfoAdded = (event: IMappingStorageEvent) => {
    const docMap = event.mapper.docMap;
    const pdfDescs = this._pdfDescs.filter( pdfDesc => pdfDesc.fingerprint === docMap.fingerprint);
    pdfDescs.forEach(pdfDesc => pdfDesc.pdf.addNcodeMapping(docMap));
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

    this.pages.push(page);

    setDocNumPages(this.pages.length);
  }


  public addNcodePage = (pageInfo: IPageSOBP) => {
    console.log(` GRIDA DOC , ncode page added ${makeNPageIdStr(pageInfo)}`);

    const map: IPageMapItem = {
      pageInfo,
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
      this.pages = this.pages.splice(target.startPageInDoc, len);
    });

    this._pdfDescs = this._pdfDescs.filter(item => item.pdf.fingerprint !== pdf.fingerprint);
  }


  getPages = () => {
    return this.pages;
  }
}
