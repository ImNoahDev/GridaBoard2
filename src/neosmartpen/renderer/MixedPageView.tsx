import React, { CSSProperties } from "react";
import PenBasedRenderer, { PLAYSTATE } from "./pageviewer/PenBasedRenderer";
import NeoPdfViewer from "./pdf/NeoPdfViewer";
import { INcodeSOBPxy, IPageSOBP } from "../DataStructure/Structures";
import { NeoSmartpen } from "../pencomm/neosmartpen";
import * as PdfJs from "pdfjs-dist";
import { MappingStorage } from "../../NcodePrintLib/SurfaceMapper";
import { IMappingParams, IPdfMappingDesc, IPdfPageDesc, TransformParameters } from "../../NcodePrintLib/Coordinates";
import { IFileBrowserReturn, isSameObject, openFileBrowser2 } from "../../NcodePrintLib";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@material-ui/core";

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
  rendererRef: React.RefObject<PenBasedRenderer> = React.createRef();

  filename: string;

  coupledDoc: { pdf: IPdfMappingDesc, page: IMappingParams };

  _fileToLoad: { pdf: IPdfMappingDesc, page: IMappingParams };

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

  onFileSelect = async () => {
    this.setState({ showFileOpenDlg: false });

    const coupledDoc = this._fileToLoad;

    let url = coupledDoc.pdf.url;
    if (url.indexOf("blob:http") > -1) {
      console.log(`try to load file: ${coupledDoc.pdf.filename}`);

      // 여기서 펜 입력은 버퍼링해야 한다.
      const selectedFile = await openFileBrowser2();
      console.log(selectedFile.result);

      if (selectedFile.result === "success") {
        url = selectedFile.url;
        const filename = selectedFile.file.name;
        console.log(url);

        this.setState({ pdfUrl: url, pdfFilename: filename });
        this.coupledDoc = coupledDoc;

        const retVal: IFileBrowserReturn = {
          result: "success",
          url,
          fileDesc: selectedFile.file,
        }
      } else {
        // reset homography
        const h = undefined;
        console.log(`MixedViewer: pagechanged Set h, h=${JSON.stringify(h)}`);
        this.setState({ h });

        const retVal: IFileBrowserReturn = {
          result: "canceled",
          url: null,
          fileDesc: null,
        }
      }
    }
  }

  onNcodePageChanged = (pageInfo: IPageSOBP) => {
    // 페이지를 찾자
    const mapper = MappingStorage.getInstance();
    const ncodeXy: INcodeSOBPxy = { ...pageInfo, x: 0, y: 0 };
    this.setState({ pageInfo: { ...pageInfo } });

    // 인쇄된 적이 없는 파일이라면 PDF 관련의 오퍼레이션을 하지 않는다.
    const coupledDoc = mapper.findPdfPage(ncodeXy);
    console.log(coupledDoc.page);
    if (!coupledDoc) return;

    console.log(`MixedViewer: pagechanged Set h, h=${JSON.stringify(coupledDoc.page.h)}`);
    this.setState({ h: coupledDoc.page.h });

    // 파일을 로드해야 한다면, 로컬이든 클라우드든 로드하도록 한다.
    if (!this.pdf || this.pdf.fingerprint !== coupledDoc.pdf.fingerprint) {
      const url = coupledDoc.pdf.url;
      if (url.indexOf("blob:http") > -1) {
        this._fileToLoad = coupledDoc;
        this.setState({ showFileOpenDlg: true });
      }
      else {
        // 구글 드라이브에서 파일을 불러오자
      }

      return;
    }


    // 이미 로드되어 있고 같은 파일이라면, 페이지를 전환한다.
    if (this.pdf) {
      const pageNo = coupledDoc.page.pdfDesc.pageNo;
      this.setState({ pageNo });
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
        console.log(`MixedViewer: Set h, h=${JSON.stringify(coupledDoc.page.h)}`);
        this.setState({ h: coupledDoc.page.h });
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
      height: "0px",
      width: "0px",
      left: this.state.canvasPosition.offsetX + "px",
      top: this.state.canvasPosition.offsetY + "px",
      // zoom: this.state.canvasPosition.zoom,
      overflow: "visible",
    }

    const inkCanvas: CSSProperties = {
      position: "absolute",
      height: "100%",
      width: "100%",
      left: "0px",
      top: "0px",
      overflow: "visible",
    }

    console.log(`MixedViewer: rendering, h=${JSON.stringify(this.state.h)}`);
    // console.log(this.state.canvasPosition);
    return (
      <div>
        <div id={"mixed_view"} style={{
          position: "absolute",
          left: "0px", top: "0px",
          // flexDirection: "row-reverse", display: "flex",
          width: "100%", height: "100%",
          alignItems: "center",
          zIndex: 1,
        }}>
          <div id={"pdf_layer"} style={pdfCanvas} >
            <NeoPdfViewer
              url={this.state.pdfUrl}
              filename={this.state.pdfFilename}
              pageNo={this.state.pageNo} onReportPdfInfo={this.onReportPdfInfo}
              position={this.state.canvasPosition}
            />
          </div>
          <div id={"ink_layer"} style={inkCanvas}>
            <PenBasedRenderer
              scale={1}
              pageInfo={{ section: 0, owner: 0, book: 0, page: 0 }}
              playState={PLAYSTATE.live} pens={this.props.pens}
              onNcodePageChanged={this.onNcodePageChanged}
              onCanvasShapeChanged={this.onCanvasShapeChanged}
              ref={this.rendererRef}
              rotation={this.props.rotation}
              h={this.state.h}
            />
          </div>

        </div>
        <Dialog open={this.state.showFileOpenDlg} onClose={this.handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
          <DialogTitle id="alert-dialog-title">
            파일 불러오기
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              이전에 인쇄되었던 파일입니다. 파일을 로드하면 인쇄된 배경이 화면에도 그대로 나타납니다.
              파일을 로드하시겠습니까?
          </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" >
              아니오, 빈화면에 쓰겠습니다.
          </Button>
            <Button onClick={this.onFileSelect} color="primary" autoFocus>
              예, 선택합니다.
          </Button>
          </DialogActions>
        </Dialog>


        <Dialog open={this.state.showCancelConfirmDlg} onClose={this.handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
          <DialogTitle id="alert-dialog-title">
            파일 불러오기를 취소
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              선택한 파일을 이전에 인쇄했던 파일과 다른 파일입니다. 다시 한번 파일을 선택하고 로드하겠습니까?
          </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" >
              아니오, 빈화면에 쓰겠습니다.
          </Button>
            <Button onClick={this.onFileSelect} color="primary" autoFocus>
              예, 다시 한번 선택합니다.
          </Button>
          </DialogActions>
        </Dialog>

      </div>
    );
  }
}
