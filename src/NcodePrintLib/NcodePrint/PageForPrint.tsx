import React, { Component } from 'react';
import * as PdfJs from 'pdfjs-dist';
import { IPageSOBP, ISize, ICssSize, IRectDpi, } from '../DataStructure/Structures';
import NcodeRasterizer, { IPagesPerSheetNumbers, IPrepareSurfaceParam, drawArrow, IAreasDesc, } from "../NcodeSurface/NcodeRasterizer";
import { CSS_DPI, IPrintOption } from './PrintDataTypes';
import { IPageOverview } from './PagesForPrint';
import { getSurfaceSize_css } from '../NcodeSurface';
import { getCellMatrixShape } from '../NcodeSurface/SurfaceSplitter';
import { IPdfPageCanvasDesc } from '../NeoPdf/NeoPdfPage';
import NeoPdfDocument from '../NeoPdf/NeoPdfDocument';
import { uuidv4 } from './UtilFunc';

let debug = 0;

type ICanvasShapeDesc = {
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



interface Props {
  /** start from 0 */
  sheetIndex: number,
  pdf: NeoPdfDocument,

  /** null이면 화면 전용 */
  OnPagePrepared: Function,
  printOption: IPrintOption,
  pageNums: number[],
  pagesOverview: IPageOverview[],

  name: string,
}


interface State {
  status: string,
  page: PdfJs.PDFPageProxy,
  width: string,
  height: string,

  isLandscape: boolean,
}


/**
 * Class
 */
export class PageForPrint extends Component<Props, State> {
  canvas: HTMLCanvasElement = null;
  // pageImageDescs: IPdfPageCanvasDesc[] = [];
  entireRotation: number = 0;

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
  constructor(props: Props) {
    super(props);

    this.uuid = uuidv4();
    // this.pageImageDescs = new Array(props.printOption.pagesPerSheet);
  }

  /**
   *
   * @param canvas
   */
  setCanvasRef = (canvas: HTMLCanvasElement) => {
    this.canvas = canvas;
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // let shoudUpdate = true;
    return this.props.pdf !== nextProps.pdf || this.state.status !== nextState.status;
  }

  componentDidUpdate(nextProps: Props, nextState: State) {
    // this._update(nextProps.pdf, nextProps.printOption);

    // console.log("[test updated] CHECK START");
    // for (const [key, value] of Object.entries(nextProps)) {
    //   if (this.props[key] !== value) {
    //     console.log(`[test updated] property[${key}] was changed, from "${this.props[key]} to "${value}"`);
    //   }
    // }

    // for (const [key, value] of Object.entries(nextState)) {
    //   if (this.state[key] !== value) {
    //     console.log(`[test updated] state[${key}] was changed, from "${this.state[key]} to "${value}"`);
    //   }
    // }
    // console.log("[test updated] CHECK END");

    this._update(nextProps.pdf, nextProps.printOption);
  }

  componentDidMount() {
    const { pdf, printOption } = this.props;
    this._update(pdf, printOption);
  }

  /**
   *
   * @param pdf
   */
  _update = (pdf: NeoPdfDocument, printOption: IPrintOption) => {
    if (pdf) {
      this.prepareSheet(pdf, printOption);
    } else {
      this.setState({ status: 'loading' });
    }
  };


  prepareSheet = async (pdf: NeoPdfDocument, printOption: IPrintOption) => {
    if (!this.canvas) return;

    // console.log("[xxx] PageForPrint loadPage");
    const status = this.state.status;
    const { sheetIndex } = this.props;
    if (status === 'rendering' || status === 'rendered' || this.state.page !== null) return;

    this.setState({ status: 'rendering' });

    // 렌더링할 페이지 번호들
    const pageNums = this.props.pageNums;

    // Main canvas를 준비
    const canvasDesc = await this.prepareMainCanvas(printOption);

    // PDF 이미지를 canvas버퍼에 넣어 둔다.
    let pageImagesDesc = await this.preparePdfPageImages(pdf, pageNums);    // this.pageImageDescs

    // 분할된 Ncode plane을 준비
    const ncodePlane = await this.prepareSplittedNcodePlane(pageNums, printOption);
    const { canvas: codeCanvas, canvasAreas, } = ncodePlane;
    this.reportProgress({ sheetIndex, pageNums, completion: 50 });

    // main canvas를 준비
    const mainCanvas = this.canvas;
    const ctx = mainCanvas.getContext("2d");
    ctx.fillStyle = "rgba(255, 255, 255, 255)";     // 투명 캔버스
    ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
    ctx.save();

    ctx.imageSmoothingEnabled = false;

    // main canvas에 PDF 이미지를 조합
    pageImagesDesc = this.putPdfPageImagesOnMainCanvas(ctx, canvasAreas, pageImagesDesc);
    this.reportProgress({ sheetIndex, pageNums, completion: 70 });

    // 필요하면 debugging용 화살표를, debig level 1 이상
    this.drawDebugLines(mainCanvas, ctx, printOption);

    // main canvas에 Ncode 이미지를 오버레이
    this.overlayNcodePlaneOnMainCanvas(ctx, codeCanvas, printOption);
    this.reportProgress({ sheetIndex, pageNums, completion: 90 });

    // PDF와 ncode의 mapping table에 추가
    const pagesPerSheet = printOption.pagesPerSheet as number;
    pdf.setDocumentId(pagesPerSheet);
    for (let i = 0; i < pageImagesDesc.length; i++) {
      pageImagesDesc[i].pdfPageInfo.id = pdf.id;
    }

    pdf.registerMappingItem(pageImagesDesc, ncodePlane, printOption.assignNewCode);


    // 캔버스의 색상 값 디버깅용, debug level 3 이상
    this.debugCheckColorValues(mainCanvas, ctx, printOption);
    ctx.restore();

    const { width: css_width, height: css_height } = canvasDesc.css;
    this.setState({ status: 'rendered', width: css_width, height: css_height });

    this.reportProgress({ sheetIndex, pageNums, completion: 100 });
  }

  private drawDebugLines = (mainCanvas, ctx, printOption: IPrintOption) => {
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

  private reportProgress = (arg: { sheetIndex: number, pageNums: number[], completion: number }) => {
    const OnPagePrepared = this.props.OnPagePrepared;
    if (OnPagePrepared) OnPagePrepared(arg);

  }


  private debugCheckColorValues = (mainCanvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, printOption: IPrintOption) => {
    if (!printOption.debugMode || printOption.debugMode < 3) return;

    debug++;
    console.log(`color check = ${debug}`);
    const { width, height } = mainCanvas;
    let id = ctx.getImageData(0, 0, width, height);
    let pd = id.data;
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
        if (!m.hasOwnProperty(str)) {
          console.log(`found rgba=(${r}, ${g}, ${b}, ${a})`);
          m[str] = 0;
        }
        m[str] = m[str] + 1;

        index += 4;
      }
    }
  }

  private prepareSplittedNcodePlane = async (pageNums: number[], printOption: IPrintOption) => {

    // 분할된 Ncode plane을 준비
    const { pagesPerSheet, debugMode, printDpi, direction, mediaSize, hasToPutNcode } = printOption;
    const pageInfos: IPageSOBP[] = [];

    // const pageNums: number[] = [];
    for (let i = 0; i < pageNums.length; i++) {
      const pageNo = pageNums[i];

      const p: IPageSOBP = {
        ...printOption.pageInfo,
        page: printOption.pageInfo.page + pageNo - 1,
      }
      pageInfos.push(p);
    }

    const options: IPrepareSurfaceParam = {
      numItems: pagesPerSheet as IPagesPerSheetNumbers,
      srcDirection: direction,
      dpi: printDpi,
      mediaSize,
      debugMode,
      pageInfos,
      hasToPutNcode,
    };

    const rasterizer = new NcodeRasterizer(printOption);
    const ncodePlane = await rasterizer.prepareNcodePlane(options);

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

  private overlayNcodePlaneOnMainCanvas = (ctx: CanvasRenderingContext2D, codeCanvas: HTMLCanvasElement, printOption: IPrintOption) => {
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



  prepareMainCanvas = async (printOption: IPrintOption): Promise<ICanvasShapeDesc> => {
    /** Prepare main canvas */

    let mainCanvas = this.canvas;

    if (!mainCanvas) {
      console.log("main canvas is null");
      return;
    }
    const { printDpi: dpi, pagesPerSheet, direction } = printOption;

    const { width: width_css, height: height_css } = getSurfaceSize_css(printOption.mediaSize);
    // const { width: width_dpi, height: height_dpi } = getSurfaceSize_dpi(printOption.mediaSize, dpi);

    const width_dpi = width_css * dpi / CSS_DPI;
    const height_dpi = height_css * dpi / CSS_DPI;


    /** 가로 세로의 비율을 원래대로 지키는 것이 아주 중요, 그렇지 않으면 프린터가 점을 깬다 */
    // const dpi_css_scale_width = width_dpi / width_css;
    // const dpi_css_scale_height = height_dpi / height_css;

    // const toAvoidPageBreak = 1;
    // let mediaCssWidth = Math.floor(width_css);
    // let mediaCssHeight = Math.floor(height_css);
    let mediaCssWidth = width_css;
    let mediaCssHeight = height_css;

    /** 이렇게 css의 크기를 변경해 주면, pixel의 크기도 변경해야 한다. 그때 가로 세로의 원래 비율을 유지하는 것이 굉장히 중요 */
    // mediaCssWidth -= toAvoidPageBreak;
    // mediaCssHeight -= toAvoidPageBreak;

    let isLandscape = (direction === "landscape");

    const { rotation } = getCellMatrixShape(pagesPerSheet, direction);
    // console.log(`[yyy] prepareMainCanvas -${printOption.direction}, rotation=${rotation}`);

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
  private preparePdfPageImages = async (pdf: NeoPdfDocument, pageNums: number[])
    : Promise<IPdfPageCanvasDesc[]> => {

    const printOption = this.props.printOption;
    const { pagesPerSheet, pdfRenderingDpi } = printOption;

    const pdfDpi = pdfRenderingDpi / pagesPerSheet;
    const descs = await pdf.renderPages_dpi(pageNums, pdfDpi, printOption.colorMode);
    this.entireRotation = descs[0].rotation;

    return descs;
  }


  /** imageRendering: "pixelated"가 굉장히 중요 */
  render() {
    let { sheetIndex } = this.props;
    let { width, height, status } = this.state;
    // console.log(`status [${status}],  Page orientation: ${isLandscape ? "LandscapeOrientation" : "PortraitOrientation"}`);
    const style = {
      // width, height,
      // transform: `rotate(${-rotation}deg)`,
      // WebkitTransform: `rotate(${-rotation}deg)`,
      // msTransform: `rotate(${-rotation}deg)`,
    };


    return (
      <div className={`pdf-sheet-${sheetIndex}${this.uuid} ${status}`} style={style} >
        {/* <PortraitOrientation /> */}
        <canvas ref={this.setCanvasRef} style={{ imageRendering: "pixelated", width, height }} />
      </div >
    );
  }
}
