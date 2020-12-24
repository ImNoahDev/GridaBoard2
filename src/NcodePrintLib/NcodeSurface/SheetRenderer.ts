import { IPageSOBP, ISize, ICssSize, IRectDpi, } from '../DataStructure/Structures';
import NcodeRasterizer, { IPagesPerSheetNumbers, IRasterizeOption, drawArrow, IAreasDesc, } from "../NcodeSurface/NcodeRasterizer";
import { CSS_DPI, IPrintingEvent, IPrintOption, IProgressCallbackFunction } from "../NcodePrint/PrintDataTypes";

import { IPageOverview } from '../NcodePrint/HtmlRenderPrint/PagesForPrint';

import { getCellMatrixShape } from '../NcodeSurface/SurfaceSplitter';
import { IPdfPageCanvasDesc } from '../NeoPdf/NeoPdfPage';
import NeoPdfDocument from '../NeoPdf/NeoPdfDocument';

import { getSurfaceSize_css } from '../NcodeSurface/SurfaceInfo';
import * as Util from "../UtilFunc";
import { isSameObject, makeNPageIdStr } from '../UtilFunc';
import { SignalCellularNullOutlined } from '@material-ui/icons';
import { createElement } from 'react';
import { CoordinateTanslater } from '../Coordinates';

let debug = 0;

export type ICanvasShapeDesc = {
  /** before applying rotation */
  originalPixel: ISize,

  /** after applying rotation */
  pixel: ISize,
  rotation: number,

  /** based on originalPixel */
  css: ICssSize,

  /** based on originalPixel */
  isLandscape: boolean,
}

export type IOnPagePreparedFunction = (event: IPrintingEvent) => void;

export type IPrintingSheetDesc = {
  canvas: HTMLCanvasElement;
  canvasDesc: ICanvasShapeDesc,
  mappingItems: CoordinateTanslater[];
}

/**
 * Class
 */
export class SheetRenderer {
  canvas: HTMLCanvasElement = null;
  // pageImageDescs: IPdfPageCanvasDesc[] = [];
  entireRotation = 0;

  uuid: string;
  state = {
    /** @type {string} */
    status: 'N/A',

    /** @type {} */
    page: null,
    width: "0px",
    height: "0px",
    isLandscape: false,
  };

  printOption: IPrintOption;

  _ready: Promise<IPrintingSheetDesc>;

  progressCallback: IProgressCallbackFunction;
  reportCount = 0;

  _rendered: {
    rendered: boolean,
    pdf: NeoPdfDocument,
    pageNums: number[],
    printOption: IPrintOption
  }

  constructor(printOption: IPrintOption, progressCallback: IProgressCallbackFunction) {

    const canvas = document.createElement("canvas");
    this.uuid = Util.uuidv4();
    canvas.id = this.uuid;

    this.canvas = canvas;
    // this.printOption = { ...printOption };
    this.printOption = Util.cloneObj(printOption);
    this.progressCallback = progressCallback;

    this.reset();
  }

  reset = () => {
    this._ready = undefined;
    this._rendered = {
      rendered: false,
      pdf: undefined,
      pageNums: [],
      printOption: undefined,
    };
  }

  reportProgress = (event?: { status: string }) => {
    this.reportCount++;
    if (this.progressCallback) {
      this.progressCallback(event)
    }
  }

  public getPreparedSheet = async (pdf: NeoPdfDocument, pageNums: number[], printOption: IPrintOption, progressCallback: IProgressCallbackFunction) => {
    this.progressCallback = progressCallback;
    this.reportCount = 0;

    if (!this.isSameSheet(pdf, pageNums, printOption) || !this._ready) {
      this.reset();
      this._ready = this.prepareSheet(pdf, pageNums, printOption, this.reportProgress);
    }

    const retCanvas = await this._ready;

    // 그냥 빠져 나가는 경우에, 아래와 같이 report한다
    if (this._rendered.rendered && progressCallback) {
      const numPages = pageNums.length;
      const numSheets = 1;
      const maxCount = (numPages * 4) + (numSheets * 4);
      // const progressPercent = (this.printStatus.numEventCount / maxCount) * 100;
      for (let i = 0; i < maxCount; i++) progressCallback();
    }

    this._rendered = {
      rendered: true,
      pdf,
      pageNums: [...pageNums],
      // printOption: { ...printOption },
      printOption: Util.cloneObj(printOption),
    };

    return retCanvas;
  }

