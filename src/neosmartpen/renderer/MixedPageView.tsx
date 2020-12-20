import React, { CSSProperties } from "react";
import PenBasedRenderer, { PLAYSTATE } from "./pageviewer/PenBasedRenderer";
import NeoPdfViewer from "./pdf/NeoPdfViewer";
import { INcodeSOBPxy, IPageSOBP } from "../DataStructure/Structures";
import { NeoSmartpen } from "../pencomm/neosmartpen";
import * as PdfJs from "pdfjs-dist";
import { MappingStorage } from "../../NcodePrintLib/SurfaceMapper";
import { IMappingParams, IPdfMappingDesc, IPdfPageDesc } from "../../NcodePrintLib/Coordinates";
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

  dialogOpen: boolean;

}


export default class MixedPageView extends React.Component<Props, State> {
  waitingForFirstStroke = true;
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
    this.state = { pageInfo, pdfUrl, pdfFilename: filename, pageNo, canvasPosition, renderCount: 0, dialogOpen: false };
  }

  onReportPdfInfo = (pdf: PdfJs.PDFDocumentProxy) => {
    this.pdf = pdf;
  }

  onFileSelect = async () => {
    this.setState({ dialogOpen: false });

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
    const coupledDoc = mapper.findPdfPage(ncodeXy);
    console.log(coupledDoc.page);

    if (coupledDoc) {
      if (!this.coupledDoc || !isSameObject(this.coupledDoc.pdf, coupledDoc.pdf)) {
        this._fileToLoad = coupledDoc;
        this.setState({ dialogOpen: true });

      }
    }

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
    // console.log(arg);
    this.setState({ canvasPosition: arg });

    const r = this.state.renderCount;
    this.setState({ renderCount: r + 1 });
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (nextProps.pdfUrl !== this.props.pdfUrl) {
      this.setState({ pdfUrl: nextProps.pdfUrl });
      return false;
    }

    if (nextProps.filename !== this.props.filename) {
      this.filename = nextProps.filename;
      return false;
    }
    // console.log("update requested");
    return true;
  }

  handleClose = () => {
    this.setState({ dialogOpen: false });
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
            />
          </div>

        </div>
        <Dialog open={this.state.dialogOpen} onClose={this.handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
          <DialogTitle id="alert-dialog-title">
            PDF 파일을 로드
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
      </div>
    );
  }
}
