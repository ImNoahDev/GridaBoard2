import React, { CSSProperties } from "react";
// import PropTypes from "prop-types";
import NeoPdfPageView from './NeoPdfPageView';
// import * as PdfJs from "pdfjs-dist";
import { connect } from 'react-redux';
import { hideUIProgressBackdrop, showUIProgressBackdrop } from "../../../store/reducers/ui";
import NeoPdfDocument from "../../../NcodePrintLib/NeoPdf/NeoPdfDocument";
import NeoPdfManager from "../../../NcodePrintLib/NeoPdf/NeoPdfManager";
import { TransformParameters } from "../../../NcodePrintLib/Coordinates";
import { diffPropsAndState } from "../../../NcodePrintLib/UtilFunc/functions";
import { MixedViewProps } from "../MixedPageView";


interface Props extends MixedViewProps {
  url: string,

  filename: string,

  pageNo: number,
  onReportPdfInfo: Function,
  position: { offsetX: number, offsetY: number, zoom: number },

  progressDlgTitle?: string;

  parentName: string;


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
    console.log("*GRIDA DOC*, loadDocument START");
    // const loadingTask = NeoPdfManager.getDocument({ url, filename, purpose: "MAIN DOCUMENT: to be opend by NeoPdfViewer" });
    const loadingTask = NeoPdfManager.getInstance().getDocument({ url, filename, purpose: "MAIN DOCUMENT: to be opend by NeoPdfViewer" });
    this.setState({ status: "loading" });

    const pdf = await loadingTask;
    console.log("*GRIDA DOC*, loadDocument COMPLETED")

    this.props.onReportPdfInfo(pdf);
    this.setState({ pdf });
    this.setState({ status: "loaded" });

    hideUIProgressBackdrop();
    // console.log("pdf loaded");
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // diffPropsAndState("GRIDA DOC", this.props, nextProps, this.state, nextState);
    if (nextProps.url !== this.props.url) {
      // this.setState({ status: "loading" });
      this.loadDocument(nextProps.url, nextProps.filename);
      return false;
    }

    if (nextState.status === "loading") {
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
      left: this.props.position.offsetX / zoom,
      top: this.props.position.offsetY / zoom,
    }

    if (pdf) {
      return (
        <div id={`${this.props.parentName}-pdf_view`} style={pdfCanvas}>
          <NeoPdfPageView {...this.props}
            pdf={pdf} index={this.props.pageNo}
            key={`document-page-${this.props.pageNo}`}
            position={this.props.position}
          />
        </div>
      );
    }
    return (
      <React.Fragment>
        {this.props.filename}
      </React.Fragment>
    )
  }
}





const mapStateToProps = (state) => ({
  progressDlgTitle: state.progress.title,
});

export default connect(mapStateToProps)(NeoPdfViewer);

