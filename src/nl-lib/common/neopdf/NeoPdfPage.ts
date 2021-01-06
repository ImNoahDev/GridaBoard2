import * as PdfJs from "pdfjs-dist";

import { ColorConvertMethod } from "../enums";
import { PDF_DEFAULT_DPI } from "../constants";
import { IPdfPageDesc, IRectDpi, IPageMapItem } from "../structures";
import { uuidv4, clearCanvas, drawCrossMark } from "../util";
import CoordinateTanslater from "../mapper/CoordinateTanslater";

import CanvasColorConverter from "./CanvasColorConverter";
import { NeoPdfDocument } from "./NeoPdfDocument";


export type PDF_VIEWPORT_DESC = PdfJs.ViewportParameters & PdfJs.PDFPageViewport;


export interface IThumbnailDesc {
  url: string,
  imageData: ImageData,
  bgColor: string,
  canvas: { w: number, h: number },
  dst: {
    x: number, y: number, w: number, h: number
  },
  markPos?: {
    x: number, y: number
  }
}

export interface IPdfPageCanvasDesc {
  pdfPageInfo: IPdfPageDesc,

  /** splitted canvas 내의 index */
  index: number,

  /** 그려진 canvas */
  canvas: HTMLCanvasElement,
  rotation: number,


  width_pu: number,
  height_pu: number,

  drawnRect: IRectDpi,
}


export class NeoPdfPage {
  _pdfPage: PdfJs.PDFPageProxy;

  _ready: PdfJs.PDFPromise<PdfJs.PDFPageProxy>;

  _loaded = false;

  private _defaultViewport: PDF_VIEWPORT_DESC;

  _pageNo: number;

  _doc: NeoPdfDocument;

  _translater: CoordinateTanslater;

  _thumbnail: IThumbnailDesc;

  private _pageToNcodeMaps: IPageMapItem[] = [];

  /**
   * 이 값은 NeoPdfDocument의 load에서 refreshNcodeMappingTable에 의해 자동으로 설정되고
   * MappingStorage가 update될 때마다 자동으로 갱신된다.
   */
  get pageToNcodeMaps() {
    return this._pageToNcodeMaps;
  }

  // addPageToNcodeMaps = (pageMaps: IPageMapItem[]) => {
  //   // this._pageToNcodeMaps 자체가 바뀌는 것을 막자, GridaDoc에서 쓴다.
  //   //
  //   // 이걸, pointer로 복사하게 된다면,
  //   // GridaDoc와 GridaPage의 pageInfo 관련된 항목을 자동 업데이트 되게 수정해야 한다.
  //   const storedMaps = this._pageToNcodeMaps;
  //   pageMaps.forEach(pageMap => {
  //     const isIncluded =
  //       storedMaps.findIndex(storedMap => isSamePage(storedMap.pageInfo, pageMap.pageInfo)) >= 0;
  //     if (!isIncluded) storedMaps.push(pageMap);
  //   });
  // }

  // resetPageToNcodeMaps = () => {
  //   this._pageToNcodeMaps = [];
  // }

  constructor(neoPdf: NeoPdfDocument, pageNo: number) {
    this._pageNo = pageNo;
    this._doc = neoPdf;


    this._ready = neoPdf._pdfDoc.getPage(pageNo);
    this._ready.then(_pdfPage => {
      this._pdfPage = _pdfPage;
      this._loaded = true;
      this._defaultViewport = _pdfPage.getViewport({ scale: 1 });
    });
  }

  getPage = async () => {
    await this._ready;
    return this._pdfPage;
  }


  render = (params: PdfJs.PDFRenderParams) => {
    // await this._ready;
    // const renderTask: PdfJs.PDFRenderTask = this._pdfPage.render(params);
    // const ret = await renderTask.promise;
    // return ret;

    const renderTask: PdfJs.PDFRenderTask = this._pdfPage.render(params);
    return renderTask;
  }

  public get viewport(): PDF_VIEWPORT_DESC {
    return this._defaultViewport;
  }

  getViewport = (params: PdfJs.ViewportParameters): PDF_VIEWPORT_DESC => {
    return this._pdfPage.getViewport(params);
  }


  setTranslater = (translater: CoordinateTanslater) => {
    this._translater = translater;
  }

