import * as PdfJs from "pdfjs-dist";
import { CoordinateTanslater, IPdfPageDesc } from "../Coordinates";
import { IRectDpi,  } from "../DataStructure/Structures";
import { uuidv4 } from "../NcodePrint";
import { CanvasColorConverter } from "../NcodeSurface";
import { ColorConvertMethod } from "../NcodeSurface/CanvasColorConverter";
import { PDF_DEFAULT_DPI } from "../NcodeSurface/NcodeConstans";
import NeoPdfDocument from "./NeoPdfDocument";
export type PDF_VIEWPORT_DESC = PdfJs.ViewportParameters & PdfJs.PDFPageViewport;



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


export default class NeoPdfPage {
  _pdfPage: PdfJs.PDFPageProxy;

  _ready: PdfJs.PDFPromise<PdfJs.PDFPageProxy>;

  _loaded: boolean = false;

  private _defaultViewport: PDF_VIEWPORT_DESC;

  _pageNo: number;

  _doc: NeoPdfDocument;

  _translater: CoordinateTanslater;

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

  render = async (params: PdfJs.PDFRenderParams) => {
    await this._ready;
    const renderTask: PdfJs.PDFRenderTask = this._pdfPage.render(params);
    const ret = await renderTask.promise;
    return ret;
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


  public render_dpi = async (index: number, dpi: number)
    : Promise<IPdfPageCanvasDesc> => {

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
    const PRINT_UNITS = PRINT_RESOLUTION / PDF_DEFAULT_DPI;
    // const CSS_UNITS = 96.0 / PDF_DEFAULT_DPI;

    canvas.width = Math.floor(viewport.width * PRINT_UNITS);
    canvas.height = Math.floor(viewport.height * PRINT_UNITS);

    // const cssWidth = Math.floor(viewport.width * CSS_UNITS);
    // const cssHeight = Math.floor(viewport.height * CSS_UNITS);

    ctx.save();
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();


    // return Promise.resolve({ index, canvas, rotation, pageNo });

    const renderContext = {
      canvasContext: ctx,
      transform: [PRINT_UNITS, 0, 0, PRINT_UNITS, 0, 0],
      viewport: page.getViewport({
        scale: 1,
        rotation: viewport.rotation
      }),
      intent: "print"
    };


    const renderTask = page.render(renderContext);
    await renderTask.promise;

    const doc = this._doc;
    const result: IPdfPageCanvasDesc = {
      pdfPageInfo: {
        url: doc.url,
        fingerprint: doc.fingerprint,
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

  public convertColor = async (canvasDesc: IPdfPageCanvasDesc, colorConvertMode?: ColorConvertMethod) => {
    if (colorConvertMode) {
      const pdfCanvas = canvasDesc.canvas;
      const converter = new CanvasColorConverter(pdfCanvas);
      await converter.convert(colorConvertMode);
    }

    return canvasDesc;
  }
}