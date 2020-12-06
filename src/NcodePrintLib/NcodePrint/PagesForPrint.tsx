import React from "react";

import { PageForPrint } from "./PageForPrint";
import "./print.css";

import { ISize } from "../DataStructure/Structures";
import { IPrintOption } from "./PrintDataTypes";
import NeoPdfDocument from "../NeoPdf/NeoPdfDocument";
import { PDF_VIEWPORT_DESC } from "../NeoPdf/NeoPdfPage";

interface Props { // tslint:disable-line interface-over-type-literal
  text: string,
  pdf: NeoPdfDocument,
  shouldRenderPage: boolean,
  /** null이면 화면 전용 */
  OnPagePrepared: Function,

  printOption: IPrintOption,

  pagesOverview: IPageOverview[],

};

type State = {
  renderState: string,
};

export type IPageOverview = {
  rotation: number,

  /** pdf의 viewport가 rotation 0일 때의 크기로 판단(rotation은 고려하지 않음) */
  landscape: boolean,

  /** pdf의 viewport의 rotation은 고려하지 않음, 각 페이지에서 rotation된 것으로 rendering */
  sizePu: ISize,
}

export class PagesForPrint extends React.Component<Props, State> {

  printOption: IPrintOption = null;


  constructor(props: Props) {
    super(props);

    this.printOption = this.props.printOption;
    this.state = {
      renderState: "rendering",
    };
    // console.time('Function #1');
  }

  setPageOverview_old = async (pdf) => {
    this.setState({
      renderState: "ready",
    });
  }

  componentDidMount() {
    if (this.props.pdf) {
      this.setPageOverview_old(this.props.pdf);
    }
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {

    if (this.state.renderState !== "ready" && nextState.renderState === "ready") {
      return true;
    }

    if (this.props.pdf !== nextProps.pdf) {
      console.log(`[yyy] setPageOverview_old called`);
      this.setPageOverview_old(nextProps.pdf);
      return true;
    }


    return false;
  }

  componentDidUpdate(nextProps, nextState) {
    // console.log("[xxx] PagesForPrint componentDidUpdate");
  }

  public render() {
    const { renderState } = this.state;
    const { pdf, OnPagePrepared, pagesOverview } = this.props;

    const printOption = this.printOption;
    const { pagesPerSheet, targetPages, } = printOption;

    const numPages = targetPages.length;
    const numSheets = Math.ceil(numPages / pagesPerSheet);
    const pageNumsInSheet: number[][] = new Array(numSheets);


    for (let i = 0; i < numSheets; i++) {
      pageNumsInSheet[i] = new Array(0);

      for (let j = 0; j < pagesPerSheet && (i * pagesPerSheet + j) < numPages; j++) {
        const pageNo = targetPages[i * pagesPerSheet + j];
        pageNumsInSheet[i].push(pageNo);
      }
    }


    return (
      // <div className="relativeCSS">
      <div>
        {renderState === "ready" ? pageNumsInSheet.map(
          (v, i) => {
            // console.log(`Page displaying ${i}`);
            return (
              <div>
                {/* { isLandscape ? (<LandscapeOrientation />) : (<PortraitOrientation />)} */}
                { console.log(`[key] page-${pdf.fingerprint}-${i}`)}

                <PageForPrint
                  pdf={pdf}
                  sheetIndex={i}
                  key={`page-${pdf.fingerprint}-${i}`}
                  name={`page-${pdf.fingerprint}-${i}`}
                  OnPagePrepared={OnPagePrepared}
                  printOption={printOption}
                  pageNums={pageNumsInSheet[i]}
                  pagesOverview={pagesOverview}
                />
              </div>
            )
          }
        ) : <></>}
      </div>
    );
  }

}
