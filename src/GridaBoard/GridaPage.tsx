import { IPageMapItem } from "../NcodePrintLib/Coordinates";
import { IPageSOBP } from "../NcodePrintLib/DataStructure/Structures";
import NeoPdfDocument from "../NcodePrintLib/NeoPdf/NeoPdfDocument";
import NeoPdfPage from "../NcodePrintLib/NeoPdf/NeoPdfPage";


export default class GridaPage {
  maps: IPageMapItem[];
  pdf: NeoPdfDocument;
  pageNo: number;

  pdfPage: NeoPdfPage;

  get pageInfos() {
    const pageInfos: IPageSOBP[] = [];
    this.maps.forEach(map => pageInfos.push(map.pageInfo));
    return pageInfos;
  }

  constructor(maps: IPageMapItem[]) {
    this.maps = maps;
  }

  /**
   * 이 함수는 NeoPdfPage의 _pageToNcodeMaps을 저장해 둔다
   * 혹시, NeoPdfPage._pageToNcodeMaps 값 자체가 바뀌게 되면 문제를 일으킬 수 있으니,
   * NeoPdfPage에서는  _pageToNcodeMaps 자체는 바꾸지 말도록 하자. 내용은 상관 없다.
   * 
   * NeoPdfPage._pageToNcodeMapgs = new IPageMapItem[]; 이런식의 코드를 쓰지 말라는 얘기
   */
  setPdfPage = (pdf: NeoPdfDocument, pageNo: number) => {
    this.pdf = pdf;
    this.pageNo = pageNo;
    this.pdfPage = pdf.getPage(pageNo);
    this.maps = this.pdfPage.pageToNcodeMaps;
  }
}
