/// <reference types="pdfjs-dist" />

import React, { CSSProperties } from "react";
// import PropTypes from "prop-types";
import { Page } from './Page';
import * as PdfJs from "pdfjs-dist";

PdfJs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PdfJs.version}/pdf.worker.js`;
// const PDF_URL = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
// const PDF_URL = "./2020학년도 서울대학교 수시모집 일반전형 면접 및 구술고사 문항.pdf";
// const PDF_URL = "https://uploads.codesandbox.io/uploads/user/faa4155a-f802-458d-81ad-90b4709d0cf8/4ETB-10.1.1.324.5566.pdf";
var CMAP_URL = "pdfjs-dist/cmaps/";
var CMAP_PACKED = true;


interface INeoPdfViewerProps {
  url: string,
  pageNo: number,
  onReportPdfInfo: Function,
  position: { offsetX: number, offsetY: number, zoom: number },
}

interface INeoPdfViewerState {
  pdf: PdfJs.PDFDocumentProxy,
  scale: number,
  documentZoom: number,
}

export default class NeoPdfViewer extends React.Component<INeoPdfViewerProps, INeoPdfViewerState> {
  static displayName = "Viewer";
  documentContainer = React.createRef();
  document = React.createRef();
  scroller = React.createRef();

  constructor(Props: INeoPdfViewerProps) {
    super(Props);
    this.state = {
      pdf: null,
      scale: 1.0,
      documentZoom: 1.0,
    };
  }

  componentDidMount() {
    // const { documentZoom } = this.state;

    let loadingTask = PdfJs.getDocument({
      url: this.props.url,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
    }
    );

    let self = this;

    loadingTask.promise.then(
      (pdf: PdfJs.PDFDocumentProxy) => {
        self.props.onReportPdfInfo(pdf);
        console.log(pdf);
        this.setState({ pdf });
      });
  }

  componentWillUnmount() {
    if (this.state.pdf) {
      const pdf = this.state.pdf;
      pdf.destroy();
    }
  }


  render() {
    const { pdf } = this.state;
    console.log("Pdf Viewer Renderer");
    console.log(this.props.position);

    const pdfCanvas: CSSProperties = {
      zoom: this.props.position.zoom,
    }

    if (pdf) {
      return (
        <div className="pdf-viewer" style={pdfCanvas}>
          <Page
            pdf={pdf} index={this.props.pageNo}
            key={`document-page-${this.props.pageNo}`}

            position={this.props.position}
          />
        </div>
      );

    }
    return null;
  }
}


