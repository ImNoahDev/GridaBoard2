import React from "react";
import { Button, } from "@material-ui/core";

import { PrintPdfMain } from "./PrintPdfMain";
import { IPrintingReport, IPrintOption, } from "./PrintDataTypes";

import NeoPdfDocument from "../NeoPdf/NeoPdfDocument";
import NeoPdfManager from "../NeoPdf/NeoPdfManager";
import { PDF_VIEWPORT_DESC } from "../NeoPdf/NeoPdfPage";
import { IPageOverview } from "./PagesForPrint";
import { IPdfMappingDesc } from "../Coordinates";
import { MappingStorage, PdfDocMapper } from "../SurfaceMapper";

import * as Util from "../UtilFunc";
import { diffPropsAndState } from "../UtilFunc";

// PdfJs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PdfJs.version}/pdf.worker.js`;
// var CMAP_URL = "./cmaps/";
// var CMAP_PACKED = true;

export interface IPrintPdfButtonProps {
  /** 인쇄될 문서의 url, printOption.url로 들어간다. */
  url: string,
  filename: string,

  /** 인쇄 준비 상태를 업데이트하는 콜백 함수 */
  reportProgress: (arg: IPrintingReport) => void,

  /** 기본값의 IPrintOption을 받아서, dialog를 처리하고 다시 돌려주는 콜백 함수 */
  printOptionCallback: (arg: IPrintOption) => IPrintOption,

  /** 초기 인쇄 옵션, 다이얼로그가 떠서, 이걸 세팅해도 좋고, printOptionCallback에서 처리해도 좋다 */
  printOption: IPrintOption,

  /** 버튼과 관련된 properties, 상속 받은 것으로 해야하는데... 2020/12/10 */
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
  id?: string;
  variant?: 'text' | 'outlined' | 'contained';
}




interface State {

  /** PDF를 인쇄하기 위해 필요한 것 */
  pdf: NeoPdfDocument,
  printTrigger: number,
  /** 여기까지 */

  /** Sample 코드를 위한 것 */
  numTotalPages: number,

  /** 인쇄 준비된 페이지 수 */
  numPagesPrepared: number,
  /** 인쇄 준비된 종이 장 수 */
  numSheetsPrepared: number,

  /** 세부 단계 */
  completion: number,

  /** 인쇄되는 종이 장 수 */
  numSheetsToPrint: number,
  /** 인쇄 대상 페이지 수 */
  numPagesToPrint: number,

  status: string,
}

/**
 * Class
 */
export default class PrintPdfButton extends React.Component<IPrintPdfButtonProps, State> {
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
    numSheetsToPrint: 0,
    numPagesToPrint: 0,

