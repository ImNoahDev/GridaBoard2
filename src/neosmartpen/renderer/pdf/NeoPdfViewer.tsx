/// <reference types="pdfjs-dist" />

import React from "react";
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


    loadingTask.promise.then(
      (pdf: PdfJs.PDFDocumentProxy) => {
        console.log(pdf);
        this.setState({ pdf });
      });
  }


  render() {
    const {  pdf } = this.state;

    if (pdf) {
      return (
        <div className="pdf-viewer">
          <Page pdf={pdf} index={this.props.pageNo} key={`document-page-${this.props.pageNo}`}
            {...this.props}
          />
        </div>
      );

    }
    return null;
  }
}


