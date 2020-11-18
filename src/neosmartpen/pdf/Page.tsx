/// <reference types="pdfjs-dist" />

import React, { Component } from 'react';
import { pdfSizeToDIsplayPixel } from "../";

import "pdfjs-dist";
import * as PdfJs from "pdfjs-dist";

/**
 *
 */
function scaleCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
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
  const ratio = devicePixelRatio / backingStoreRatio;

  if (devicePixelRatio !== backingStoreRatio) {
    // set the 'real' canvas size to the higher width/height
    canvas.width = width * ratio;
    canvas.height = height * ratio;

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
}


/**
 * Page.js
 * Component rendering page of PDF
 **/

interface PageState {
  status: string,
  page: PdfJs.PDFPageProxy | null,
  width: number,
  height: number,
}

interface PageProps {
  pdf?: PdfJs.PDFDocumentProxy,
  index?: number,
  scale?: number,
}

class Page extends Component<PageProps> {
  state: PageState = {
    status: 'N/A',
    page: null,
    width: 0,
    height: 0
  };

  canvas: HTMLCanvasElement | null = null;

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return this.props.pdf !== nextProps.pdf || this.state.status !== nextState.status;
  }

  componentDidUpdate(nextProps: any) {
    this._update(nextProps.pdf);
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
   */
  _loadPage(pdf: PdfJs.PDFDocumentProxy) {
    if (this.state.status === 'rendering' || this.state.page !== null) return;

    pdf.getPage(this.props.index).then(
      (page) => {
        this.setState({ status: 'rendering' });
        this._renderPage(page);
      }
    );
  }

  /**
   *
   */
  _renderPage(page: PdfJs.PDFPageProxy) {
    console.log(this.props);
    let { scale } = this.props;

    let aa = 2;

    let viewport: any = page.getViewport({ scale: 1 });
    let { width, height } = viewport;
    let canvas = this.canvas;

    let size = { width, height };
    const displaySize = pdfSizeToDIsplayPixel(size);
    const new_scale = displaySize.width / viewport.width;

    viewport = page.getViewport({ scale: new_scale });

    let ctx = canvas.getContext('2d');

    // scaleCanvas(canvas, ctx, width, height);
    scaleCanvas(canvas, displaySize.width, displaySize.height);
    console.log(viewport);

    let renderTask = page.render({
      canvasContext: ctx,
      viewport,
      // intent: "print",
    });

    let self = this;
    renderTask.promise.then(() => {
      self.setState({ status: 'rendered', page, width, height });
    });
  }

  render() {
    let { width, height, status } = this.state;

    return (
      <div className={`pdf-page ${status}`} style={{ width, height }}>
        <canvas ref={this.setCanvasRef} />
      </div>
    );
  }
}

export { Page };