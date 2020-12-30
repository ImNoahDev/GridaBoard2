import * as PdfJs from "pdfjs-dist";
import { CoordinateTanslater, IPageMapItem, IPdfToNcodeMapItem, IPolygonArea } from "../Coordinates";
import { IPageSOBP, stringToDpiNum, } from "../DataStructure/Structures";
import { IPageOverview } from "../NcodePrint/HtmlRenderPrint/PagesForPrint";
import { ColorConvertMethod } from "../NcodeSurface/CanvasColorConverter";
import { getNcodeAtCanvasPixel, getNcodeRectAtCanvasPixel, ICellsOnSheetDesc } from "../NcodeSurface/NcodeRasterizer";
import { MappingItem, MappingStorage } from "../SurfaceMapper";
import NeoPdfPage, { IPdfPageCanvasDesc, IThumbnailDesc, PDF_VIEWPORT_DESC } from "./NeoPdfPage";

import * as Util from "../UtilFunc";
import { IPrintOption, IProgressCallbackFunction } from "../NcodePrint/PrintDataTypes";
import { uuidv4 } from "../UtilFunc";

const CMAP_URL = "./cmaps/";
const CMAP_PACKED = true;

let _doc_fingerprint = "";

export type IGetDocumentOptions = {
  url: string,
  filename: string,

  purpose: string,

  fingerprint?: string,
  cMapUrl?: string,
  cMapPacked?: boolean,
}

export default class NeoPdfDocument {
  _mappingInfo: IPdfToNcodeMapItem;

  _pdfDoc: PdfJs.PDFDocumentProxy;

  // _ready: PdfJs.PDFLoadingTask<PdfJs.PDFDocumentProxy>;

  _uuid: string;

  private _url: string;

  private _filename: string;

  private _purpose: string;

  private _fingerprint: string;

  private _id: string;

  private _title: string;

  private _numPages: number;

  get title() {
    return this._title;
  }

  private _pages: NeoPdfPage[];


  /** starting from 0 (page 1 ==> 0) */
  _pagesOverview: IPageOverview[];

  /** starting from 0 (page 1 ==> 0) */
  _ncodeAssigned: IPageSOBP[];

  direction: "portrait" | "landscape";

  constructor() {
    this._uuid = uuidv4();

    console.log(`:GRIDA DOC:,     constructor()`);
  }

  load = async (options: IGetDocumentOptions) => {
    console.log("~GRIDA DOC~,   load, step 1")
    const pdfDoc = await pdfJsOpenDocument(options);
    console.log("~GRIDA DOC~,   load, step 2")


    const { url, filename, cMapUrl, cMapPacked, purpose } = options;

    this._url = url;
    this._filename = filename;
    this._purpose = purpose;
    this._fingerprint = pdfDoc.fingerprint;
    this._numPages = pdfDoc.numPages;
    this._pdfDoc = pdfDoc;
    _doc_fingerprint = pdfDoc.fingerprint;

    // page를 로드한다
    if (pdfDoc) {
      this._pages = [];
      for (let i = 0; i < this._pdfDoc.numPages; i++) {
        // const page = await pdf.getPageAsync(i + 1);
        const neoPage = new NeoPdfPage(this, i + 1);
        this._pages.push(neoPage);
      }

      this.refreshNcodeMappingTable();

      await this.setPageOverview();
      return this;
    }

    return undefined;
  }

  /**
   * PDF에 할당된 ncode를 저장하는 루틴
   *
   * MappingStorage가 변하고 나면, 로드된 모든 PDF에 이 함수를 한번씩 불러줘야 한다
   */
  refreshNcodeMappingTable = () => {
    const mapper = MappingStorage.getInstance();
    const pdfMapDescArr: IPdfToNcodeMapItem[] = mapper.findAssociatedNcode(this.fingerprint);

    const flattenedMaps: IPageMapItem[] = [];
    pdfMapDescArr.forEach(map => {
      flattenedMaps.push(...map.params);
    });

    for (let i = 0; i < this._pdfDoc.numPages; i++) {
      const page = this._pages[i];
      const pageNo = i + 1;

      const maps = flattenedMaps.filter(map => map.pdfDesc.pageNo === pageNo);
      page.setPageToNcodeMaps(maps);
    }
  }

  destroy = () => {
    this._pages = [];
    this._pdfDoc.destroy();
  }

  get numPages() { return this._numPages; }

  get url() { return this._url; }

  get filename() { return this._filename; }

  get fingerprint() { return this._fingerprint; }

  get purpose() { return this._purpose }


  getPageAsync = async (pageNo: number) => {
    await this._pages[pageNo - 1]._ready;
    return this._pages[pageNo - 1];
  }

  /** page가 로드된 것이 확실할 때만 쓸 것! */
  getPage = (pageNo: number) => {
    if (pageNo > this.numPages) {
      console.error(`page range over ${pageNo}/${this.numPages}`);
      return undefined;
    }

    if (!this._pages[pageNo - 1]._loaded) {
      throw new Error(`PDF page ${pageNo} has not been loaded`);
    }

    return this._pages[pageNo - 1];
  }

