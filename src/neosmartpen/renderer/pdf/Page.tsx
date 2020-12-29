import React, { Component } from 'react';
import { pdfSizeToDIsplayPixel, pdfSizeToDIsplayPixel_int } from "../../utils/UtilsFunc";

// import "pdfjs-dist";
// import * as PdfJs from "pdfjs-dist";
import { PDF_DEFAULT_DPI } from '../../constants';
import { sprintf } from 'sprintf-js';
import NeoPdfDocument from '../../../NcodePrintLib/NeoPdf/NeoPdfDocument';
import NeoPdfPage from '../../../NcodePrintLib/NeoPdf/NeoPdfPage';
import { MAX_RENDERER_PIXELS } from "../Constants";
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { BoxProps } from '@material-ui/core';


interface PageProps extends BoxProps {
  // pdf: PdfJs.PDFDocumentProxy,
  pdf: NeoPdfDocument,
  index: number,
  scale?: number,
  position: { offsetX: number, offsetY: number, zoom: number },
  // pdfCanvas: CSSProperties,

}

interface PageState {
  status: string,
  // page: PdfJs.PDFPageProxy | null,
  page: NeoPdfPage,
  width: number,
  height: number,
  imgSrc: string,
  renderCount: number;

  scratchCanvasStatus: "N/A" | "rendering" | "rendered",
}

type IBackRenderedStatus = {
  result: boolean,
  px_width: number,
  px_height: number
}

class Page extends Component<PageProps> {
  state: PageState = {
    status: 'N/A',
    page: null,
    width: 0,
    height: 0,
    imgSrc: URL.createObjectURL(new Blob()),
    renderCount: 0,

    scratchCanvasStatus: "N/A",
  };

  canvas: HTMLCanvasElement | null = null;

  inRendering = false;

  // renderTask: PdfJs.PDFRenderTask = null;
  renderTask: any = null;

  backPlane = {
    canvas: document.createElement("canvas"),
    inited: false,
    nowRendering: false,
    prevZoom: 0,
    zoomQueue: [] as number[],
    size: { result: false, px_width: 0, px_height: 0 },
  };

  zoomQueue: number[] = [];



  scaleCanvas(canvas: HTMLCanvasElement, width: number, height: number, zoom: number) {
    // assume the device pixel ratio is 1 if the browser doesn't specify it
    const devicePixelRatio = window.devicePixelRatio || 1;
    const context = canvas.getContext('2d');

    // determine the 'backing store ratio' of the canvas context
    const backingStoreRatio = 1;
    // (
    //   context.webkitBackingStorePixelRatio ||
    //   context.mozBackingStorePixelRatio ||
    //   context.msBackingStorePixelRatio ||
    //   context.oBackingStorePixelRatio ||
    //   context.backingStorePixelRatio || 1
    // );

    // determine the actual ratio we want to draw at
    const pdfCssRatio = 96 / 72;
    let ratio = devicePixelRatio * pdfCssRatio * zoom / backingStoreRatio;

    // 최대값을 설정하자
    if (width * height * ratio * ratio > MAX_RENDERER_PIXELS) {
      ratio = Math.sqrt(MAX_RENDERER_PIXELS / width / height);
    }

    const px_width = Math.floor(width * ratio);
    const px_height = Math.floor(height * ratio);



    if (devicePixelRatio !== backingStoreRatio) {
      // set the 'real' canvas size to the higher width/height
      canvas.width = px_width;
      canvas.height = px_height;

      // ...then scale it back down with CSS
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
    }
    else {
      // this is a normal 1:1 device; just scale it simply
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = '';
      canvas.style.height = '';
    }

    // scale the drawing context so everything will work at the higher ratio
    context.scale(ratio, ratio);

    return { ratio, px: { width: px_width, height: px_height }, css: { width, height } };
  }

  timeOut = (n) => {
    return new Promise(resolve => { setTimeout(() => { resolve(true); }, n); });
  }


  shouldComponentUpdate(nextProps: PageProps, nextState: PageState) {
    const zoomChanged = nextProps.position.zoom !== this.props.position.zoom;

    if (zoomChanged) {
      if (this.state.page) {
        this.renderPage(this.state.page, nextProps.position.zoom);
      }
      return false;
    }

    const pdfChanged = this.props.pdf !== nextProps.pdf;
    if (pdfChanged) {
      this._update(nextProps.pdf);
      return false;
    }

    return true;
  }


  componentDidMount() {
    const { pdf } = this.props;
    this._update(pdf);
  }

  setCanvasRef = (canvas: HTMLCanvasElement) => {
    this.canvas = canvas;
  };

  _update = (pdf: NeoPdfDocument) => {
    if (pdf) {
      this.backPlane.inited = false;
      this._loadPage(pdf);
    } else {
      this.setState({ status: 'loading' });
    }
  };

