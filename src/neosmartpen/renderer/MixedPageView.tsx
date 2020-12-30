import React, { CSSProperties } from "react";
import PenBasedRenderer, { PLAYSTATE } from "./pageviewer/PenBasedRenderer";
import { INcodeSOBPxy, IPageSOBP } from "../DataStructure/Structures";
import { NeoSmartpen } from "../pencomm/neosmartpen";
import { MappingStorage } from "../../NcodePrintLib/SurfaceMapper";
import { TransformParameters } from "../../NcodePrintLib/Coordinates";
import { ZoomFitEnum } from "./pageviewer/RenderWorkerBase";
import { IAutoLoadDocDesc } from "../../NcodePrintLib/SurfaceMapper/MappingStorage";
import NeoPdfDocument from "../../NcodePrintLib/NeoPdf/NeoPdfDocument";
import { hideUIProgressBackdrop, showUIProgressBackdrop } from "../../store/reducers/ui";
import NeoPdfManager from "../../NcodePrintLib/NeoPdf/NeoPdfManager";
import NeoPdfPageView from "./pdf/NeoPdfPageView";
import { withResizeDetector } from 'react-resize-detector';

export const ZINDEX_INK_LAYER = 3;
export const ZINDEX_PDF_LAYER = 2;

export const ZINDEX_DRAWER = 100;
export const ZINDEX_DRAWER_ICON = 11199;


const pdfContainer: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "100%",
  overflow: "visible",
}

const inkContainer: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "100%",
  overflow: "visible",
}




export interface MixedViewProps {
  baseScale?: number;

  pageInfo?: IPageSOBP;

  pdf?: NeoPdfDocument,

  pdfUrl: string;
  filename: string,

  pageNo: number;


  /** pen의 움직임에 따라 view가 update되려면 pen의 배열을 지정한다 */
  pens?: NeoSmartpen[];

  /** ink storage에 stroke가 쌓일 때 view를 update하려면 storage를 지정한다 */
  fromStorage: boolean,

  playState?: PLAYSTATE;
  noInfo?: boolean;

  /** canvas view rotation, 0: portrait, 90: landscape */
  rotation: number;


  /**
   * 현재 view가 가진 코드와 다른 코드가 들어왔을 때
   * 페이지를 자동으로 변경하는 스위치
   *
   * onFileLoadNeeded를 쓰려면 이 스위치가 true여야 한다
   */
  autoPageChange: boolean;
  /**
   * 현재 view가 가진 pdf와 다른 code map된 pdf가 감지되면 아래의 callback이 불려진다.
   * 불려진 콜백을 가진 component에서는 본 클래스의 property 중 pdfUrl 값을 변경해야 한다
   *
   * autoChangePage가 true 인 상태에서만 동작한다
   **/
  onFileLoadNeeded?: (doc: IAutoLoadDocDesc) => void;
  onNcodePageChanged: (pageInfo: IPageSOBP) => void,

  parentName: string;

  viewFit?: ZoomFitEnum;
  fitMargin?: number;

  fixed?: boolean;


  width?: number,
  height?: number,
}


interface State {
  pdfUrl: string;

  pdfSize: { width: number, height: number };

  pdfFilename: string;


  pdf: NeoPdfDocument,
  status: string,

  /** NOTE: pageNo라고 씌어 있는 것은, 항상 PDF의 페이지번호(1부터 시작)를 나타내기로 한다.  */
  pageNo: number;
  viewPos: { offsetX: number, offsetY: number, zoom: number },

  renderCount: number;

  showFileOpenDlg: boolean;
  showCancelConfirmDlg: boolean;

  h: TransformParameters;

  /** property에 width가 주어졌으면 auto resize width를 방지하기 위해, 플래그를 세운다 */
  widthGiven: boolean;
  width: number;
  /** property에 height 주어졌으면 auto resize height를 방지하기 위해, 플래그를 세운다 */
  heightGiven: boolean;
  height: number;


  pageInfoGiven: boolean;
  pageInfo: IPageSOBP;

}

const defaultMixedPageViewProps: MixedViewProps = {
  // properties
  pageInfo: undefined,
  pdf: undefined,
  pdfUrl: undefined,
  filename: undefined,
  pageNo: undefined,
  pens: [],
  playState: PLAYSTATE.live,
  noInfo: false,
  rotation: 0,
  parentName: "",
  viewFit: ZoomFitEnum.FULL,
  fitMargin: 100,
  fixed: false,
  width: undefined,
  height: undefined,
  baseScale: 1,
  fromStorage: false,
  autoPageChange: true,

  onFileLoadNeeded: undefined,
  onNcodePageChanged: undefined,
}


