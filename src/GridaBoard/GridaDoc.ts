import NeoPdfDocument from "../NcodePrintLib/NeoPdf/NeoPdfDocument";
import GridaPage from "./GridaPage";

export default class GridaDoc {
  pages: GridaPage[] = [];
  
  addPdfDoc = (pdf: NeoPdfDocument) => {

  }

  addPage = (page: GridaPage) => {

  }

  getPages = () => {
    const pages: GridaPage[] = [];

    return pages;
  }
}
