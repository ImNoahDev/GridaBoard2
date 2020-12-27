import React, { CSSProperties } from "react";
// import PropTypes from "prop-types";
import { Page } from './Page';
// import * as PdfJs from "pdfjs-dist";
import { connect } from 'react-redux';
import { hideUIProgressBackdrop, showUIProgressBackdrop } from "../../../store/reducers/ui";
import NeoPdfDocument from "../../../NcodePrintLib/NeoPdf/NeoPdfDocument";
import NeoPdfManager from "../../../NcodePrintLib/NeoPdf/NeoPdfManager";
import { TransformParameters } from "../../../NcodePrintLib/Coordinates";


// PdfJs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PdfJs.version}/pdf.worker.js`;
// const CMAP_URL = "./cmaps/";
// const CMAP_PACKED = true;

interface Props {
  url: string,

  filename: string,

  pageNo: number,
  onReportPdfInfo: Function,
  position: { offsetX: number, offsetY: number, zoom: number },

  progressDlgTitle?: string;


}

interface State {
  // pdf: PdfJs.PDFDocumentProxy,
  pdf: NeoPdfDocument,

  scale: number,
  documentZoom: number,
  status: string,
}

class NeoPdfViewer extends React.Component<Props, State> {
  static displayName = "Viewer";
  documentContainer = React.createRef();
  document = React.createRef();
  scroller = React.createRef();

  constructor(Props: Props) {
    super(Props);
    this.state = {
      pdf: null,
      scale: 1.0,
      documentZoom: 1.0,
      status: "N/A",
    };
  }

  componentDidMount() {
    this.loadDocument(this.props.url, this.props.filename);
  }

  loadDocument = async (url: string, filename: string) => {
    // const { documentZoom } = this.state;
    if (url === undefined) return;

    // kitty, 나중에는 분리할 것
    showUIProgressBackdrop();
    const loadingTask = NeoPdfManager.getInstance().getDocument({ url, filename });

    const self = this;
    this.setState({ status: "loading" });
    const pdf = await loadingTask;

    this.props.onReportPdfInfo(pdf);
    this.setState({ pdf });
    this.setState({ status: "loaded" });

    hideUIProgressBackdrop();
    // console.log("pdf loaded");
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (nextProps.url !== this.props.url) {
      this.setState({ status: "loading" });
      this.loadDocument(nextProps.url, nextProps.filename);
      return false;
    }
    return true;
  }

  componentWillUnmount() {
    if (this.state.pdf) {
      const pdf = this.state.pdf;
      pdf.destroy();
    }
  }


  render() {
    const { pdf } = this.state;
    // console.log("Pdf Viewer Renderer");
// console.log(this.props.position);


    const zoom = this.props.position.zoom;
    const pdfCanvas: CSSProperties = {
      position: "absolute",
      zoom: zoom,
      left: this.props.position.offsetX/zoom,
      top:this.props.position.offsetY/zoom,
    }

    if (pdf) {
      return (
        <div id="pdf-viewer" style={pdfCanvas}>
          <Page
            pdf={pdf} index={this.props.pageNo}
            key={`document-page-${this.props.pageNo}`}
            style={pdfCanvas}
            position={this.props.position}
          />
        </div>
      );

    }
    return null;
  }
}





const mapStateToProps = (state) => ({
  progressDlgTitle: state.progress.title,
});

export default connect(mapStateToProps)(NeoPdfViewer);