  _loadPage = (pdf: NeoPdfDocument) => {
    if (this.state.status === 'rendering') return;

    let pageNo = this.props.index;
    if (pageNo > pdf.numPages) {
      console.error("PDF 페이지의 범위를 넘은 페이지를 렌더링하려고 합니다.");
      pageNo = pdf.numPages;
    }

    pdf.getPageAsync(pageNo).then(
      (page) => {
        this.backPlane.inited = false;
        this.setState({ page, status: 'rendering' });
        this.renderPage(page, this.props.position.zoom);
      }
    );
  }

  renderToCanvasSafe = async (page: NeoPdfPage, dpi: number, zoom: number) => {
    if (this.backPlane.nowRendering && this.renderTask) {
      const renderTask = this.renderTask;
      renderTask.cancel();
      await renderTask;
    }
    return this.renderToCanvas(page, dpi, zoom);
  }

  renderToCanvas = async (page: NeoPdfPage, dpi: number, zoom: number): Promise<IBackRenderedStatus> => {
    const canvas = document.createElement("canvas");

    const PRINT_RESOLUTION = dpi * zoom;
    const PRINT_UNITS = PRINT_RESOLUTION / PDF_DEFAULT_DPI;
    const viewport: any = page.getViewport({ scale: 1 });

    const px_width = Math.floor(viewport.width * PRINT_UNITS);
    const px_height = Math.floor(viewport.height * PRINT_UNITS);

    canvas.width = px_width;
    canvas.height = px_height;

    const ctx = canvas.getContext('2d');
    try {
      this.backPlane.nowRendering = true;
      const renderContext = {
        canvasContext: ctx,
        transform: [PRINT_UNITS, 0, 0, PRINT_UNITS, 0, 0],
        viewport: page.getViewport({ scale: 1, rotation: viewport.rotation }),
        intent: "print"
      };
      this.renderTask = page.render(renderContext);
      await this.renderTask.promise;
    }
    catch (e) {
      this.backPlane.nowRendering = false;
      this.renderTask = null;
      return {
        result: false,
        px_width: 0,
        px_height: 0,
      }
    }

    if (canvas.width > 0 && canvas.height > 0) {
      const destCanvas = this.backPlane.canvas;
      destCanvas.width = canvas.width;
      destCanvas.height = canvas.height;

      const destCtx = destCanvas.getContext("2d");
      destCtx.drawImage(canvas, 0, 0);
      this.renderTask = null;

      return {
        result: true,
        px_width,
        px_height,
      }
    }

    return { ...this.backPlane.size };
  }

  renderPage = async (page: NeoPdfPage, zoom: number) => {
    if (!this.canvas) return;

    const viewport: any = page.getViewport({ scale: 1 });
    const { width, height } = viewport;
    const canvas = this.canvas;
    const size = { width, height };
    const ret = this.scaleCanvas(canvas, size.width, size.height, zoom);
    const dpi = canvas.width / zoom / size.width * 72;

    if (!this.backPlane.inited) {
      // console.log(`[yyy] DRAWING`)
      const result = await this.renderToCanvasSafe(page, dpi, zoom);
      this.backPlane.inited = result.result;
      this.backPlane.size = { ...result };
    }

    const displaySize = { width, height };
    const { px_width, px_height } = this.backPlane.size;

    const ctx = canvas.getContext('2d');
    const dw = ret.px.width / ret.ratio;
    const dh = ret.px.height / ret.ratio;

    ctx.drawImage(this.backPlane.canvas, 0, 0, px_width, px_height, 0, 0, dw, dh);


    // Lazy update
    if (this.backPlane.prevZoom !== zoom) {
      this.zoomQueue.push(zoom);
      await this.timeOut(200);

      const lastZoom = this.zoomQueue[this.zoomQueue.length - 1];
      this.zoomQueue = this.zoomQueue.splice(1);
      if ((lastZoom && zoom !== lastZoom) || zoom == this.backPlane.prevZoom) {
        return;
      }

      const result = await this.renderToCanvasSafe(page, dpi, zoom);
      if (result.result) {
        this.backPlane.prevZoom = zoom;
        this.backPlane.size = { ...result };

        const { px_width, px_height } = result;
        ctx.drawImage(this.backPlane.canvas, 0, 0, px_width, px_height, 0, 0, dw, dh);

        const renderCount = this.state.renderCount + 1;
        this.zoomQueue = [];
      }
      else {
        // console.log(`lazy back plane CANCELLED`)
      }
    }
    this.setState({ status: 'rendered' });

  }


  render = () => {
    const { status } = this.state;
    const { pdf, index, scale, position, ...rest } = this.props;

    const zoom = this.props.position.zoom;
    const pageCanvas: CSSProperties = {
      position: "absolute",
      zoom: 1,
      left: 0,
      top: 0,
    }
    return (
      <div style={pageCanvas} id={`pdf-page ${status}`} >
        <canvas ref={this.setCanvasRef} />
      </div>
    );
  }
}

export { Page };