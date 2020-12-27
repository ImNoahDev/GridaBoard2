import React, { CSSProperties } from "react";
import PenBasedRenderer, { PLAYSTATE } from "./pageviewer/PenBasedRenderer";
import NeoPdfViewer from "./pdf/NeoPdfViewer";
import { INcodeSOBPxy, IPageSOBP } from "../DataStructure/Structures";
import { NeoSmartpen } from "../pencomm/neosmartpen";
import * as PdfJs from "pdfjs-dist";
import { MappingStorage } from "../../NcodePrintLib/SurfaceMapper";
import { IPageMapItem, IPdfToNcodeMapItem, IPdfPageDesc, TransformParameters } from "../../NcodePrintLib/Coordinates";
import { IFileBrowserReturn, isSameObject, openFileBrowser2 } from "../../NcodePrintLib";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";
import { ZoomFitEnum } from "./pageviewer/RenderWorkerBase";
import { IAutoLoadDocDesc } from "../../NcodePrintLib/SurfaceMapper/MappingStorage";

export const ZINDEX_INK_LAYER = 3;
export const ZINDEX_PDF_LAYER = 2;

export const ZINDEX_DRAWER = 100;
export const ZINDEX_DRAWER_ICON = 11199;



interface Props {
  pageInfo?: IPageSOBP;
  pdfUrl: string;
  filename: string,
  pageNo: number;
  pens: NeoSmartpen[];

  scale: number,
  playState: PLAYSTATE;

  /** canvas view rotation, 0: portrait, 90: landscape */
  rotation: number;


  /** 현재 view가 가진 pdf와 다른 code map된 pdf가 감지되면 autoload를 시도한다. undefiled이면 안한다. */
  onFileLoadNeeded: (doc: IAutoLoadDocDesc) => void;

}

interface State {
  pageInfo: IPageSOBP;
  pdfUrl: string;

  pdfFilename: string;

  /** NOTE: pageNo라고 씌어 있는 것은, 항상 PDF의 페이지번호(1부터 시작)를 나타내기로 한다.  */
  pageNo: number;
  canvasPosition: { offsetX: number, offsetY: number, zoom: number },

  renderCount: number;

  showFileOpenDlg: boolean;
  showCancelConfirmDlg: boolean;

  h: TransformParameters;

}


export default class MixedPageView extends React.Component<Props, State> {

  pdf: PdfJs.PDFDocumentProxy;
  rendererRef: React.RefObject<typeof PenBasedRenderer> = React.createRef();

  filename: string;

  coupledDoc: IAutoLoadDocDesc;

  _fileToLoad: IAutoLoadDocDesc;

  constructor(props: Props) {
    super(props);

    const { pdfUrl, pageNo, filename } = props;
    let pageInfo = props.pageInfo;

    if (!pageInfo) {
      pageInfo = { section: -1, owner: -1, book: -1, page: -1, }
    }

    const canvasPosition = { offsetX: 0, offsetY: 0, zoom: 1 };
    this.state = {
      pdfUrl,
      pdfFilename: filename,
      pageNo,

      pageInfo,

      canvasPosition,
      renderCount: 0,

      showFileOpenDlg: false,
      showCancelConfirmDlg: false,

      h: undefined,
    };
  }

  onReportPdfInfo = (pdf: PdfJs.PDFDocumentProxy) => {
    this.pdf = pdf;

    // 이미 로드되어 있고 같은 파일이라면, 페이지를 전환한다.
    if (this.pdf) {
      const newPageInfo = { ...this.state.pageInfo };
      this.setState({ pageInfo: newPageInfo });
    }
  }


