import React, { Component } from 'react';

import * as PdfJs from 'pdfjs-dist';
import { IPrintingEvent, IPrintOption } from '../PrintDataTypes';
import { IPageOverview } from './PagesForPrint';

import NeoPdfDocument from '../../NeoPdf/NeoPdfDocument';

import * as Util from "../../UtilFunc";
import { SheetRenderer } from '../../NcodeSurface/SheetRenderer';
import { SheetRendererManager } from '../../NcodeSurface/SheetRendererManager';


interface Props {
  /** start from 0 */
  sheetIndex: number,
  pdf: NeoPdfDocument,

  /** null이면 화면 전용 */
  onPagePrepared: (event: IPrintingEvent) => void,

  printOption: IPrintOption,
  pageNums: number[],
  pagesOverview: IPageOverview[],

  name: string,
}


interface State {
  status: string,
  page: PdfJs.PDFPageProxy,
  width: string,
  height: string,

  isLandscape: boolean,
}


/**
 * Class
 */
export class PageForPrint extends Component<Props, State> {
  canvas: HTMLCanvasElement = null;
  // pageImageDescs: IPdfPageCanvasDesc[] = [];
  entireRotation = 0;

  uuid: string;
  state = {
    /** @type {string} */
    status: 'N/A',

    /** @type {} */
    page: null,
    width: "0px",
    height: "0px",
    isLandscape: false,
  };
  constructor(props: Props) {
    super(props);

    this.uuid = Util.uuidv4();
    // this.pageImageDescs = new Array(props.printOption.pagesPerSheet);
  }

  /**
   *
   * @param canvas
   */
  setCanvasRef = (canvas: HTMLCanvasElement) => {
    this.canvas = canvas;
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // let shoudUpdate = true;
    return this.props.pdf !== nextProps.pdf || this.state.status !== nextState.status;
  }

  componentDidUpdate(nextProps: Props, nextState: State) {
    // this._update(nextProps.pdf, nextProps.printOption);

    // console.log("[test updated] CHECK START");
    // for (const [key, value] of Object.entries(nextProps)) {
    //   if (this.props[key] !== value) {
    //     console.log(`[test updated] property[${key}] was changed, from "${this.props[key]} to "${value}"`);
    //   }
    // }

    // for (const [key, value] of Object.entries(nextState)) {
    //   if (this.state[key] !== value) {
    //     console.log(`[test updated] state[${key}] was changed, from "${this.state[key]} to "${value}"`);
    //   }
    // }
    // console.log("[test updated] CHECK END");

    this._update(nextProps.pdf, nextProps.printOption);
  }

  componentDidMount() {
    const { pdf, printOption } = this.props;
    this._update(pdf, printOption);
  }

  /**
   *
   * @param pdf
   */
  _update = (pdf: NeoPdfDocument, printOption: IPrintOption) => {
    if (pdf) {
      this.prepareSheet(pdf, printOption);
    } else {
      this.setState({ status: 'loading' });
    }
  };


  prepareSheet = async (pdf: NeoPdfDocument, printOption: IPrintOption) => {
    if (!this.canvas) return;

    // console.log("[xxx] PageForPrint loadPage");
    const status = this.state.status;
    const { sheetIndex } = this.props;
    if (status === 'rendering' || status === 'rendered' || this.state.page !== null) return;
    this.setState({ status: 'rendering' });

    const pageNums = this.props.pageNums;
    const rendererManager = SheetRendererManager.getInstance();
    const sheetDesc = await rendererManager.getPreparedSheet(pdf, pageNums, printOption, printOption.progressCallback);

    this.canvas.width = sheetDesc.canvasDesc.pixel.width;
    this.canvas.height = sheetDesc.canvasDesc.pixel.height;

    const ctx = this.canvas.getContext("2d");
    ctx.drawImage(sheetDesc.canvas, 0, 0);

    const { width: css_width, height: css_height } = sheetDesc.canvasDesc.css;
    this.setState({ status: 'rendered', width: css_width, height: css_height });

    const ret: IPrintingEvent = { sheetIndex, pageNums, completion: 100, mappingItems: sheetDesc.mappingItems };
    this.reportProgress(ret);
  }

  private reportProgress = (event: IPrintingEvent) => {
    const onPagePrepared = this.props.onPagePrepared;
    if (onPagePrepared) onPagePrepared(event);
  }



  /** imageRendering: "pixelated"가 굉장히 중요 */
  render() {
    const { sheetIndex } = this.props;
    const { width, height, status } = this.state;
    // console.log(`status [${status}],  Page orientation: ${isLandscape ? "LandscapeOrientation" : "PortraitOrientation"}`);
    const style = {
      // width, height,
      // transform: `rotate(${-rotation}deg)`,
      // WebkitTransform: `rotate(${-rotation}deg)`,
      // msTransform: `rotate(${-rotation}deg)`,
    };


    return (
      <div className="pdfSheet" id={`pdf-sheet-${sheetIndex}${this.uuid} ${status}`} style={style} >
        {/* <PortraitOrientation /> */}
        <canvas ref={this.setCanvasRef} style={{ imageRendering: "pixelated", width, height }} />
      </div >
    );
  }
}
