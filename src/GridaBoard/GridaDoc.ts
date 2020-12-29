import { IPageMapItem } from "../NcodePrintLib/Coordinates";
import NeoPdfDocument, { IGetDocumentOptions } from "../NcodePrintLib/NeoPdf/NeoPdfDocument";
import NeoPdfManager, { IPenToViewerEvent, PdfManagerEventName } from "../NcodePrintLib/NeoPdf/NeoPdfManager";
import { IPageSOBP } from "../neosmartpen/DataStructure/Structures";
import { setDocNumPages } from "../store/reducers/activePdfReducer";
import GridaPage from "./GridaPage";

let _doc_instance = undefined as GridaDoc;

export default class GridaDoc {
  private pages: GridaPage[] = [];

  private pdfs: {
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

  static getInstance() {
    if (_doc_instance) return _doc_instance;
    _doc_instance = new GridaDoc();

    const pdfManager = NeoPdfManager.getInstance();
    pdfManager.addEventListener(PdfManagerEventName.ON_PDF_LOADED, _doc_instance.onPdfLoaded);

    return _doc_instance;
  }

  /**
   * Message handlers
   * @param event 
   */
  public onPdfLoaded = (event: IPenToViewerEvent) => {
    const pdf = event.pdf;
    console.log(`file ${pdf.filename} loaded`);
    console.log(`-GRIDA DOC-, onPdfLoaded ${pdf.filename},  purpose:${pdf.purpose} - ${pdf.url}`);

    const found = this.pdfs.findIndex(item => item.fingerprint === pdf.fingerprint);
    if (found < 0) {
      this.pdfs.push({
        pdf,
        fingerprint: pdf.fingerprint,
        pdfNames: { url: pdf.url, filename: pdf.filename, purpose: "to be stored by GridaDoc", },
        promise: Promise.resolve(pdf),
        startPageInDoc: this.numPages,
        endPageInDoc: this.numPages + pdf.numPages - 1,
      });

      // 2) 페이지를 넣어 주자
      this.addPdfPages(pdf);
      setDocNumPages(this.numPages);
    }
  }

  private addPdfPages = (pdf: NeoPdfDocument) => {
    const numPages = pdf.numPages;
    for (let i = 0; i < numPages; i++) {
      const maps = pdf.getPage(i + 1).pageToNcodeMaps;
      this.addPage(maps, pdf, i + 1);
    }

  }

  public addNcodePage = (pageInfo: IPageSOBP) => {
    const map: IPageMapItem = {
      pageInfo,
      npageArea: undefined,
      pdfDesc: undefined,
      h: undefined,
      h_rev: undefined,
    }
  }

  public removePdfDoc = (pdf: NeoPdfDocument) => {
    const targets = this.pdfs.filter(item => item.pdf.fingerprint === pdf.fingerprint);

    targets.forEach(target => {
      const len = target.endPageInDoc - target.startPageInDoc;
      this.pages = this.pages.splice(target.startPageInDoc, len);
    });

    this.pdfs = this.pdfs.filter(item => item.pdf.fingerprint !== pdf.fingerprint);
  }

  private addPage = (maps: IPageMapItem[], pdf: NeoPdfDocument, pageNo: number) => {
    const page = new GridaPage(maps);
    page.setPdfPage(pdf, pageNo)

    this.pages.push(page);
  }

  getPages = () => {
    return this.pages;
  }
}
