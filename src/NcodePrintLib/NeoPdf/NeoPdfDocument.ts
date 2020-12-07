import * as PdfJs from "pdfjs-dist";
import { CoordinateTanslater, IPolygonArea } from "../Coordinates";
import { stringToDpiNum, } from "../DataStructure/Structures";
import { getDocumentId, } from "../NcodePrint";
import { IPageOverview } from "../NcodePrint/PagesForPrint";
import { ColorConvertMethod } from "../NcodeSurface/CanvasColorConverter";
import { getNcodeAtCanvasPixel, getNcodeRectAtCanvasPixel, ICellsOnSheetDesc } from "../NcodeSurface/NcodeRasterizer";
import { MappingItem } from "../SurfaceMapper/MappingItem";
import MappingStorage from "../SurfaceMapper/MappingStorage";
import NeoPdfPage, { IPdfPageCanvasDesc, PDF_VIEWPORT_DESC } from "./NeoPdfPage";

PdfJs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PdfJs.version}/pdf.worker.js`;
var CMAP_URL = "./cmaps/";
var CMAP_PACKED = true;

export type IGetDocumentOptions = {
  url?: string,
  fingerprint?: string,
  cMapUrl?: string,
  cMapPacked?: boolean,
}

export type IPdfDocDesc = {
  /** PDF url */
  url: string,

  /** PDF finger print */
  fingerprint: string,

  /** POD id = fingerprint + "/" + pagesPerSheet */
  id: string,

  /** total pages in pdf file */
  numPages: number,
};




export default class NeoPdfDocument {
  _pdfDoc: PdfJs.PDFDocumentProxy = null;

  _ready: PdfJs.PDFLoadingTask<PdfJs.PDFDocumentProxy>;

  _url: string;

  _fingerprint: string;

  _id: string;

  private _pages: NeoPdfPage[];

  pagesOverview: IPageOverview[];

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
    for (let i = 1; i <= this._pdfDoc.numPages; i++) {
      const neoPage = new NeoPdfPage(this, i);
      this._pages.push(neoPage);
    }

    await this.setPageOverview(this);
    return this;
  }

  destroy = () => {
    this._pages = [];
    this._pdfDoc.destroy();
  }

  justLoad = async (options: IGetDocumentOptions) => {
    const { url, cMapUrl, cMapPacked } = options;

    this._url = url;
    this._ready = PdfJs.getDocument(
      {
        url: url,
        cMapUrl: cMapUrl ? cMapUrl : CMAP_URL,
        cMapPacked: cMapPacked ? cMapPacked : CMAP_PACKED,
      });

    const pdfDoc = await this._ready.promise;
    this._pdfDoc = pdfDoc;
    this._fingerprint = pdfDoc.fingerprint;

    return this;
  }

  get numPages() {
    return this._pdfDoc.numPages;
  }

  get url() {
    return this._url;
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

  public renderPages_dpi = async (pageNums: number[], dpi: number, colorConvertMode?: ColorConvertMethod)
    : Promise<IPdfPageCanvasDesc[]> => {
    const pdfDpi = dpi;

    const promises: Promise<IPdfPageCanvasDesc>[] = [];
    for (let i = 0; i < pageNums.length; i++) {
      const pageNo = pageNums[i];
      const neoPage = await this.getPageAsync(pageNo);
      const pr = neoPage.render_dpi(i, pdfDpi).then(async (canvasDesc) => {
        return await neoPage.convertColor(canvasDesc, colorConvertMode);
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


  registerMappingItem = (pageImagesDesc: IPdfPageCanvasDesc[], ncodePlane: ICellsOnSheetDesc, assignNewCode: boolean) => {
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
      const pageNo = desc.pdfPageInfo.pageNo;
      const page = this.getPage(pageNo);
      page.setTranslater(trans);

      if (assignNewCode) {
        const st = MappingStorage.getInstance();
        st.register(trans);


      }
      // trans.dump(`[dump-${this._url}]-${i} `);
    }

    if (assignNewCode) {
      const st = MappingStorage.getInstance();
      // st.dump("MAP");
    }
  }

  setDocumentId = (pagesPerSheet: number) => {
    this._id = getDocumentId(this._fingerprint, pagesPerSheet);
  }

  get id() {
    return this._id;
  }

  setPageOverview = async (pdf) => {
    // const pdf = this.props.pdf;
    this.pagesOverview = new Array(pdf.numPages + 1);
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
      this.pagesOverview[i] = pageOverview;
    }


    if (numPortraitPages >= numLandscapePages) {
      this.direction = "portrait";
    } else {
      this.direction = "landscape";
    }

    return this.direction;
  }
}