  private setState = (state) => {
    this.state = { ...this.state, ...state };
  }

  private isSameSheet = (pdf: NeoPdfDocument, pageNums: number[], printOption: IPrintOption) => {
    const rendered = this._rendered;
    if (!rendered) return false;

    if (pdf !== rendered.pdf || !isSameObject(pageNums, rendered.pageNums) || !isSameObject(printOption, this.printOption)) {
      return false;
    }
    return true;
  }


  /**
   *
   * @param pdf
   * @param sheetIndex -
   * @param pageNums - 렌더링할 페이지 번호들
   * @param printOption
   */

  private prepareSheet = async (pdf: NeoPdfDocument, pageNums: number[], printOption: IPrintOption, progressCallback: IProgressCallbackFunction) => {

    if (!this.canvas) return;

    // console.log("[xxx] PageForPrint loadPage");
    const status = this.state.status;
    if (status === 'rendering' || status === 'rendered' || this.state.page !== null) return;

    this.setState({ status: 'rendering' });


    // Main canvas를 준비
    const canvasDesc = await this.prepareMainCanvas();

    // PDF 이미지를 canvas버퍼에 넣어 둔다.
    let pageImagesDesc = await this.preparePdfPageImages(pdf, pageNums, progressCallback);    // this.pageImageDescs

    // 분할된 Ncode plane을 준비
    const ncodePlane = await this.prepareSplittedNcodePlane(pageNums, progressCallback);
    if (progressCallback) progressCallback();


    const { canvas: codeCanvas, canvasAreas, } = ncodePlane;

    // main canvas를 준비
    const mainCanvas = this.canvas;
    const ctx = mainCanvas.getContext("2d");
    ctx.fillStyle = "rgba(255, 255, 255, 255)";     // 투명 캔버스
    ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    ctx.save();

    ctx.imageSmoothingEnabled = false;

    // main canvas에 PDF 이미지를 조합
    pageImagesDesc = this.putPdfPageImagesOnMainCanvas(ctx, canvasAreas, pageImagesDesc);
    if (progressCallback) progressCallback();

    // 필요하면 debugging용 화살표를, debig level 1 이상
    this.drawDebugLines(mainCanvas, ctx);

    // main canvas에 Ncode 이미지를 오버레이
    this.overlayNcodePlaneOnMainCanvas(ctx, codeCanvas);
    if (progressCallback) progressCallback();

    // PDF와 ncode의 mapping table에 추가
    const pagesPerSheet = printOption.pagesPerSheet as number;
    pdf.setDocumentId(pagesPerSheet);
    for (let i = 0; i < pageImagesDesc.length; i++) {
      pageImagesDesc[i].pdfPageInfo.id = pdf.id;
    }

    // 캔버스의 색상 값 디버깅용, debug level 3 이상
    this.debugCheckColorValues(mainCanvas, ctx);
    ctx.restore();

    const { width: css_width, height: css_height } = canvasDesc.css;
    this.setState({ status: 'rendered', width: css_width, height: css_height });

    // 보고를 위해 code mapping item을 가져온다
    const array = pdf.generateMappingItems(pageImagesDesc, ncodePlane, printOption.needToIssueCode);
    if (progressCallback) progressCallback();

    const ret: IPrintingSheetDesc = {
      canvas: this.canvas,
      canvasDesc,
      mappingItems: array,
    }

    return ret;
  }


  private drawDebugLines = (mainCanvas, ctx) => {
    const printOption = this.printOption;
    if (printOption.debugMode < 1) return;

    ctx.save();

    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.strokeRect(1, 1, mainCanvas.width - 1, mainCanvas.height - 1);

    ctx.lineWidth = 50;
    ctx.lineCap = "round";
    const { width, height } = mainCanvas;

    ctx.font = "200px Verdana";
    // ctx.beginPath();
    // ctx.moveTo(100, 100);
    // ctx.lineTo(width - 100, 100);
    // ctx.lineTo(width - 100, 120);
    // ctx.lineTo(100, 120);
    // ctx.moveTo(100, 100);
    // ctx.stroke();
    ctx.strokeStyle = "rgb(0,0,0)";
    ctx.fillStyle = "rgb(0,0, 0)";
    drawArrow(ctx, 50, 100, width - 100, 100);
    ctx.fillText("X", width - 300, 300);

    drawArrow(ctx, 100, 50, 100, height - 100);
    ctx.fillText("Y", 150, height - 100);

    ctx.restore();
  }

