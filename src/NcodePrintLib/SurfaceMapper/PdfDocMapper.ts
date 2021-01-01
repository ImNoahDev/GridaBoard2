import { CoordinateTanslater, IPageMapItem, IPdfToNcodeMapItem } from "../Coordinates";
import { IPageSOBP } from "../DataStructure/Structures";
import * as Util from "../UtilFunc";
import { g_availablePagesInSection } from "../NcodeSurface/SurfaceInfo";

export default class PdfDocMapper {
  private _arrMapped: IPageMapItem[] = [];

  private _docMap: IPdfToNcodeMapItem;

  private _filename: string;

  private _pagesPerSheet: number;

  constructor(filename: string, pagesPerSheet: number) {
    this._filename = filename;
    this._pagesPerSheet = pagesPerSheet;
  }


  get length() {
    return this._arrMapped.length;
  }

  getAt = (index: number) => {
    return this._arrMapped[index];
  }


  get docMap() {
    return this._docMap;
  }


  public push = (item: IPageMapItem) => {
    this._arrMapped.push(item);

    const compare = (a: IPageMapItem, b: IPageMapItem) => {
      const p1 = Util.makeNPageId(a.pageInfo);
      const p2 = Util.makeNPageId(b.pageInfo);

      return p1 - p2;
    }
    this._arrMapped.sort(compare);
  }

  public append = (items: CoordinateTanslater[]) => {
    items.forEach(item => {
      this.push(item.mappingParams);
    });
  }

  private insertDummy = (pi: IPageSOBP, basePageInfo: IPageSOBP) => {
    /** 빈 페이지를 채워 넣자 */
    const arr = [];
    for (let i = 0; i < this._arrMapped.length; i++) {
      const params = this._arrMapped[i];

      arr.push(params.pdfDesc.pageNo);
    }

    const head = this._arrMapped[0];
    const { url, fingerprint, numPages } = head.pdfDesc;
    const availablePages = g_availablePagesInSection[pi.section];
    const availablePages_base = g_availablePagesInSection[basePageInfo.section];
    for (let pgNo = 1; pgNo <= numPages; pgNo++) {
      const idx = arr.indexOf(pgNo);

      /**
       * 페이지가 발견되지 않으면 더미를 넣는다
       * 더미는, 첫 페이지의 매핑 정보를 그대로 활용한다. 대부분 같으리라
       */
      if (idx < 0) {
        const item: IPageMapItem = Util.cloneObj(head);

        item.pdfDesc.pageNo = pgNo;
        item.pageInfo.page = (pi.page + (pgNo - 1)) % availablePages;
        item.basePageInfo.page = (basePageInfo.page + (pgNo - 1)) % availablePages;
        this.push(item);
      }
    }
  }


  private getStartingNPageInfo = () => {
    const head = this._arrMapped[0];
    if (!head) {
      console.error("Temp Mapping Storage: nothing to summary up");
      return [undefined, undefined];
    }

    const { section, owner, book, page } = head.pageInfo;
    const availablePages = g_availablePagesInSection[section];
    const printCodeStart: IPageSOBP = {
      section, owner, book,
      page: ((page - (head.pdfDesc.pageNo - 1)) + availablePages) % availablePages,
    }

    const { section: s0, owner: o0, book: b0, page: p0 } = head.basePageInfo;
    const availablePages0 = g_availablePagesInSection[s0];
    const baseCodeStart: IPageSOBP = {
      section: s0, owner: o0, book: b0,
      page: ((p0 - (head.pdfDesc.pageNo - 1)) + availablePages0) % availablePages0,
    }


    return [printCodeStart, baseCodeStart];
  }


  public makeSummary = () => {
    /** PDF 파일 전체의 첫 페이지에 해당하는 ncode 정보를 가져온다 */
    const [printCodeStart, baseCodeStart] = this.getStartingNPageInfo();
    if (!printCodeStart) return;

    /** 빈 페이지에 더미 데이터를 채워 넣는다 */
    this.insertDummy(printCodeStart, baseCodeStart);

    /** 파일 전체의 매핑 정보를 기록해 둔다 */
    const head = this._arrMapped[0];
    const { url, fingerprint, numPages } = head.pdfDesc;
    const id = Util.makePdfId(fingerprint, this._pagesPerSheet);


    this._docMap = {
      url, numPages,
      fingerprint, id,
      pagesPerSheet: this._pagesPerSheet,
      filename: this._filename,
      printPageInfo: printCodeStart,
      basePageInfo: baseCodeStart,
      params: this._arrMapped,
      timeString: Util.getNowTimeStr(),
    }

    // console.log(`${numPages}: starting from ${Util.makeNPageIdStr(printCodeStart)}`);
    // for (let i = 0; i < this._arrMapped.length; i++) {
    //   const pageNo = this._arrMapped[i].pdfDesc.pageNo;
    //   const pageInfo = this._arrMapped[i].pageInfo;
    //   console.log(`         ${pageNo}/${numPages}: ${Util.makeNPageIdStr(pageInfo)}`);
    // }

  }


  dump = (prefix = "debug") => {
    console.log(`[${prefix}]----------------------------------------------------------------------`);
    const str = JSON.stringify(this._arrMapped, null, "  ");
    const arr = str.split("\n");

    for (let i = 0; i < arr.length; i++) {
      console.log(`[${prefix}] ${arr[i]}`);
    }
    console.log(`[${prefix}]----------------------------------------------------------------------`);
  }
}