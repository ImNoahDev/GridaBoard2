/// <reference types="pdfjs-dist" />

import React from "react";
// import ReactDOM from "react-dom";
import PropTypes from "prop-types";
// import * as PdfJs from "pdfjs-dist";
// import { FixedSizeList as Document } from "react-window";

import { Viewer } from './Viewer';
// import { PDFDocumentProxy } from "pdfjs-dist";
import * as PdfJs from "pdfjs-dist";

// import "@types/pdfjs-dist/index.d.ts";

// export var PdfJs = require("pdfjs-dist");
// import PdfJs from "pdfjs-dist";

PdfJs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PdfJs.version}/pdf.worker.js`;
// const PDF_URL = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
const PDF_URL = "./2020학년도 서울대학교 수시모집 일반전형 면접 및 구술고사 문항.pdf";
// const PDF_URL = "https://uploads.codesandbox.io/uploads/user/faa4155a-f802-458d-81ad-90b4709d0cf8/4ETB-10.1.1.324.5566.pdf";
var CMAP_URL = "pdfjs-dist/cmaps/";
var CMAP_PACKED = true;

interface PdfViewerState {
  pdf: PdfJs.PDFDocumentProxy | null,
  scale: number,
  documentZoom: number,
}

export default class NeoPdfViewer extends React.Component {
  static displayName = "Viewer";

  static propTypes = {
    initialScrollOffset: PropTypes.number
  };

  static defaultProps = {
    initialScrollOffset: 0
  };

  state: PdfViewerState = {
    pdf: null,
    scale: 1.0,
    documentZoom: 1.0,
  };

  documentContainer = React.createRef();
  document = React.createRef();
  scroller = React.createRef();

  componentDidMount() {
    const { documentZoom } = this.state;

    let loadingTask = PdfJs.getDocument({
      url: PDF_URL,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
    }
    );


    loadingTask.promise.then(
      (pdf: PdfJs.PDFDocumentProxy) => {
        console.log(pdf);
        this.setState({ pdf });
      });
  }


  render() {
    const { pdf, scale } = this.state;
    return (
      <div className="pdf-context">
        <Viewer pdf={pdf} scale={scale} />
      </div>
    );
  }
}


