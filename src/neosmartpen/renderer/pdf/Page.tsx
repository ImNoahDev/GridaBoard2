import React, { Component } from 'react';
import { pdfSizeToDIsplayPixel, pdfSizeToDIsplayPixel_int } from "../../utils/UtilsFunc";

import "pdfjs-dist";
import * as PdfJs from "pdfjs-dist";
import { PDF_DEFAULT_DPI } from '../../constants';

let nowRendering = false;
/**
 * Page.js
 * Component rendering page of PDF
 **/

interface PageProps {
  pdf: PdfJs.PDFDocumentProxy,
  index: number,
  scale?: number,
  position: { offsetX: number, offsetY: number, zoom: number },
}

interface PageState {
  status: string,
  page: PdfJs.PDFPageProxy | null,
  width: number,
  height: number,
  imgSrc: string,
  renderCount: number;

  scratchCanvasStatus: "N/A" | "rendering" | "rendered",
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
  inImageRendering = false;

  isRenderRunning = false;

  renderTask: PdfJs.PDFRenderTask = null;

  backPlaneCanvas: HTMLCanvasElement = document.createElement("canvas");
  scratchCanvas = document.createElement("canvas");

  inited = false;

  _prevZoom = 0;
  area;

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
    const ratio = devicePixelRatio * zoom / backingStoreRatio;

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
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }
        , n);
    })
  }


  shouldComponentUpdate(nextProps: PageProps, nextState: PageState) {
    const zoomChanged = nextProps.position.zoom !== this.props.position.zoom;

    if (zoomChanged) {
      console.log(`ZOOM changed = from ${this.props.position.zoom} to ${nextProps.position.zoom}`)
      this.renderPage(this.state.page, nextProps.position.zoom);
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

  /**
   *
   */
  _update = (pdf: PdfJs.PDFDocumentProxy) => {
    if (pdf) {
      this._loadPage(pdf);
    } else {
      this.setState({ status: 'loading' });
    }
  };

  /**
   *
   * @param page
   * @param zoom
   */
  renderPage = (page: PdfJs.PDFPageProxy, zoom: number) => {
    this._renderPage(page, zoom);

  }

  /**
   *
   */
  _loadPage = (pdf: PdfJs.PDFDocumentProxy) => {
    if (this.state.status === 'rendering') return;

    pdf.getPage(this.props.index).then(
      (page) => {
        this.inited = false;
        this.setState({ page, status: 'rendering' });
        this.renderPage(page, this.props.position.zoom);
      }
    );
  }




  renderToCanvasSafe = async (page: PdfJs.PDFPageProxy, zoom: number) => {
    if (nowRendering && this.renderTask) {
      const renderTask = this.renderTask;
      renderTask.cancel();
      await renderTask;
    }
    return this.renderToCanvas(page, zoom);
  }

  renderToCanvas = async (page: PdfJs.PDFPageProxy, zoom: number) => {
    console.log(`[yyy] renderToCanvas`);

    const canvas = document.createElement("canvas");;

    const PRINT_RESOLUTION = 96 * 1.66667 * zoom;
    const PRINT_UNITS = PRINT_RESOLUTION / PDF_DEFAULT_DPI;
    const viewport: any = page.getViewport({ scale: 1 });

    const px_width = Math.floor(viewport.width * PRINT_UNITS);
    const px_height = Math.floor(viewport.height * PRINT_UNITS);

    canvas.width = px_width;
    canvas.height = px_height;

    const ctx = canvas.getContext('2d');

    // ctx.save();
    // ctx.fillStyle = "rgb(255, 255, 255)";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.restore();
    try {
      const renderContext = {
        canvasContext: ctx,
        transform: [PRINT_UNITS, 0, 0, PRINT_UNITS, 0, 0],
        viewport: page.getViewport({
          scale: 1,
          rotation: viewport.rotation
        }),
        intent: "print"
      };

      this.renderTask = page.render(renderContext);

      await this.renderTask.promise;
    }
    catch (e) {
      console.log(e);
      console.log(`[yyy] canceled ${this.renderTask}`);

      nowRendering = false;
      this.renderTask = null;
      return {
        result: false,
        px_width: 0,
        px_height: 0,
      }
    }

    const dest = this.backPlaneCanvas;
    dest.width = canvas.width;
    dest.height = canvas.height;

    const destCtx = dest.getContext("2d");
    destCtx.drawImage(canvas, 0, 0);
    this.renderTask = null;

    return {
      result: true,
      px_width,
      px_height,
    }
  }


  _renderPage = async (page: PdfJs.PDFPageProxy, zoom: number) => {
    if (!this.inited) {
      console.log(`[yyy] DRAWING`)
      const result = await this.renderToCanvasSafe(page, zoom);
      this.inited = result.result;
      this.area = { ...result };
    }

    // console.log(this.props);
    // let { scale } = this.props;

    // let aa = 2;

    let viewport: any = page.getViewport({ scale: 1 });
    const { width, height } = viewport;
    const canvas = this.canvas;

    const size = { width, height };
    const displaySize = pdfSizeToDIsplayPixel_int(size);
    const new_scale = displaySize.width / viewport.width;

    viewport = page.getViewport({ scale: new_scale });
    // viewport.viewBox[2] = 100;
    const ctx = canvas.getContext('2d');
    const ret = this.scaleCanvas(canvas, displaySize.width, displaySize.height, zoom);
    // console.log(`canvas resized = PX(${ret.px.width}, ${ret.px.height})  CSS(${ret.css.width},${ret.css.height})`)

    const { px_width, px_height } = this.area;
    // console.log(`back plane = (${px_width}, ${px_height})`)

    ctx.drawImage(this.backPlaneCanvas, 0, 0, px_width, px_height, 0, 0, ret.px.width / ret.ratio, ret.px.height / ret.ratio);
    const renderCount = this.state.renderCount + 1;
    this.setState({ status: 'rendered', page, width, height, renderCount });

    if (this._prevZoom !== zoom) {
      console.log("wait!");
      this.zoomQueue.push(zoom);
      await this.timeOut(200);
      console.log(`ZOOM count = ${this.zoomQueue.length}`)
      zoom = this.zoomQueue[this.zoomQueue.length - 1];
      this.zoomQueue.push(zoom);

      const result = await this.renderToCanvasSafe(page, zoom);

      if (result.result) {
        this.area = { ...result };

        const { px_width, px_height } = this.area;
        console.log(`lazy back plane = (${px_width}, ${px_height})`)
        ctx.drawImage(this.backPlaneCanvas, 0, 0, px_width, px_height, 0, 0, ret.px.width / ret.ratio, ret.px.height / ret.ratio);

        const renderCount = this.state.renderCount + 1;
        this.setState({ status: 'rendered', page, width, height, renderCount });

        this.zoomQueue = [];
      }
      else {
        console.log(`lazy back plane CANCELLED`)
      }
    }
  }


  /**
   *
   */
  _renderPage_old = (page: PdfJs.PDFPageProxy) => {
    // return;
    this.inRendering = true;

    console.log(this.props);
    // let { scale } = this.props;

    // let aa = 2;

    let viewport: any = page.getViewport({ scale: 1 });
    const { width, height } = viewport;
    const canvas = this.canvas;

    const size = { width, height };
    const displaySize = pdfSizeToDIsplayPixel(size);
    const new_scale = displaySize.width / viewport.width;

    viewport = page.getViewport({ scale: new_scale });
    // viewport.viewBox[2] = 100;
    const ctx = canvas.getContext('2d');

    // scaleCanvas(canvas, ctx, width, height);
    this.scaleCanvas(canvas, displaySize.width, displaySize.height, this.props.position.zoom);
    console.log(viewport);

    const renderTask = page.render({
      canvasContext: ctx,
      viewport,
      // intent: "print",
    });

    const self = this;
    renderTask.promise.then(() => {
      const renderCount = this.state.renderCount + 1;
      self.setState({ status: 'rendered', page, width, height, renderCount });
      this.inRendering = false;
    });
  }

  render = () => {
    const { status } = this.state;
    // console.log("[yyy] component rendered")
    return (
      <div className={`pdf-page ${status}`} >
        {/* <img src={this.state.imgSrc} /> */}
        <canvas ref={this.setCanvasRef} />
      </div>
    );
  }
}

export { Page };