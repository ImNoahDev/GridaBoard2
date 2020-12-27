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

PdfJs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PdfJs.version}/pdf.worker.js`;
const CMAP_URL = "./cmaps/";
const CMAP_PACKED = true;

export type IGetDocumentOptions = {
  url: string,
  filename: string,

  fingerprint?: string,
  cMapUrl?: string,
  cMapPacked?: boolean,
}

export default class NeoPdfDocument {
  _mappingInfo: IPdfToNcodeMapItem;

  _pdfDoc: PdfJs.PDFDocumentProxy = null;

  _ready: PdfJs.PDFLoadingTask<PdfJs.PDFDocumentProxy>;

  _url: string;

  _filename: string;

  _fingerprint: string;

  _id: string;

  private _title: string;

  get title() {
    return this._title;
  }

  private _pages: NeoPdfPage[];


  /** starting from 0 (page 1 ==> 0) */
  _pagesOverview: IPageOverview[];

  /** starting from 0 (page 1 ==> 0) */
  _ncodeAssigned: IPageSOBP[];

  direction: "portrait" | "landscape";

  load = async (options: IGetDocumentOptions) => {
    await this.justLoad(options);

    // const { url, cMapUrl, cMapPacked } = options;

    // this._url = url;
    // this._ready = PdfJs.getDocument(
    //   {
    //     url: url,
    //     cMapUrl: cMapUrl ? cMapUrl : CMAP_URL,
    //     cMapPacked: cMapPacked ? cMapPacked : CMAP_PACKED,
    //   });

    // const _pdfDoc = await this._ready.promise;
    // this._pdfDoc = _pdfDoc;
    // this._fingerprint = _pdfDoc.fingerprint;

    // page를 로드한다
    this._pages = [];
    for (let i = 0; i < this._pdfDoc.numPages; i++) {
      const neoPage = new NeoPdfPage(this, i + 1);
      this._pages.push(neoPage);
    }

    this.refreshNcodeMappingTable();

    await this.setPageOverview();
    return this;
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
      page.setPageMap(maps);
    }
  }

  destroy = () => {
    this._pages = [];
    this._pdfDoc.destroy();
  }

  justLoad = async (options: IGetDocumentOptions) => {
    const { url, filename, cMapUrl, cMapPacked } = options;

    this._url = url;
    this._filename = filename;
    this._ready = PdfJs.getDocument(
      {
        url: url,
        cMapUrl: cMapUrl ? cMapUrl : CMAP_URL,
        cMapPacked: cMapPacked ? cMapPacked : CMAP_PACKED,
      });

    const pdfDoc = await this._ready.promise;
    this._pdfDoc = pdfDoc;
    this._fingerprint = pdfDoc.fingerprint;

    const meta = await pdfDoc.getMetadata();
    this._title = meta.info.title ? meta.info.title : "";

    return this;
  }

  get numPages() {
    return this._pdfDoc.numPages;
  }

  get url() {
    return this._url;
  }

  get filename() {
    return this._filename;
  }

  get fingerprint() {
    return this._fingerprint;
  }

  getPageAsync = async (pageNo: number) => {
    await this._pages[pageNo - 1]._ready;
    return this._pages[pageNo - 1];
  }

  /** page가 로드된 것이 확실할 때만 쓸 것! */
  getPage = (pageNo: number) => {
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

  setPageOverview = async () => {
    const pdf = this;

    // const pdf = this.props.pdf;
    this._pagesOverview = new Array(pdf.numPages);
    // const { pagesPerSheet } = this.printOption;

    let numPortraitPages = 0;
    let numLandscapePages = 0;

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPageAsync(i + 1);
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