class MixedPageView_module extends React.Component<MixedViewProps, State>  {
  static defaultProps: MixedViewProps = defaultMixedPageViewProps;

  pdf: NeoPdfDocument;
  rendererRef: React.RefObject<typeof PenBasedRenderer> = React.createRef();


  coupledDoc: IAutoLoadDocDesc;

  _fileToLoad: IAutoLoadDocDesc;

  filename: string;

  constructor(props: MixedViewProps) {
    super(props);

    this.state = {
      // 아래는 순수히 이 component의 state
      pdfSize: { width: 595, height: 841 },    // 초기 값이 없으면 zoom 비율을 따질 때 에러를 낸다. 당연히
      status: "N/A",
      viewPos: { offsetX: 0, offsetY: 0, zoom: 1 },
      renderCount: 0,

      showFileOpenDlg: false,
      showCancelConfirmDlg: false,

      h: undefined,
      widthGiven: props.width !== undefined ? true : false,
      heightGiven: props.height !== undefined ? true : false,
      pageInfoGiven: props.pageInfo !== undefined ? true : false,

      // 아래는 property에서 나온 것
      pdf: props.pdf,
      pdfUrl: props.pdfUrl,
      pdfFilename: props.filename,
      pageNo: props.pageNo,

      pageInfo: props.pageInfo !== undefined ? props.pageInfo : { section: -1, owner: -1, book: -1, page: -1 },
      width: props.width !== undefined ? props.width : 0,
      height: props.height !== undefined ? props.height : 0,
    };
  }


  componentDidMount() {
    if (this.props.pdf === undefined) {
      this.loadDocument(this.props.pdfUrl, this.props.filename);
    }
  }

  loadDocument = async (url: string, filename: string) => {
    // const { documentZoom } = this.state;
    if (url === undefined) return;

    // kitty, 나중에는 분리할 것
    showUIProgressBackdrop();
    console.log("*GRIDA DOC*, loadDocument START");
    const loadingTask = NeoPdfManager.getInstance().getDocument({ url, filename, purpose: "MAIN DOCUMENT: to be opend by NeoPdfViewer" });
    this.setState({ status: "loading" });

    const pdf = await loadingTask;
    console.log("*GRIDA DOC*, loadDocument COMPLETED")

    this.onReportPdfInfo(pdf);
    this.setState({ pdf, status: "loaded" });

    hideUIProgressBackdrop();
    // console.log("pdf loaded");
  }


  onViewResized = ({ width, height }) => {
    if (!this.state.widthGiven && !this.state.heightGiven) this.setState({ width, height });
    else if (!this.state.widthGiven) this.setState({ width });
    else if (!this.state.heightGiven) this.setState({ height });
  }

  shouldComponentUpdate(nextProps: MixedViewProps, nextState: State) {
    // diffPropsAndState("GRIDA DOC", this.props, nextProps, this.state, nextState);
    let ret_val = true;


    if (nextProps.width !== this.props.width || nextProps.height !== this.props.height) {
      this.onViewResized({ width: nextProps.width, height: nextProps.height });
      ret_val = true;
    }


    if (nextProps.pdf !== this.props.pdf) {
      this.filename = nextProps.pdf.filename;
      this.setState({ pdf: nextProps.pdf, pdfUrl: nextProps.pdf.url, pdfFilename: nextProps.pdf.filename, status: "loaded" });
      return false;
    }

    if (nextProps.pdfUrl !== this.props.pdfUrl) {
      this.loadDocument(nextProps.pdfUrl, nextProps.filename);
      this.setState({ pdfUrl: nextProps.pdfUrl });
      return false;
    }

    if (nextState.status === "loading") {
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

      ret_val = ret_val || true;
    }
    // console.log("update requested");
    return ret_val;
  }

  componentWillUnmount() {
    if (this.props.pdf ===undefined && this.state.pdf ) {
      const pdf = this.state.pdf;
      pdf.destroy();
    }
  }

  onReportPdfInfo = (pdf: NeoPdfDocument) => {
    this.pdf = pdf;

    // 이미 로드되어 있고 같은 파일이라면, 페이지를 전환한다.
    if (pdf) {
      let pageNo = this.state.pageNo;
      let size = this.pdf.getPageSize(pageNo);
      if (!size) {
        pageNo = 1;
        size = this.pdf.getPageSize(pageNo);
      }

      this.setState({ pageNo, pdfSize: size });
      const newPageInfo = { ...this.state.pageInfo };

      this.setState({ pageInfo: newPageInfo });
    }
  }