  private debugCheckColorValues = (mainCanvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const printOption = this.printOption;

    if (!printOption.debugMode || printOption.debugMode < 3) return;

    debug++;
    console.log(`color check = ${debug}`);
    const { width, height } = mainCanvas;
    const id = ctx.getImageData(0, 0, width, height);
    const pd = id.data;
    let index = 0;

    const m: { [key: string]: number } = {};
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const r = pd[index];
        const g = pd[index + 1];
        const b = pd[index + 2];
        const a = pd[index + 3];

        // const str = r + "." + g + "." + b + "." + a;
        const str = a + ".";
        if (!Object.prototype.hasOwnProperty.call(m, str)) {
          console.log(`found rgba=(${r}, ${g}, ${b}, ${a})`);
          m[str] = 0;
        }
        m[str] = m[str] + 1;

        index += 4;
      }
    }
  }

  private prepareSplittedNcodePlane = async (pageNums: number[], progressCallback: IProgressCallbackFunction) => {
    const printOption = this.printOption;

    // 분할된 Ncode plane을 준비
    // const { padding, drawFrame, drawMarkRatio, drawCalibrationMark, maxPagesPerSheetToDrawMark, pagesPerSheet, debugMode, printDpi, direction, mediaSize, hasToPutNcode } = printOption;
    const { direction } = printOption;
    const pageInfos: IPageSOBP[] = [];

    // 페이지에 코드를 할당하는 부분인데, 이게 이상하다.
    console.log(`[code assign] ${pageNums}`);
    for (let i = 0; i < pageNums.length; i++) {
      const pageNo = pageNums[i];
      const assignedCode = printOption.issuedNcodes[pageNo - 1];
      const p: IPageSOBP = { ...assignedCode };
      console.log(`[code assign]    ${makeNPageIdStr(p)}`);
      pageInfos.push(p);
    }

    const options: IRasterizeOption = {
      srcDirection: direction,
      pageInfos,
      printOption,
      // mediaSize,
      // debugMode,
      // hasToPutNcode,
      // maxPagesPerSheetToDrawMark,
      // drawCalibrationMark,
      // drawMarkRatio,
      // drawFrame,
      // padding,
    };

    const rasterizer = new NcodeRasterizer(printOption);
    const ncodePlane = await rasterizer.prepareNcodePlane(options, progressCallback);

    console.log(`[mapping] return ncodePlane = ${makeNPageIdStr(ncodePlane.ncodeAreas[0].pageInfo)}`);

    return ncodePlane;
  }

  private putPdfPageImagesOnMainCanvas = (ctx: CanvasRenderingContext2D,
    canvasAreas: IAreasDesc, pageImageDescs: IPdfPageCanvasDesc[]) => {
    // for (let i = 0; i < this.pageImageDescs.length; i++) {
    //   const desc = this.pageImageDescs[i];

    for (let i = 0; i < pageImageDescs.length; i++) {
      const desc = pageImageDescs[i];
      if (!desc) continue;

      const area = canvasAreas.areas[i];
      const { x, y, width, height } = area;
      const canvas = desc.canvas;
      // console.log(`[Multipage] draw page ${i} ${canvas.width},${canvas.height} ==> (${x},${y})~(${width}, ${height})`)

      const zoom_x = width / canvas.width;
      const zoom_y = height / canvas.height;
      const zoom = Math.min(zoom_x, zoom_y);

      const dw = canvas.width * zoom;
      const dh = canvas.height * zoom;
      const dx = (width - dw) / 2;
      const dy = (height - dh) / 2;

      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, x + dx, y + dy, dw, dh);

      const rc: IRectDpi = {
        unit: "600dpi",
        x: x + dx,
        y: y + dy,
        width: dw,
        height: dh,
      }
      desc.drawnRect = rc;
    }

    return pageImageDescs;

  }

  private overlayNcodePlaneOnMainCanvas = (ctx: CanvasRenderingContext2D, codeCanvas: HTMLCanvasElement) => {
    const printOption = this.printOption;

    if (printOption.codeDensity === 3) {
      ctx.drawImage(codeCanvas, 0, 0);
      ctx.drawImage(codeCanvas, 1, 0);
      ctx.drawImage(codeCanvas, 2, 0);

      ctx.drawImage(codeCanvas, 0, 1);
      ctx.drawImage(codeCanvas, 1, 1);
      ctx.drawImage(codeCanvas, 2, 1);

      ctx.drawImage(codeCanvas, 0, 2);
      ctx.drawImage(codeCanvas, 1, 2);
      ctx.drawImage(codeCanvas, 2, 2);
    }
    else {
      ctx.drawImage(codeCanvas, 0, 0);
      ctx.drawImage(codeCanvas, 1, 0);

      ctx.drawImage(codeCanvas, 0, 1);
      ctx.drawImage(codeCanvas, 1, 1);
    }
  }



  prepareMainCanvas = async (): Promise<ICanvasShapeDesc> => {
    const mainCanvas = this.canvas;

    if (!mainCanvas) {
      console.log("main canvas is null");
      return;
    }

    const printOption = this.printOption;
    const { printDpi: dpi, pagesPerSheet, direction, mediaSize, imagePadding } = printOption;
    const { width: width_css, height: height_css } = getSurfaceSize_css(mediaSize, false, imagePadding);

    const width_dpi = width_css * dpi / CSS_DPI;
    const height_dpi = height_css * dpi / CSS_DPI;
    const mediaCssWidth = width_css;
    const mediaCssHeight = height_css;

    let isLandscape = (direction === "landscape");

    const { rotation } = getCellMatrixShape(pagesPerSheet, direction);

    const isRotationNeeded = rotation === 90;
    if (isRotationNeeded) isLandscape = !isLandscape;

    /** 그래픽 크기와 상관 없이, rotation이 들어가 있는 경우 */
    let canvasDesc: ICanvasShapeDesc = {
      css: {
        width: mediaCssWidth + "px",
        height: mediaCssHeight + "px",
      },

      originalPixel: {
        // width: Math.floor(mediaCssWidth * dpi_css_scale_width),
        // height: Math.floor(mediaCssHeight * dpi_css_scale_height),
        width: width_dpi,
        height: height_dpi,
      },

      pixel: {
        // width: Math.floor(mediaCssWidth * dpi_css_scale_width),
        // height: Math.floor(mediaCssHeight * dpi_css_scale_height),
        width: width_dpi,
        height: height_dpi,
      },
      isLandscape: printOption.direction === "landscape",
      rotation: 0,
    };

    if (isLandscape) {
      canvasDesc = {
        ...canvasDesc,
        css: {
          width: canvasDesc.css.height,
          height: canvasDesc.css.width,
        },
        pixel: {
          width: canvasDesc.pixel.height,
          height: canvasDesc.pixel.width,
        }
      }
    }

    mainCanvas.width = canvasDesc.pixel.width;
    mainCanvas.height = canvasDesc.pixel.height;

    // console.log(`[size] mainCanvas = (${mainCanvas.width},${mainCanvas.height})`);
    this.setState({ width: mediaCssWidth + "px", height: mediaCssHeight + "px" });

    return canvasDesc;
  }

  /**
   * this.pdfCanvasDescs에 canvasDesc들을 넣어 둔다.
   */
  private preparePdfPageImages = async (pdf: NeoPdfDocument, pageNums: number[], progressCallback: IProgressCallbackFunction)
    : Promise<IPdfPageCanvasDesc[]> => {

    const printOption = this.printOption;

    const { pagesPerSheet, pdfRenderingDpi } = printOption;

    // const pdfDpi = pdfRenderingDpi / pagesPerSheet;
    const pdfDpi = Math.round(pdfRenderingDpi / Math.sqrt(Math.sqrt(pagesPerSheet)));
    const descs = await pdf.renderPages_dpi(pageNums, pdfDpi, printOption, progressCallback);
    this.entireRotation = descs[0].rotation;

    return descs;
  }
}
