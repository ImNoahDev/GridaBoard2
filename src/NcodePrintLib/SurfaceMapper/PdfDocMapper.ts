import { CoordinateTanslater, IMappingParams, IPdfMappingDesc } from "../Coordinates";
import { IPageSOBP } from "../DataStructure/Structures";
import * as Util from "../UtilFunc";
import { g_availablePagesInSection } from "../NcodeSurface/SurfaceInfo";

export default class PdfDocMapper {
  private _arrMapped: IMappingParams[] = [];

  private _docMap: IPdfMappingDesc;

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


  public push = (item: IMappingParams) => {
    this._arrMapped.push(item);

    const compare = (a: IMappingParams, b: IMappingParams) => {
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

  private getStartingNPageInfo = () => {
    const head = this._arrMapped[0];
    if (!head) {
      console.error("Temp Mapping Storage: nothing to summary up");
      return null;
    }
    const { section, owner, book, page } = head.pageInfo;
    const availablePages = g_availablePagesInSection[section];

    const pi_start: IPageSOBP = {
      section, owner, book,
      page: ((page - (head.pdfDesc.pageNo - 1)) + availablePages) % availablePages,
    }



    return pi_start;

  }

  private insertDummy = (pi: IPageSOBP) => {
    /** 빈 페이지를 채워 넣자 */
    const arr = [];
    for (let i = 0; i < this._arrMapped.length; i++) {
      const params = this._arrMapped[i];

      arr.push(params.pdfDesc.pageNo);
    }

    const head = this._arrMapped[0];
    const { url, fingerprint, numPages } = head.pdfDesc;
    const availablePages = g_availablePagesInSection[pi.section];
    for (let pgNo = 1; pgNo <= numPages; pgNo++) {
      const idx = arr.indexOf(pgNo);

      /**
       * 페이지가 발견되지 않으면 더미를 넣는다
       * 더미는, 첫 페이지의 매핑 정보를 그대로 활용한다. 대부분 같으리라
       */
      if (idx < 0) {
        const item: IMappingParams = Util.cloneObj(head);

        item.pdfDesc.pageNo = pgNo;
        item.pageInfo.page = (pi.page + (pgNo - 1)) % availablePages;
        this.push(item);
      }
    }
  }

  public makeSummary = () => {
    /** PDF 파일 전체의 첫 페이지에 해당하는 ncode 정보를 가져온다 */
    const pi_start = this.getStartingNPageInfo();
    if (!pi_start) return;

    /** 빈 페이지에 더미 데이터를 채워 넣는다 */
    this.insertDummy(pi_start);

    /** 파일 전체의 매핑 정보를 기록해 둔다 */
    const head = this._arrMapped[0];
    const { url, fingerprint, numPages } = head.pdfDesc;
    const id = Util.makePdfId({ fingerprint, pagesPerSheet: this._pagesPerSheet });


    this._docMap = {
      url, fingerprint, id, numPages,
      filename: this._filename,
      nPageStart: pi_start,
      params: this._arrMapped,
      timeString: Util.getNowTimeStr(),
    }

    console.log(`${numPages}: starting from ${Util.makeNPageIdStr(pi_start)}`);
    for (let i = 0; i < this._arrMapped.length; i++) {
      const pageNo = this._arrMapped[i].pdfDesc.pageNo;
      const pageInfo = this._arrMapped[i].pageInfo;
      console.log(`         ${pageNo}/${numPages}: ${Util.makeNPageIdStr(pageInfo)}`);
    }

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