  /**
   *
   * @param pageInfo
   * @param isFromEveryPgInfo - 매번 page info가 나올때마다 불려진 것인가? 아니면 페이지가 바뀔때 불려진 것인가?
   */
  onNcodePageChanged = async (pageInfo: IPageSOBP) => {
    if (!this.props.autoPageChange) return;

    // 페이지를 찾자
    const mapper = MappingStorage.getInstance();
    const ncodeXy: INcodeSOBPxy = { ...pageInfo, x: 0, y: 0 };
    this.setState({ pageInfo: { ...pageInfo } });

    // 인쇄된 적이 없는 파일이라면 PDF 관련의 오퍼레이션을 하지 않는다.
    const coupledDoc = mapper.findPdfPage(ncodeXy);
    if (!coupledDoc) {
      if (this.props.onNcodePageChanged) this.props.onNcodePageChanged(pageInfo);
      return;
    }


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

    const pageNo = coupledDoc.pageMapping.pdfDesc.pageNo;
    // 이미 로드되어 있고 같은 파일이라면, 페이지를 전환한다.
    if (!this.pdf) {
      if (this.props.onNcodePageChanged) this.props.onNcodePageChanged(pageInfo);
      return;
    }

    if (pageNo !== this.state.pageNo) {
      const size = this.pdf.getPageSize(pageNo);
      this.setState({ pdfSize: size });
    }

    if (this.pdf.fingerprint === coupledDoc.pdf.fingerprint) {
      if (this.state.pageNo !== pageNo) {
        this.setState({ pageNo });
      }
    }

    if (this.props.onNcodePageChanged) this.props.onNcodePageChanged(pageInfo);
  }


  onCanvasPositionChanged = (arg: { offsetX: number, offsetY: number, zoom: number }) => {
    // console.log(arg);
    this.setState({ viewPos: arg });

    const r = this.state.renderCount;
    this.setState({ renderCount: r + 1 });
  }


  handleClose = () => {
    this.setState({ showFileOpenDlg: false });
  };


  render() {
    const zoom = this.state.viewPos.zoom;


    const pdfCanvas: CSSProperties = {
      position: "absolute",
      zoom: zoom,
      left: this.state.viewPos.offsetX / zoom,
      top: this.state.viewPos.offsetY / zoom,
    }

    // console.log(`MixedViewer: rendering, h=${JSON.stringify(this.state.h)}`);
    // console.log(this.state.viewPos);

    console.log(`THUMB, mixed viewFit = ${this.props.viewFit}`);
    console.log(`PDF PAGE, page number,  = ${this.state.pageNo}`);
    const { pdf } = this.state;


    return (
      <div id={`${this.props.parentName}-mixed_view`} style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        // bottom: 0,
        height: "100%",
        alignItems: "center",
        zIndex: 1,
      }}>
        <div id={`${this.props.parentName}-pdf_layer`} style={pdfContainer} >
          <div id={`${this.props.parentName}-pdf_view`} style={pdfCanvas}>
            {pdf
              ? <NeoPdfPageView {...this.props}
                pageNo={this.state.pageNo}
                pdf={pdf} index={this.state.pageNo}
                key={`document-page-${this.props.pageNo}`}
                position={this.state.viewPos}
              />
              : ""}
          </div>
          {/* <NeoPdfViewer
            url={this.state.pdfUrl}
            filename={this.state.pdfFilename}
            pageNo={this.state.pageNo}
            onReportPdfInfo={this.onReportPdfInfo}
            position={this.state.viewPos}
            parentName={this.props.parentName}
          /> */}
        </div>
        <div id={`${this.props.parentName}-ink_layer`} style={inkContainer} >
          <PenBasedRenderer {...this.props}
            position={this.state.viewPos}
            pdfUrl={this.state.pdfUrl}
            pdfSize={this.state.pdfSize}
            pageInfo={this.state.pageInfo}
            onNcodePageChanged={this.onNcodePageChanged}
            onCanvasPositionChanged={this.onCanvasPositionChanged}
            h={this.state.h}
          />
        </div>

      </div>
    );
  }
}


const AdaptiveWithDetector = withResizeDetector(MixedPageView_module);

const MixedPageView = (props: MixedViewProps) => {
  return (
    <React.Fragment>
      <AdaptiveWithDetector {...props} />
    </React.Fragment>
  )
}

export default MixedPageView;