  static getDummyThumbnail = async () => {
    const thumbnail: IThumbnailDesc = {
      url: "//:0",
      imageData: undefined,
      bgColor: "",
      canvas: { w: 0, h: 0 },
      dst: {
        x: 0, y: 0, w: 0, h: 0
      }
    };

    return thumbnail;
  }
  private generateThumbnail = async (width: number, height: number, bgColor = "rgba(255,255,255,0)") => {
    if (this.isSameThumbnail(width, height, bgColor))
      return this._thumbnail;

    const vpt: PDF_VIEWPORT_DESC = this.viewport;
    const scale = Math.min(width / vpt.width, height / vpt.height);
    const dpi = scale * PDF_DEFAULT_DPI;
    const desc = await this.render_dpi(0, dpi);

    const canvas = document.createElement("canvas");
    const uuid = uuidv4();
    canvas.id = `scratchCanvas-forImage-${uuid}`;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    clearCanvas(canvas, ctx, bgColor);

    const src = { width: vpt.width * scale, height: vpt.height * scale };
    const dx = (width - src.width) / 2;
    const dy = (height - src.height) / 2;
    ctx.drawImage(desc.canvas, 0, 0, src.width, src.height, dx, dy, src.width, src.height);

    // const dataURL = canvas.toDataURL();
    const imageData = ctx.getImageData(0, 0, width, height);

    const thumbnail: IThumbnailDesc = {
      url: undefined,
      imageData,
      bgColor,
      canvas: { w: width, h: height },
      dst: {
        x: dx, y: dy, w: src.width, h: src.height
      }
    };
    this._thumbnail = thumbnail;

    return thumbnail;
  }

  private isSameThumbnail = (width: number, height: number, bgColor) => {
    if (!this._thumbnail) return false;

    const i = this._thumbnail.canvas;
    if (i.w === width && i.h === height && bgColor === this._thumbnail.bgColor) {
      return true;
    }

    return false;
  }
  public getThumbnailUrl = async (width: number, height: number, bgColor = "rgba(255,255,255,0)", drawCalibrationMark = false, markPos = 0) => {
    const thumbnail = await this.generateThumbnail(width, height, bgColor);

    const canvas = document.createElement("canvas");
    const uuid = uuidv4();
    canvas.id = `scratchCanvas-forImage-${uuid}`;
    canvas.width = thumbnail.canvas.w;
    canvas.height = thumbnail.canvas.h;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(thumbnail.imageData, 0, 0);

    let markDrawn = { x: undefined, y: undefined };
    if (drawCalibrationMark) {
      const dx = thumbnail.dst.x;
      const dy = thumbnail.dst.y;
      const dw = thumbnail.dst.w;
      const dh = thumbnail.dst.h;
      markDrawn = drawCrossMark({ ctx, drawMarkRatio: 0.1, markPos, x: dx, y: dy, w: dw, h: dh });
    }
    const dataURL = canvas.toDataURL();

    const retVal: IThumbnailDesc = { ...thumbnail, url: dataURL, markPos: { ...markDrawn } };
    return retVal;
  }


  /**
   *
   * @param index - splitted area index, starting from 0
   * @param dpi - print dpi
   */
  public render_dpi = async (index: number, dpi: number) => {

    await this._ready;

    const pageNo = this._pageNo;
    const scratchCanvas = document.createElement("canvas");
    const canvas = scratchCanvas;
    const uuid = uuidv4();
    canvas.id = `scratchCanvas-${pageNo}-${uuid}`;

    const page = this._pdfPage;

    const viewport: PDF_VIEWPORT_DESC = this.viewport;
    const rotation = viewport.rotation;
    const ctx = canvas.getContext('2d');

    const PRINT_RESOLUTION = dpi;
    const scale = PRINT_RESOLUTION / PDF_DEFAULT_DPI;
    // const CSS_UNITS = 96.0 / PDF_DEFAULT_DPI;

    canvas.width = Math.floor(viewport.width * scale);
    canvas.height = Math.floor(viewport.height * scale);
    clearCanvas(canvas, ctx);
    // const cssWidth = Math.floor(viewport.width * CSS_UNITS);
    // const cssHeight = Math.floor(viewport.height * CSS_UNITS);
    // ctx.save();
    // ctx.fillStyle = "rgb(255, 255, 255)";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.restore();

    const renderContext = {
      canvasContext: ctx,
      transform: [scale, 0, 0, scale, 0, 0],
      viewport: page.getViewport({
        scale: 1,
        rotation: viewport.rotation
      }),
      intent: "print"
    };
    await page.render(renderContext).promise

    const doc = this._doc;
    const result: IPdfPageCanvasDesc = {
      pdfPageInfo: {
        url: doc.url,
        filename: doc.filename,
        fingerprint: doc.fingerprint,
        id: undefined,
        numPages: doc.numPages,
        pageNo: this._pageNo,
      },

      index,
      canvas,
      rotation,

      width_pu: viewport.width,
      height_pu: viewport.height,
      drawnRect: {
        unit: "600dpi",
        x: 0, y: 0, width: 0, height: 0,
      }
    }

    return result;
  }

  public convertColor = async (canvasDesc: IPdfPageCanvasDesc, colorConvertMode: ColorConvertMethod, luminanceMaxRatio: number) => {
    if (colorConvertMode) {
      const pdfCanvas = canvasDesc.canvas;
      const converter = new CanvasColorConverter(pdfCanvas);
      await converter.convert(colorConvertMode, luminanceMaxRatio);
    }

    return canvasDesc;
  }
}