  getMetadata = async () => {
    return this._pdfDoc.getMetadata();
  }

  public getPageThumbnailUrl = async (
    pageNo: number, width: number, height: number,
    bgColor = "rgba(255,255,255,0)", drawCalibrationMark = false, markPos = 2) => {
    if (pageNo < 1 || pageNo > this.numPages) {
      console.error(`getPageThumbnailUrl failed, page number is ${pageNo} of total pages(${this.numPages})`);
      return NeoPdfPage.getDummyThumbnail();
    }
    const neoPage = await this.getPageAsync(pageNo);
    return neoPage.getThumbnailUrl(width, height, bgColor, drawCalibrationMark, markPos);
  }

  public generatePageThumbnails = async (width: number, height: number, bgColor: string, drawCalibrationMark: boolean) => {
    const numPages = this.numPages;
    for (let i = 1; i <= (numPages > 1 ? 2 : 1); i++) {
      await this.getPageThumbnailUrl(i, width, height, bgColor, drawCalibrationMark);
    }
  }

  public renderPages_dpi = async (pageNums: number[], dpi: number, printOption: IPrintOption, progressCallback: IProgressCallbackFunction)
    : Promise<IPdfPageCanvasDesc[]> => {
    const { colorMode, luminanceMaxRatio } = printOption;
    const pdfDpi = dpi;

    const promises: Promise<IPdfPageCanvasDesc>[] = [];
    for (let i = 0; i < pageNums.length; i++) {
      const pageNo = pageNums[i];
      const neoPage = await this.getPageAsync(pageNo);
      if (progressCallback) progressCallback();

      const pr = neoPage.render_dpi(i, pdfDpi).then(async (canvasDesc) => {
        const convertResult = await neoPage.convertColor(canvasDesc, colorMode, luminanceMaxRatio);
        if (progressCallback) progressCallback();

        return convertResult;
      })
      promises.push(pr);
    }
    const descs = await Promise.all(promises);

    const pageImageDescs: IPdfPageCanvasDesc[] = new Array(descs.length);
    descs.forEach(async (canvasDesc) => {
      const { index } = canvasDesc;
      pageImageDescs[index] = canvasDesc;
      // console.log(`[Multipage] page rendered ${canvasDesc.pdfPageInfo.pageNo}, index ${index}`);
    });

    // let converterPromises = [];
    // descs.forEach(async (canvasDesc) => {
    //   const { index } = canvasDesc;
    //   pageImageDescs[index] = canvasDesc;

    //   const pdfCanvas = canvasDesc.canvas;
    //   const converter = new CanvasColorConverter(pdfCanvas);
    //   const pr = converter.convert(colorConvertMode);
    //   converterPromises.push(pr);
    // });
    return pageImageDescs;
  }


  generateMappingItems = (pageImagesDesc: IPdfPageCanvasDesc[], ncodePlane: ICellsOnSheetDesc, needToIssueCode: boolean) => {
    const array: CoordinateTanslater[] = [];

    for (let i = 0; i < ncodePlane.ncodeAreas.length; i++) {
      const desc = pageImagesDesc[i];
      const pdfRect = desc.drawnRect;
      const ncode = ncodePlane.ncodeAreas[i];

      const mapData = new MappingItem();

      /** canvas 좌표계 */
      const { x, y, unit, width, height } = pdfRect;
      const dpi = stringToDpiNum(unit);

      /** Ncode 좌표계 */
      const pt0_nu = getNcodeAtCanvasPixel({ x, y, dpi }, ncodePlane);
      const pt1_nu = getNcodeAtCanvasPixel({ x: x + width, y: y + height, dpi }, ncodePlane);

      const pdfRect_nu = getNcodeRectAtCanvasPixel({ dpi, x, y, width, height }, ncodePlane);

      /** 페이지에 해당하는 ncode가 인쇄된 영역 */
      const r_nu = ncode.rect;
      const polygon: IPolygonArea = [
        { x: r_nu.x, y: r_nu.y },
        { x: r_nu.x + r_nu.width, y: r_nu.y },
        { x: r_nu.x + r_nu.width, y: r_nu.y + r_nu.height },
        { x: r_nu.x, y: r_nu.y + r_nu.height },
      ];

      mapData.setNcodeArea({
        pageInfo: ncode.pageInfo,
        pdfDrawnRect: { ...pdfRect_nu },
        npageArea: polygon,
      });


      /** PDF 좌표계 */
      mapData.setPdfArea({
        pdfPageInfo: { ...desc.pdfPageInfo },
        rect: {
          unit: "pu",
          x: 0, y: 0,
          width: desc.width_pu,
          height: desc.height_pu,
        }
      });

      const trans = new CoordinateTanslater();
      trans.calc(mapData);
      array.push(trans);

      // const pageNo = desc.pdfPageInfo.pageNo;
      // const page = this.getPage(pageNo);
      // page.setTranslater(trans);

      // if (needToIssueCode) {
      //   const st = MappingStorage.getInstance();
      //   st.register(trans);
      // }
      // trans.dump(`[dump-${this._url}]-${i} `);
    }

    return array;

  }