    status: "ready",
  };

  // numPages: number = 0;

  printOption: IPrintOption = null;


  pagesOverview: IPageOverview[];

  // printStatus = {
  //   /** Sample 코드를 위한 것 */
  //   numTotalPages: 0,

  //   /** 인쇄 준비된 페이지 수 */
  //   numPagesPrepared: 0,
  //   /** 인쇄 준비된 종이 장 수 */
  //   numSheetsPrepared: 0,

  //   /** 세부 단계 */
  //   completion: 0,

  //   /** 인쇄되는 종이 장 수 */
  //   numSheetsToPrint: 0,
  //   /** 인쇄 대상 페이지 수 */
  //   numPagesToPrint: 0,
  // }

  fileInfoBuffer = {
    url: false,
    filename: false,
  }

  constructor(props: IPrintPdfButtonProps) {
    super(props);
    const { printOption } = props;
    if (printOption) this.printOption = { ...printOption };
  }

  componentDidMount() {
    this.loadPdf(this.props.url, this.props.filename);
  }

  shouldComponentUpdate(nextProps: IPrintPdfButtonProps, nextState: State) {
    diffPropsAndState("PrintPdfButton", this, nextProps, nextState);

    let needToCheck = false;
    if (this.props.url !== nextProps.url) {
      this.fileInfoBuffer.url = true;
      needToCheck = true;
    }

    if (this.props.filename !== nextProps.filename) {
      this.fileInfoBuffer.filename = true;
      needToCheck = true;
    }

    if (needToCheck) {
      if (this.fileInfoBuffer.url && this.fileInfoBuffer.filename) {
        this.fileInfoBuffer = {
          url: false,
          filename: false,
        };
        this.loadPdf(nextProps.url, nextProps.filename);
        return true;
      }
      else {
        return false;
      }
    }

    if (this.props.printOption !== nextProps.printOption) {
      this.printOption = { ...nextProps.printOption };

      const { pdf } = this.state;
      const numTotalPages = pdf.numPages;
      this.printOption.targetPages = Array.from({ length: numTotalPages }, (_, i) => i + 1);
      return true;
    }

    return true;
  }


  resetPrintStatus = () => {
    this.setState({
      /** Sample 코드를 위한 것 */
      numTotalPages: 0,

      /** 인쇄 준비된 페이지 수 */
      numPagesPrepared: 0,
      /** 인쇄 준비된 종이 장 수 */
      numSheetsPrepared: 0,

      /** 세부 단계 */
      completion: 0,

      /** 인쇄되는 종이 장 수 */
      numSheetsToPrint: 0,
      /** 인쇄 대상 페이지 수 */
      numPagesToPrint: 0,
    });

    // this.printStatus = {
    //   /** Sample 코드를 위한 것 */
    //   numTotalPages: 0,

    //   /** 인쇄 준비된 페이지 수 */
    //   numPagesPrepared: 0,
    //   /** 인쇄 준비된 종이 장 수 */
    //   numSheetsPrepared: 0,

    //   /** 세부 단계 */
    //   completion: 0,

    //   /** 인쇄되는 종이 장 수 */
    //   numSheetsToPrint: 0,
    //   /** 인쇄 대상 페이지 수 */
    //   numPagesToPrint: 0,
    // };
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

  loadPdf = (url: string, filename: string) => {
    const loadingPromise = NeoPdfManager.getDocument({ url });
    // console.log(`[yyy] `);
    // console.log(`[yyy] LOAIND: ${url}`);
    loadingPromise.then(
      async (pdf) => {
        // console.log(`[yyy] setPageOverview called`);
        this.printOption.url = url;
        this.printOption.filename = filename;

        // 디버깅용 화면 디스플레이를 위해
        const numTotalPages = pdf.numPages;
        console.log(`[NumPage] PDF page: ${url} - ${numTotalPages}`)
        this.printOption.targetPages = Array.from({ length: numTotalPages }, (_, i) => i + 1);
        // 여기까지
        await this.setPageOverview(pdf);


        // this.printStatus = {
        //   ...this.printStatus,
        //   numTotalPages
        // }
        this.setState({ pdf, numTotalPages });
      });

  }


  getPreviousMappingItem = (printOption: IPrintOption) => {
    const { pdf } = this.state;
    const { pagesPerSheet } = printOption;

    const fingerprint = pdf.fingerprint;
    const id = Util.makePdfId({ fingerprint, pagesPerSheet: pagesPerSheet as number });

    const instance = MappingStorage.getInstance();
    const mapped = instance.findNcodeRange(id);

    if (mapped)
      return mapped;

    return undefined;
  }

  setOptionForTest = (printOption: IPrintOption) => {
    // kitty, 2020/11/24
    if (printOption.filename.indexOf("초등학교 4학년 4P.pdf") > -1) {
      /** 그리다 보드와 맞추기 위한 것, for 초등학교 4학년 4P.pdf */
      printOption.magnification = 0.9158249158249159;
      printOption.marginLeft_nu = 1.3;
      printOption.marginTop_nu = -0.5;
      printOption.pageInfo = { section: 3, owner: 27, book: 1068, page: 114 };

      return true;
    }

    return false;
  }

  /**
   * 이 함수를 dialog로 수정함으로써 프린터 옵션을 바꿀 수 있다.
   */
  setPrintOption = (printOption: IPrintOption, pdf: NeoPdfDocument) => {
    /** 코드 할당에 대한 기본 값을 써 주자 */
    const mapped = this.getPreviousMappingItem(printOption);

    /** 코드 할당에 대한 기본값 설정 */
    if (mapped && mapped.nPageStart.section !== -1) {
      const pageInfo = mapped.nPageStart;
      printOption.pageInfo = { ...pageInfo };
      printOption.assignNewCode = false;
    }
    else {
      printOption.assignNewCode = true;
    }

    /** 그리다보드 v1.0에서 만들어진 파일을 데모용으로 썼었다, 그걸 인쇄하기 위한 것 */
    if (this.setOptionForTest(printOption)) {
      printOption.assignNewCode = false;
    }

    /** 기본 값으로는 모든 페이지를 인쇄하도록 */
    const numPages = pdf.numPages;
    this.printOption.targetPages = Array.from({ length: numPages }, (_, i) => i + 1);

    // 1,2 페이지만 인쇄
    // this.printOption.targetPages = Array.from({ length: 2 }, (_, i) => i + 1);
    // this.printOption.debugMode = 0;

    return mapped;
  }

  issueCodeAndSetOption = (printOption: IPrintOption) => {
    const { pdf } = this.state;
    const { targetPages, pagesPerSheet, hasToPutNcode, url, filename } = printOption;

    const option: IPdfMappingDesc = {
      url,
      filename,
      fingerprint: pdf.fingerprint,
      id: Util.makePdfId({ fingerprint: pdf.fingerprint, pagesPerSheet: pagesPerSheet as number }),
      numPages: pdf.numPages,
    }
    const instance = MappingStorage.getInstance();
    const pdfMappingDesc = instance.issueNcode(option);
    printOption.pageInfo = { ...pdfMappingDesc.nPageStart };

    return pdfMappingDesc;
  }

  startPrint = async () => {
    if (!this.state.pdf) return;
    if (this.state.status === "printing") return;

    this.resetPrintStatus();

    /** PrintPdfMain의 printTrigger를 +1 해 주면, 인쇄가 시작된다.*/
    const { printTrigger, pdf } = this.state;
    const pdfMapDesc = this.setPrintOption(this.printOption, this.state.pdf);
    this.printOption.pdfMappingDesc = pdfMapDesc;

    /** dialog를 띄운다든지 하는 callback 함수를 부른다 */
    if (this.props.printOptionCallback) {
      const result = this.props.printOptionCallback(this.printOption);
      if (result) {
        this.printOption = result;
      }
    }

    /** Ncode가 필요하면 코드를 받아 온다, 여기서 받아오는 ncode page 수는 전체 PDF의 페이지 수*/
    const { targetPages, pagesPerSheet, assignNewCode, url, filename } = this.printOption;
    if (assignNewCode) {
      const newPdfMapDesc = this.issueCodeAndSetOption(this.printOption);
      this.printOption.pdfMappingDesc = newPdfMapDesc;
    }


    /** state가 바뀌면, 인쇄를 시작한다. printTrigger에 의해 */
    const numPagesToPrint = targetPages.length;
    const numSheetsToPrint = Math.ceil(numPagesToPrint / pagesPerSheet);

    // this.printStatus = {
    //   ...this.printStatus,
    //   numPagesPrepared: 0,
    //   numSheetsPrepared: 0,
    //   completion: 0,
    //   numSheetsToPrint,
    //   numPagesToPrint,
    // };

    this.setState({
      printTrigger: printTrigger + 1,
      status: "printing",
      numPagesPrepared: 0,
      numSheetsPrepared: 0,
      completion: 0,
      numSheetsToPrint,
      numPagesToPrint,
    });
  }

  updatePrintProgress = (event: IPrintingReport) => {
    const { preparedPages, numSheetsPrepared, completion } = event;
    const numPagesPrepared = preparedPages.length;

    // this.printStatus = {
    //   ...this.printStatus,
    //   numPagesPrepared,
    //   numSheetsPrepared,
    //   completion,
    // };

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

  onAfterPrint = (mapping: PdfDocMapper) => {
    console.log("END OF PRINT");

    /** mapping 정보를 등록 */
    if (this.printOption.assignNewCode) {
      const storage = MappingStorage.getInstance();
      storage.register(mapping);
    }

    // this.mapping.dump("temp mapping");

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
    const filename = this.props.filename;

    return (
      <div className="pdf-context">
        <Button {...this.props} onClick={this.startPrint}>
          {this.props.children}
        </Button>

        { pdf ?
          <PrintPdfMain
            pdf={pdf}
            filename={filename}
            pagesOverview={this.pagesOverview}
            printTrigger={printTrigger}
            printOption={this.printOption}
            onAfterPrint={this.onAfterPrint}
            updatePrintProgress={this.updatePrintProgress} />
          : ""}
        <hr />
      </div>
    );
  }
}


