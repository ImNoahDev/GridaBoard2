import NeoPdfDocument, { IGetDocumentOptions } from "../NcodePrintLib/NeoPdf/NeoPdfDocument";
import NeoPdfManager, { IPenToViewerEvent, PdfManagerEventName } from "../NcodePrintLib/NeoPdf/NeoPdfManager";
import { IPageSOBP } from "../neosmartpen/DataStructure/Structures";
import GridaPage from "./GridaPage";

let _doc_instance = undefined;

export default class GridaDoc {
  private pages: GridaPage[] = [];

  private pdfs: { pdfNames: IGetDocumentOptions, pdf: NeoPdfDocument, promise: Promise<NeoPdfDocument> }[] = [];


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
    this.addPdfDoc({ url: pdf.url, filename: pdf.filename });
  }


  addPdfDoc = (option: IGetDocumentOptions) => {
    // 1) 먼저 PDF를 저장하고 
    const promise = NeoPdfManager.getInstance().getDocument(option);
    const pdfObj = {
      pdfNames: option,
      pdf: undefined,
      promise: promise,
    }
    this.pdfs.push(pdfObj);

    promise.then((pdf) => {
      pdfObj.pdf = pdf;

      // 2) 페이지를 넣어 주자
      const numPages = pdf.numPages;
      for (let i = 0; i < numPages; i++) {
        const pageInfos: IPageSOBP[] = [];
        const maps = pdf.getPage(i + 1).pageToNcodeMaps;
        maps.forEach(map => pageInfos.push(map.pageInfo));

        this.addPage(pageInfos, pdf, i + 1);
      }
    });

  }

  removePdfDoc = (pdf: NeoPdfDocument) => {

  }

  addPage = (pageInfos: IPageSOBP[], pdf: NeoPdfDocument, pageNo: number) => {
    const page = new GridaPage(pageInfos);
    page.setPdfPage(pdf, pageNo)

    this.pages.push(page);
  }

  getPages = () => {
    const pages: GridaPage[] = [];

    return pages;
  }
}
