import { g_availablePagesInSection } from "../constants";
import { IPageMapItem, IPageSOBP, IPdfToNcodeMapItem } from "../structures";
import { cloneObj, getNowTimeStr, makeNPageId, makePdfId } from "../util";
import CoordinateTanslater from "./CoordinateTanslater";

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
      const p1 = makeNPageId(a.pageInfo);
      const p2 = makeNPageId(b.pageInfo);

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

    const head = this._arrMapped[0]; //tail 인데?
    const { url, fingerprint, numPages } = head.pdfDesc;
    const availablePages = g_availablePagesInSection[pi.section];
    const availablePages_base = g_availablePagesInSection[basePageInfo.section];
    for (let pgNo = head.pdfPageNo; pgNo <= numPages; pgNo++) { 
      //head.pdfPageNo에 인쇄된 pdf가 갖는 실제 자기가 속한 pdf의 pageNo이 있음. 
      //2~3page만 인쇄했다면 arr에도 2~3page만 들어있기 때문에 여기서도 맞춰줘야 더미를 생성하지 않는다.
      const idx = arr.indexOf(pgNo);

      /**
       * 페이지가 발견되지 않으면 더미를 넣는다
       * 더미는, 첫 페이지의 매핑 정보를 그대로 활용한다. 대부분 같으리라
       */
      if (idx < 0) {
        const item: IPageMapItem = cloneObj(head);

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

    let printCodeStartPage = page - (head.pdfDesc.pageNo - 1);
    if (printCodeStartPage < availablePages) {
      printCodeStartPage = ((page - (head.pdfDesc.pageNo - 1)) + availablePages) % availablePages;
    } //ncode a4에서 page가 512보다 커져서 기대하지 않은 값이 들어가는 오류 수정

    const printCodeStart: IPageSOBP = {
      section, owner, book,
      page: printCodeStartPage,
    }

    const { section: s0, owner: o0, book: b0, page: p0 } = head.basePageInfo;
    const availablePages0 = g_availablePagesInSection[s0];

    let baseCodeStartPage = p0 - (head.pdfDesc.pageNo - 1);
    if (baseCodeStartPage < availablePages0) {
      baseCodeStartPage = ((page - (head.pdfDesc.pageNo - 1)) + availablePages0) % availablePages0;
    } //ncode a4에서 page가 512보다 커져서 기대하지 않은 값이 들어가는 오류 수정

    const baseCodeStart: IPageSOBP = {
      section: s0, owner: o0, book: b0,
      page: baseCodeStartPage, 
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
    const id = makePdfId(fingerprint, this._pagesPerSheet);
    
    this._docMap = {
      url, numPages,
      fingerprint, id,
      pagesPerSheet: this._pagesPerSheet,
      filename: this._filename,
      printPageInfo: printCodeStart,
      basePageInfo: baseCodeStart,
      params: this._arrMapped,
      timeString: getNowTimeStr(),
    }
  }

  public makeSummaryForTemporary = () => {
    /** PDF 파일 전체의 첫 페이지에 해당하는 ncode 정보를 가져온다 */
    // const [printCodeStart, baseCodeStart] = this.getStartingNPageInfo();
    const printCodeStart = this._arrMapped[this._arrMapped.length-1].basePageInfo;
    const baseCodeStart = this._arrMapped[this._arrMapped.length-1].basePageInfo;
    if (!printCodeStart) return;

    /** 빈 페이지에 더미 데이터를 채워 넣는다 */
    this.insertDummy(printCodeStart, baseCodeStart);

    /** 파일 전체의 매핑 정보를 기록해 둔다 */
    const head = this._arrMapped[0];
    const { url, fingerprint, numPages } = head.pdfDesc;
    const id = makePdfId(fingerprint, this._pagesPerSheet);

    this._docMap = {
      url, numPages,
      fingerprint, id,
      pagesPerSheet: this._pagesPerSheet,
      filename: this._filename,
      printPageInfo: printCodeStart,
      basePageInfo: baseCodeStart,
      params: this._arrMapped,
      timeString: getNowTimeStr(),
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