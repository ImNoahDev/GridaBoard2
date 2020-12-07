import React, { CSSProperties } from "react";
import PenBasedRenderer, { PLAYSTATE } from "./pageviewer/PenBasedRenderer";
import NeoPdfViewer from "./pdf/NeoPdfViewer";
import { IPageSOBP } from "../DataStructure/Structures";
import { NeoSmartpen } from "../pencomm/neosmartpen";
import * as PdfJs from "pdfjs-dist";

interface Props {
  pageInfo?: IPageSOBP;
  pdfUrl: string;
  pageNo: number;
  pens: NeoSmartpen[];

  scale: number,
  playState: PLAYSTATE;
}

interface State {
  pageInfo: IPageSOBP;
  pdfUrl: string;

  /** NOTE: pageNo라고 씌어 있는 것은, 항상 PDF의 페이지번호(1부터 시작)를 나타내기로 한다.  */
  pageNo: number;
  canvasPosition: { offsetX: number, offsetY: number, zoom: number },

  renderCount: number;
}

const tempStyle: CSSProperties = {
  position: "absolute",
  // height: "100%",
  // width: "100%",
  left: "0px",
  top: "0px",
  overflow: "hidden",
}

export default class MixedPageView extends React.Component<Props, State> {
  waitingForFirstStroke: boolean = true;
  pdf: PdfJs.PDFDocumentProxy;
  rendererRef: React.RefObject<PenBasedRenderer> = React.createRef();


  constructor(props: Props) {
    super(props);

    let { pageInfo, pdfUrl, pageNo } = props;

    if (!pageInfo) {
      pageInfo = { section: -1, owner: -1, book: -1, page: -1, }
    }

    const canvasPosition = { offsetX: 0, offsetY: 0, zoom: 1 };
    this.state = { pageInfo, pdfUrl, pageNo, canvasPosition, renderCount: 0 };
  }

  onReportPdfInfo = (pdf: PdfJs.PDFDocumentProxy) => {
    this.pdf = pdf;
  }

  onNcodePageChanged = (pageInfo: IPageSOBP) => {
    if (this.pdf) {
      const numPages = this.pdf.numPages;

      let pageDelta = 0;
      if (this.waitingForFirstStroke) {
        pageDelta = 0;
        this.waitingForFirstStroke = false;
        this.setState({ pageInfo });
      }
      else {
        pageDelta = pageInfo.page - this.state.pageInfo.page;
        pageDelta += numPages;
        pageDelta = pageDelta % numPages;
      }
      this.setState({ pageNo: pageDelta + 1 });

    }
    /** 여기까지 임시 내용 */
  }

  onCanvasShapeChanged = (arg: { offsetX: number, offsetY: number, zoom: number }) => {
    console.log(arg);
    this.setState({ canvasPosition: arg });

    const r = this.state.renderCount;
    this.setState({ renderCount: r + 1 });
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (nextProps.pdfUrl !== this.props.pdfUrl) {
      this.setState({ pdfUrl: nextProps.pdfUrl });
      return false;
    }
    // console.log("update requested");
    return true;
  }

  render() {
    const pdfCanvas: CSSProperties = {
      position: "absolute",
      // height: "100%",
      // width: "100%",
      left: this.state.canvasPosition.offsetX + "px",
      top: this.state.canvasPosition.offsetY + "px",
      // zoom: this.state.canvasPosition.zoom,
      overflow: "hidden",
    }

    // console.log(this.state.canvasPosition);
    return (
      <div id={"mixed_view"} style={{
        // position: "absolute",
        left: "0px", top: "0px",
        flexDirection: "row-reverse", display: "flex",
        width: "100%", height: "100%",
        alignItems: "center",
        zIndex: 1,
      }}>
        <div id={"pdf_layer"} style={pdfCanvas}>
          <NeoPdfViewer
            url={this.state.pdfUrl} pageNo={this.state.pageNo} onReportPdfInfo={this.onReportPdfInfo}
            position={this.state.canvasPosition}
          />
        </div>
        <div id={"ink_layer"} style={tempStyle}>
          <PenBasedRenderer
            scale={1}
            pageInfo={{ section: 0, owner: 0, book: 0, page: 0 }}
            playState={PLAYSTATE.live} pens={this.props.pens}
            onNcodePageChanged={this.onNcodePageChanged}
            onCanvasShapeChanged={this.onCanvasShapeChanged}
            ref={this.rendererRef}
          />
        </div>
      </div>
    );
  }
}
