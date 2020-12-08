import React from "react";
import { Button, } from "@material-ui/core";

import { PrintPdfMain } from "./PrintPdfMain";
import { IPrintingReport, IPrintOption, } from "./PrintDataTypes";

import NeoPdfDocument from "../NeoPdf/NeoPdfDocument";
import NeoPdfManager from "../NeoPdf/NeoPdfManager";
import { PDF_VIEWPORT_DESC } from "../NeoPdf/NeoPdfPage";
import { IPageOverview } from "./PagesForPrint";

// PdfJs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PdfJs.version}/pdf.worker.js`;
// var CMAP_URL = "./cmaps/";
// var CMAP_PACKED = true;

type Props = {
  url: string,
  reportProgress: (arg: IPrintingReport) => void,
  printOption: IPrintOption,

  children?: React.ReactNode;
  color?: any;
  disabled?: boolean;
  disableElevation?: boolean;
  disableFocusRipple?: boolean;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
  size?: 'small' | 'medium' | 'large';
  startIcon?: React.ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
}




interface State {

  /** PDF를 인쇄하기 위해 필요한 것 */
  pdf: NeoPdfDocument,
  printTrigger: number,
  /** 여기까지 */

  /** Sample 코드를 위한 것 */
  numTotalPages: number,
  /**
   * printingStatus
   */
  /** 인쇄 준비된 페이지 수 */
  numPagesPrepared: number,
  /** 인쇄 준비된 종이 장 수 */
  numSheetsPrepared: number,

  /** 세부 단계 */
  completion: number,

  /** 인쇄되는 종이 장 수 */
  numSheets: number,
  /** 인쇄 대상 페이지 수 */
  numPages: number,

  status: string,
}

/**
 * Class
 */
export default class PrintPdfButton extends React.Component<Props, State> {
  // static displayName = "WholePageViewer";

  // static defaultProps = {
  //   initialScrollOffset: 0
  // };

  state: State = {
    /** PDF를 인쇄하기 위해 필요한 것 */
    pdf: null,
    // scale: 1.0,
    printTrigger: 0,

    /** Sample 코드를 위한 것 */
    numTotalPages: 0,

    numPagesPrepared: 0,
    numSheetsPrepared: 0,
    completion: 0,
    numSheets: 0,
    numPages: 0,

    status: "ready",
  };

  // numPages: number = 0;

  printOption: IPrintOption = null;


  pagesOverview: IPageOverview[];


  constructor(props: Props) {
    super(props);
    const { printOption } = props;
    if (printOption) this.printOption = { ...printOption };
  }

  componentDidMount() {
    this.loadPdf(this.props.url);
  }

  shouldComponentUpdate(nextProps: Props) {
    if (this.props.url !== nextProps.url) {
      this.loadPdf(nextProps.url);
      return true;
    }

    return true;
  }


  /**
   * NeoPdfDocument에 있는 setPageOverview의 결과를 쓰도록 하자
   * 2020/12/06
   */
  setPageOverview = async (pdf) => {
    // const pdf = this.props.pdf;
    this.pagesOverview = new Array(pdf.numPages + 1);
    // const { pagesPerSheet } = this.printOption;

    let numPortraitPages = 0;
    let numLandscapePages = 0;

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPageAsync(i + 1);
      const vpt: PDF_VIEWPORT_DESC = page.getViewport({ scale: 1, rotation: 0 });
      const { width, height } = vpt;

      const landscape = width > height;
      landscape ? numLandscapePages++ : numPortraitPages++;

      const pageOverview = {
        rotation: vpt.rotation,
        landscape,
        sizePu: { width, height },
      }
      this.pagesOverview[i] = pageOverview;
    }

    const printOption = this.printOption;

    if (numPortraitPages >= numLandscapePages) {
      printOption.direction = "portrait";
    } else {
      printOption.direction = "landscape";
    }

    console.log(`[yyy] setPageOverview - ${printOption.direction}`);
  }

  loadPdf = (url) => {

    const loadingPromise = NeoPdfManager.getDocument({ url });
    // console.log(`[yyy] `);
    // console.log(`[yyy] LOAIND: ${url}`);
    loadingPromise.then(
      async (pdf) => {
        // console.log(`[yyy] setPageOverview called`);

        await this.setPageOverview(pdf);

        // 디버깅용 화면 디스플레이를 위해
        const numTotalPages = pdf.numPages;
        console.log(`[NumPage] PDF page: ${url} - ${numTotalPages}`)
        this.printOption.targetPages = Array.from({ length: numTotalPages }, (_, i) => i + 1);
        // 여기까지

        this.setState({ pdf, numTotalPages });
      });

  }

  /**
   * 이 함수를 dialog로 수정함으로써 프린터 옵션을 바꿀 수 있다.
   */
  setPrintOption = (pdf: NeoPdfDocument) => {
    const numPages = pdf.numPages;

    // kitty, 2020/11/24
    if (this.props.url === "./Portrait, 초등학교 4학년 4P.pdf") {
      /** 그리다 보드와 맞추기 위한 것, for 초등학교 4학년 4P.pdf */
      this.printOption.magnification = 0.9158249158249159;
      this.printOption.marginLeft_nu = 1.3;
      this.printOption.marginTop_nu = -0.5;
    }

    if (this.printOption.targetPages.length < 1) {
      // 모든 페이지를 인쇄
      this.printOption.targetPages = Array.from({ length: numPages }, (_, i) => i + 1);
    }

    // 1,2 페이지만 인쇄
    // this.printOption.targetPages = Array.from({ length: 2 }, (_, i) => i + 1);

    // this.printOption.debugMode = 0;
  }

  startPrint = () => {
    if (!this.state.pdf) return;
    if (this.state.status === "printing") return;

    /** PrintPdfMain의 printTrigger를 +1 해 주면, 인쇄가 시작된다.*/
    const { printTrigger } = this.state;

    this.setPrintOption(this.state.pdf);
    const { targetPages, pagesPerSheet } = this.printOption;

    const numSheets = Math.ceil(targetPages.length / pagesPerSheet);
    const numPages = targetPages.length;

    this.setState({
      printTrigger: printTrigger + 1,

      numPagesPrepared: 0,
      numSheetsPrepared: 0,
      completion: 0,
      numSheets,
      numPages,
      status: "printing",
    });
  }

  updatePrintProgress = (event: IPrintingReport) => {
    const { preparedPages, numSheetsPrepared, completion } = event;
    const numPagesPrepared = preparedPages.length;

    this.setState({
      numPagesPrepared,
      numSheetsPrepared,
      completion,
    });

    if (this.props.reportProgress) {
      this.props.reportProgress({
        status: "progress",
        preparedPages,
        numPagesToPrint: this.printOption.targetPages.length,
        numPagesPrepared,
        numSheetsPrepared,
        completion,
      })
    }
  }

  onAfterPrint = () => {
    console.log("END OF PRINT");

    this.setState({
      status: "completed",
    });

    if (this.props.reportProgress) {
      this.props.reportProgress({
        status: "completed",
        completion: 100,
      })
    }
  }


  render() {
    const { pdf, printTrigger } = this.state;
    const printOption = this.printOption;

    return (
      <div className="pdf-context">
        <Button {...this.props} onClick={this.startPrint}>
          {this.props.children}
        </Button>

        { pdf ?
          <PrintPdfMain
            pdf={pdf}
            pagesOverview={this.pagesOverview}
            printTrigger={printTrigger}
            printOption={printOption}
            onAfterPrint={this.onAfterPrint}
            updatePrintProgress={this.updatePrintProgress} />
          : ""}
        <hr />
      </div>
    );
  }
}


