import { IPageSOBP } from "../NcodePrintLib/DataStructure/Structures";
import NeoPdfDocument from "../NcodePrintLib/NeoPdf/NeoPdfDocument";
import NeoPdfPage from "../NcodePrintLib/NeoPdf/NeoPdfPage";


export default class GridaPage {
  pageInfos: IPageSOBP[];
  pdf: NeoPdfDocument;
  pageNo: number;

  pdfPage: NeoPdfPage;
  constructor(pageInfos: IPageSOBP[]) {
    this.pageInfos = pageInfos;
  }

  setPdfPage = (pdf: NeoPdfDocument, pageNo: number) => {

  }
}