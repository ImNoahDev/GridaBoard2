import { IPageMapItem } from "../NcodePrintLib/Coordinates";
import { IPageSOBP } from "../NcodePrintLib/DataStructure/Structures";
import NeoPdfDocument from "../NcodePrintLib/NeoPdf/NeoPdfDocument";
import NeoPdfPage from "../NcodePrintLib/NeoPdf/NeoPdfPage";


export default class GridaPage {
  _maps: IPageMapItem[];
  _pdf: NeoPdfDocument;
  _pageNo: number;

  _pdfPage: NeoPdfPage;

  _pageInfo: IPageSOBP = { section: -1, owner: -1, book: -1, page: -1 };


  constructor(maps: IPageMapItem[]) {
    this._maps = maps;
  }


  getAssociatedNcodes = () => {
    const pageInfos: IPageSOBP[] = [];
    this._maps.forEach(map => pageInfos.push(map.pageInfo));
    return pageInfos;
  }


  /**
   * 이 함수는 NeoPdfPage의 _pageToNcodeMaps을 저장해 둔다
   * 혹시, NeoPdfPage._pageToNcodeMaps 값 자체가 바뀌게 되면 문제를 일으킬 수 있으니,
   * NeoPdfPage에서는  _pageToNcodeMaps 자체는 바꾸지 말도록 하자. 내용은 상관 없다.
   * 
   * NeoPdfPage._pageToNcodeMapgs = new IPageMapItem[]; 이런식의 코드를 쓰지 말라는 얘기
   */
  setPdfPage = (pdf: NeoPdfDocument, pageNo: number) => {
    this._pdf = pdf;
    this._pageNo = pageNo;
    this._pdfPage = pdf.getPage(pageNo);
    this._maps = this._pdfPage.pageToNcodeMaps;
  }

  get pageOverview() {
    return this.pdf.pagesOverview[this._pageNo - 1];
  }

  get filename() {
    return this._pdf.filename;
  }
  get url() {
    return this._pdf.url;
  }

  get pdf() {
    return this._pdf;
  }
}
