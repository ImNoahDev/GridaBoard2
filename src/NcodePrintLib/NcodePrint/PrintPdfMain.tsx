import * as React from "react";
import "./print.css";

import { IPageOverview, PagesForPrint } from "./PagesForPrint";
import ReactToPrint from 'react-to-print';
import { IPrintingEvent, IPrintingReport, IPrintOption } from "./PrintDataTypes";
import { getCellMatrixShape } from "../NcodeSurface/SurfaceSplitter";
import PageOrientation, { ForceOverflow, LandscapeOrientation, PortraitOrientation } from "./PageOrientation";
import NeoPdfDocument from "../NeoPdf/NeoPdfDocument";
import { MappingStorage, PdfDocMapper } from "../SurfaceMapper";

import * as Util from "../UtilFunc";

// let globalPagesCnt = 0;
interface Props {
  filename: string,

  pdf: NeoPdfDocument,
  printOption: IPrintOption,
  updatePrintProgress: (event: IPrintingReport) => void,

  /** 숫자가 바뀌면, 프린트한다 */
  printTrigger: number,

  pagesOverview: IPageOverview[],

  /** 인쇄가 끝나고 나면 부를 콜백 */
  onAfterPrint?: (mapping: PdfDocMapper) => void,
}

interface State {
  text: string,
  isLoading: boolean,
  shouldRenderPage: boolean,
  renderingCompleted: boolean,
  shouldPrint: boolean,
  // renderPromise: Promise<any>,
}

/**
 * Class
 */
export class PrintPdfMain extends React.Component<Props, State> {
  componentRef = null;
  printRef: ReactToPrint;
  onAfterPrint: Function;

  title = "";


  renderedSheets: number[];
  renderedPages: number[];

  mapping: PdfDocMapper;
  constructor(props: Props) {
    super(props);

    this.onAfterPrint = props.onAfterPrint;

    this.state = {
      text: "normal",
      isLoading: false,
      shouldRenderPage: true,
      renderingCompleted: false,
      shouldPrint: false,
      // renderPromise: pr,
    };
    this.clearRenderedPagesArray();
  }

  private clearRenderedPagesArray = () => {
    this.renderedSheets = [];
    this.renderedPages = [];
    this.mapping = new PdfDocMapper(this.props.filename, this.props.printOption.pagesPerSheet);
  }

  handleAfterPrint = () => {
    console.log("[PrintPdfMain] onAfterPrint called"); // tslint:disable-line no-console



    this.onAfterPrint(this.mapping);
  }

  handleBeforePrint = () => {
    console.log("[PrintPdfMain] onBeforePrint called"); // tslint:disable-line no-console
    return new Promise((resolve: any) => {
      resolve();
      /** 문서의 제목을 얻어오자 */
      const pdf = this.props.pdf;
      pdf.getMetadata().then(stuff => {
        // console.log(stuff); // Metadata object here
        this.title = stuff.info.title ? stuff.info.title : "";
        resolve();
      });
    });
  }

  handleOnBeforeGetContent = () => {
    console.log("[PrintPdfMain] onBeforeGetContent called"); // tslint:disable-line no-console
    this.clearRenderedPagesArray();

    this.setState({ text: "Loading new text...", isLoading: true, shouldRenderPage: true });
    return new Promise((resolve: any) => { resolve(); });
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    if (this.props.printTrigger !== nextProps.printTrigger) {
      this.clearRenderedPagesArray();
      this.setState({ shouldPrint: true });

      return true;
    }

    if (nextState.shouldPrint) return true;

    if (this.props.pdf !== nextProps.pdf) {
      return true;
    }


    if (this.state.renderingCompleted !== nextState.renderingCompleted) {
      return true;
    }

    if (this.state.text !== nextState.text) {
      return true;
    }


    console.log("[PrintPdfMain] CHECK START props");
    Util.compareObject(this.props, nextProps, "PrintPdfMain");

    console.log("[PrintPdfMain] CHECK START state");
    Util.compareObject(this.state, nextState, "PrintPdfMain");

    return false;
  }

  public OnPagePrepared = (event: IPrintingEvent) => {
    const { sheetIndex, pageNums, completion } = event;
    const { targetPages, pagesPerSheet } = this.props.printOption;


    /** 해당의 sheet 인쇄가 100% 이면 */
    if (completion === 100) {
      /** 임시 매핑 정보를 추가해서 넣는다, afterPrint에서 쓰인다. */
      this.mapping.append(event.mappingItems);

      /** 인쇄된 시트 수와 페이지 번호들을 정리해서 넣는다 */
      if (this.renderedSheets.indexOf(sheetIndex) < 0) {
        this.renderedSheets.push(sheetIndex);
      }
      this.renderedPages.push(...pageNums);
    }
    const numCompleted = Object.keys(this.renderedSheets).length;
    const numSheets = Math.ceil(targetPages.length / pagesPerSheet);

    /**callback을 불러준다 */
    if (this.props.updatePrintProgress) {
      const event: IPrintingReport = {
        status: "progress",
        preparedPages: [...this.renderedPages],
        numPagesPrepared: this.renderedPages.length,
        numSheetsPrepared: numCompleted,
        pageCompletion: completion,
        totalCompletion: (numCompleted / numSheets) * 100,
        printOption: this.props.printOption,
      }
      this.props.updatePrintProgress(event);
    }

    /** 모든 페이지의 렌더링이 끝났는지 확인한다.  */
    const pageNo = targetPages[sheetIndex];

    // const numPages = endPage - startPage + 1;
    console.log(`[PrintPdfMain] Page rendered: ${pageNo} : ${numCompleted}/${numSheets}`);
    if (numCompleted === numSheets) {
      console.log("[PrintPdfMain] Print!!!");
      // console.timeEnd('Function #1');
      this.onPageRenderCompleted();
    }
  }