  setDocumentId = (pagesPerSheet: number) => {
    this._id = Util.makePdfId(this._fingerprint, pagesPerSheet);
  }

  get id() {
    return this._id;
  }

  getPageSize = (pageNo: number) => {
    if (pageNo > this.numPages) {
      return undefined;
    }

    return this._pagesOverview[pageNo - 1].sizePu;
  }

  setPageOverview = async () => {
    // const pdf = this;

    // const pdf = this.props.pdf;
    this._pagesOverview = new Array(this.numPages);
    // const { pagesPerSheet } = this.printOption;

    let numPortraitPages = 0;
    let numLandscapePages = 0;

    for (let i = 0; i < this.numPages; i++) {
      // const page = await pdf.getPageAsync(i + 1);
      const page = await this._pdfDoc.getPage(i + 1);

      const vpt: PDF_VIEWPORT_DESC = page.getViewport({ scale: 1, rotation: 0 });
      const { width, height } = vpt;

      const landscape = width > height;
      landscape ? numLandscapePages++ : numPortraitPages++;

      const pageOverview = {
        rotation: vpt.rotation,
        landscape,
        sizePu: { width, height },
      }
      this._pagesOverview[i] = pageOverview;
    }

    if (numPortraitPages >= numLandscapePages) {
      this.direction = "portrait";
    } else {
      this.direction = "landscape";
    }

    return this.direction;
  }

  setNcodeAssigned = (pdfMapDesc: IPdfToNcodeMapItem) => {
    this._ncodeAssigned = MappingStorage.makeAssignedNcodeArray(pdfMapDesc.nPageStart, this.numPages);
  }

  getPageNcode = (pageNo: number) => {
    if (!pageNo || pageNo < 1 || pageNo > this.numPages) {
      throw "Page number range error";
    }

    return this._ncodeAssigned[pageNo - 1];
  }

  get pagesOverview() {
    return this._pagesOverview;
  }
}






PdfJs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PdfJs.version}/pdf.worker.js`;

const max_concurrent = 16;
let pdf_loader_idx = 0;
const pdf_fingerprint: string[] = new Array(16);
function pdfJsOpenDocument(options: IGetDocumentOptions): Promise<PdfJs.PDFDocumentProxy> {
  const { url, filename, cMapUrl, cMapPacked, purpose } = options;

  pdf_loader_idx = (pdf_loader_idx + 1) % max_concurrent;
  pdf_fingerprint[pdf_loader_idx] = "";

  console.log(":GRIDA DOC:,     pdfJsOpenDocument, step 1")

  const openOption = {
    url: url,
    cMapUrl: cMapUrl ? cMapUrl : CMAP_URL,
    cMapPacked: cMapPacked ? cMapPacked : CMAP_PACKED,
  };


  console.log(`:GRIDA DOC:,     pdfJsOpenDocument, step 2  fingerprint=${pdf_fingerprint} `);
  const loadingTask = PdfJs.getDocument(openOption);

  /**
   * 왜, 아래의 부분의 await 다음이 두번 콜백 실행되지? callback에 등록이 희안하게 되는 모양인데 말이지.
   * 마치 thread가 나뉘어 진 것 같이 동작한다.
   * NeoPdfDocument도 객체가 두번 생긴다. 이건 버그가 아닌가 싶은데 말이지?
   *
   * 2020/12/27, kitty
   */
  // // eslint-disable-next-line no-constant-condition
  // if (1 === 0) {
  //   const pdfDoc = await loadingTask.promise;
  //   console.log(`:GRIDA DOC:,     pdfJsOpenDocument, step 3  fingerprint=${pdf_fingerprint} `);
  //   pdf_fingerprint = pdfDoc.fingerprint;
  //   return pdfDoc;
  // }


  /**
   * 아래는 임시 방편으로 하나만 리턴하도록 했다. 즉, 꼼수다.
   * 2020/12/27, kitty
   */
  return new Promise(resolve => {
    loadingTask.promise.then(pdf => {
      resolve(pdf);
      // if (pdf_fingerprint[pdf_loader_idx] === "" || pdf_fingerprint[pdf_loader_idx] !== pdf.fingerprint) {
      //   resolve(pdf);
      // }
      // else {
      //   pdf.destroy();
      // }
      console.log(`:GRIDA DOC:,     pdfJsOpenDocument, step 3  fingerprint=${pdf_fingerprint} `);
      pdf_fingerprint[pdf_loader_idx] = pdf.fingerprint;
    });
  })
}

