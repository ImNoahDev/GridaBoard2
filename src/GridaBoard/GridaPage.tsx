import { IPageMapItem } from "../NcodePrintLib/Coordinates";
import { IPageOverview, IPageSOBP } from "../NcodePrintLib/DataStructure/Structures";
import { getNPaperSize_pu } from "../NcodePrintLib/NcodeSurface/SurfaceInfo";
import NeoPdfDocument from "../NcodePrintLib/NeoPdf/NeoPdfDocument";
import NeoPdfPage from "../NcodePrintLib/NeoPdf/NeoPdfPage";
import { isSamePage } from "../neosmartpen/utils/UtilsFunc";


export default class GridaPage {
  _maps: IPageMapItem[];
  _pdf: NeoPdfDocument;
  _pageNo: number;

  _pdfPage: NeoPdfPage;

  // _pageInfo: IPageSOBP = { section: -1, owner: -1, book: -1, page: -1 };

  private _pageToNcodeMaps: IPageMapItem[] = [];


  constructor(maps: IPageMapItem[]) {
    this._maps = maps;
  }

  get fingerprint() {
    if (this.pdf) return this.pdf.fingerprint;
    return undefined;
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

  get pageNo() { return this._pageNo; }


  // 여기서 부터는 mapping item에 대한 내용
  addPageToNcodeMaps = (pageMaps: IPageMapItem[]) => {
    // this._pageToNcodeMaps 자체가 바뀌는 것을 막자, GridaDoc에서 쓴다.
    //
    // 이걸, pointer로 복사하게 된다면,
    // GridaDoc와 GridaPage의 pageInfo 관련된 항목을 자동 업데이트 되게 수정해야 한다.
    const storedMaps = this._pageToNcodeMaps;
    pageMaps.forEach(pageMap => {
      const isIncluded =
        storedMaps.findIndex(storedMap => isSamePage(storedMap.pageInfo, pageMap.pageInfo)) >= 0;
      if (!isIncluded) storedMaps.push(pageMap);
    });
  }


  get pageInfos() {
    const pageInfos: IPageSOBP[] = [];
    this._pageToNcodeMaps.forEach(pageMap => pageInfos.push(pageMap.pageInfo));
    return pageInfos;
  }

  getPageInfoAt = (index: number) => {
    const map = this._pageToNcodeMaps[index];
    if (map) return map.pageInfo;
    return undefined;
  }
  // 여기까지

  get pageOverview() {
    if (this._pdf)
      return this._pdf.pagesOverview[this._pageNo - 1];

    const pageInfo = this.getPageInfoAt(0);
    // undefined인 경우도 있을 것 같긴하다. 아래의 getNPaperSize_pu에서 예외처리 하고 있다.
    const pageSize = getNPaperSize_pu(pageInfo);
    const landscape = pageSize.width > pageSize.height;
    const retVal: IPageOverview = {
      sizePu: pageSize,
      rotation: 0,
      landscape
    };
    return retVal;
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