  setComponentRef = (ref: any) => {
    this.componentRef = ref;
  }

  setPrinttRef = (ref: ReactToPrint) => {
    this.printRef = ref;
  }


  reactToPrintContent = () => {
    return this.componentRef;
  }

  reactToPrintTrigger = () => {
    // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
    // to the root node of the returned component as it will be overwritten.

    // Bad: the `onClick` here will be overwritten by `react-to-print`
    // return <a href="#" onClick={() => alert('This will not work')}>Print this out!</a>;

    // Good
    // return <a href="#">Print using a Class Component</a>;
    // return <a href="#">Print using a Class Component</a>;
    return "";
  }

  getSnapshotBeforeUpdate = (prevProps: Props, prevState: State) => {
    console.log("[PrintPdfMain] getSnapshotBeforeUpdate");

    return null;
  }


  onPageRenderCompleted = () => {
    this.setState({
      text: "completed",
      renderingCompleted: true,
    });
  }


  componentDidUpdate(prevProps: Props, prevState: State) {
    console.log("[PrintPdfMain] componentDidUpdate");

    // if (this.state.renderingCompleted !== prevState.renderingCompleted) {
    if (this.state.renderingCompleted) {
      /** 페이지 렌더링이 끝나고 나면 ReactToPrint Component에 handlePrint를 부른다 */
      this.setState({
        text: "Print start",
        renderingCompleted: false,
      });
      this.startPrintOnRenderCompleted();
    }
  }

  /**
   * 페이지 렌더링이 끝나고 나면 ReactToPrint Component에 handlePrint를 부른다
   */
  startPrintOnRenderCompleted = () => {
    if (this.printRef) {
      const printOption = this.props.printOption;
      if (printOption.progressCallback) {
        printOption.progressCallback({ status: "completed" });
      }

      this.printRef.handlePrint();
      this.setState({
        text: "Print started",
        shouldPrint: false,
      });
    }
  }


  render() {
    const { pdf, printOption, pagesOverview } = this.props;
    const { shouldRenderPage, shouldPrint } = this.state;

    const { pagesPerSheet, direction } = printOption;
    let isLandscape = (direction === "landscape");

    const { rotation } = getCellMatrixShape(pagesPerSheet, direction);
    const isRotationNeeded = rotation === 90;
    if (isRotationNeeded) isLandscape = !isLandscape;

    // globalPagesCnt++;
    // const { startPage, endPage } = printOption;

    return (
      <div>
        { shouldPrint ?
          (
            <div style={{ display: "none" }}>
              <PageOrientation orientation={isLandscape ? "landscape" : "portrait"} />
              {/* { isLandscape ? (<LandscapeOrientation />) : (<PortraitOrientation />)} */}

              <ReactToPrint
                // key={`action-${pdf.fingerprint}-${globalPagesCnt}`}
                ref={this.setPrinttRef}
                content={this.reactToPrintContent}
                documentTitle={this.title}
                onAfterPrint={this.handleAfterPrint}
                onBeforeGetContent={this.handleOnBeforeGetContent}
                onBeforePrint={this.handleBeforePrint}
                removeAfterPrint
              // trigger={this.reactToPrintTrigger}
              />

              {/* <div  style={{ position: "relative", left: "0px", top: "0px", overflow: "visible" }}> */}
              <PagesForPrint text={this.state.text}
                // key={`print-${pdf.fingerprint}-${globalPagesCnt}`}
                ref={this.setComponentRef}
                pdf={pdf}
                pagesOverview={pagesOverview}
                shouldRenderPage={shouldRenderPage}
                OnPagePrepared={this.OnPagePrepared}
                printOption={printOption}
              />
              {/* </div> */}
            </div>
          ) : (<></>)
        }

        { printOption.debugMode > 0 ?
          <div style={{ position: "absolute", left: "0px", top: "1500px", overflow: "visible" }}>
            <ForceOverflow overflow={"visible"} />
            <div style={{ position: "relative", left: "0px", top: "0px", overflow: "visible" }}>
              <PagesForPrint ref={this.setComponentRef} text={this.state.text}
                // key={`screen-${pdf.fingerprint}-${globalPagesCnt}`}
                pdf={pdf}
                pagesOverview={pagesOverview}
                shouldRenderPage={shouldRenderPage}
                OnPagePrepared={null}
                printOption={printOption}
              />
            </div>
          </div>
          : <></>}
      </div>
    );
  }
}