  /**
   * 
   * @param pageInfo 
   * @param isFromEveryPgInfo - 매번 page info가 나올때마다 불려진 것인가? 아니면 페이지가 바뀔때 불려진 것인가?
   */
  onNcodePageChanged = async (pageInfo: IPageSOBP, isFromEveryPgInfo: boolean) => {
    // 페이지를 찾자
    const mapper = MappingStorage.getInstance();
    const ncodeXy: INcodeSOBPxy = { ...pageInfo, x: 0, y: 0 };
    this.setState({ pageInfo: { ...pageInfo } });

    // 인쇄된 적이 없는 파일이라면 PDF 관련의 오퍼레이션을 하지 않는다.
    const coupledDoc = mapper.findPdfPage(ncodeXy);
    if (!coupledDoc) return;
    console.log(coupledDoc.pageMapping);

    console.log(`MixedViewer: pagechanged Set h, h=${JSON.stringify(coupledDoc.pageMapping.h)}`);
    this.setState({ h: coupledDoc.pageMapping.h });

    // 파일을 로드해야 한다면, 로컬이든 클라우드든 로드하도록 한다.
    if (!this.pdf || this.pdf.fingerprint !== coupledDoc.pdf.fingerprint) {
      const { onFileLoadNeeded } = this.props;
      if (onFileLoadNeeded) {
        onFileLoadNeeded(coupledDoc);
      }
    }

    // 이미 로드되어 있고 같은 파일이라면, 페이지를 전환한다.
    if (this.pdf && this.pdf.fingerprint === coupledDoc.pdf.fingerprint) {
      const pageNo = coupledDoc.pageMapping.pdfDesc.pageNo;
      if (this.state.pageNo !== pageNo) this.setState({ pageNo });
    }
  }


  onCanvasShapeChanged = (arg: { offsetX: number, offsetY: number, zoom: number }) => {
    // console.log(arg);
    this.setState({ canvasPosition: arg });

    const r = this.state.renderCount;
    this.setState({ renderCount: r + 1 });
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    let ret = false;

    if (nextProps.pdfUrl !== this.props.pdfUrl) {
      this.setState({ pdfUrl: nextProps.pdfUrl });
      return false;
    }

    if (nextProps.filename !== this.props.filename) {
      this.filename = nextProps.filename;
      return false;
    }

    if (nextState.pageInfo !== this.state.pageInfo) {
      const ncodeXy: INcodeSOBPxy = { ...nextState.pageInfo, x: 0, y: 0 };

      // 인쇄된 적이 없는 파일이라면 PDF 관련의 오퍼레이션을 하지 않는다.
      const mapper = MappingStorage.getInstance();
      const coupledDoc = mapper.findPdfPage(ncodeXy);
      if (coupledDoc) {
        console.log(`MixedViewer: Set h, h=${JSON.stringify(coupledDoc.pageMapping.h)}`);
        this.setState({ h: coupledDoc.pageMapping.h });
      }

      ret = ret || true;
    }
    // console.log("update requested");
    return true;
  }

  handleClose = () => {
    this.setState({ showFileOpenDlg: false });
  };


  render() {
    const pdfCanvas: CSSProperties = {
      position: "absolute",
      // height: "0px",
      // width: "0px",
      // left: this.state.canvasPosition.offsetX + "px",
      // top: this.state.canvasPosition.offsetY + "px",

      top: 0,
      left: 0,
      right: 0,
      bottom: 0,

      // zoom: this.state.canvasPosition.zoom,
      overflow: "visible",
    }

    const inkCanvas: CSSProperties = {
      position: "absolute",
      // height: "100%",
      // width: "100%",
      // left: "0px",
      // top: "0px",

      top: 0,
      left: 0,
      right: 0,
      bottom: 0,

      overflow: "visible",
    }

    // console.log(`MixedViewer: rendering, h=${JSON.stringify(this.state.h)}`);
    // console.log(this.state.canvasPosition);
    return (
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        alignItems: "center",
        zIndex: 1,
      }}>
        <div id={"mixed_view"} style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          alignItems: "center",
          zIndex: 1,
        }}>
          <div id={"pdf_layer"} style={pdfCanvas} >
            <NeoPdfViewer
              url={this.state.pdfUrl}
              filename={this.state.pdfFilename}
              pageNo={this.state.pageNo}
              onReportPdfInfo={this.onReportPdfInfo}
              position={this.state.canvasPosition}
            />
          </div>
          <div id={"ink_layer"} style={inkCanvas} >
            <PenBasedRenderer
              baseScale={1}
              viewFit={ZoomFitEnum.FULL}
              fitMargin={100}
              position={this.state.canvasPosition}
              pdfUrl={this.state.pdfUrl}
              pdfSize={{ width: 210 / 25.4 * 72, height: 297 / 25.4 * 72 }}
              pageInfo={{ section: 0, owner: 0, book: 0, page: 0 }}
              playState={PLAYSTATE.live}
              pens={this.props.pens}
              onNcodePageChanged={this.onNcodePageChanged}
              onCanvasShapeChanged={this.onCanvasShapeChanged}
              rotation={this.props.rotation}
              h={this.state.h}
            />
          </div>

        </div>
      </div>
    );
  }
}
