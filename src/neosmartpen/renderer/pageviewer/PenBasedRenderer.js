import React from "react";
// import React, { Component } from 'react';
import PropTypes from "prop-types";
import { InkStorage, PenEventName } from "../..";

import PenBasedRenderWorker, { ZoomFitEnum } from "./PenBasedRenderWorker";
import { Paper } from "@material-ui/core";
import { NeoSmartpen, PenManager } from "../../index";
import { uuidv4 } from "../../utils/UtilsFunc";


/**
 * TO DO: 2020/11/05
 *    1)  Pen에서 Event를 받아 실시간 rendering만 하는 component로 만들것
 *
 */
class PenBasedRenderer extends React.Component {

  state = {
    /** @type {PenBasedRenderWorker} */
    renderer: null,
    pageId: "",

    // rect: {
    //   x: 0,
    //   y: 0,
    //   width: 88.58 * 8 / 600 * 72,
    //   height: 125.28 * 8 / 600 * 72,
    // },
    sizeUpdate: 0,

    penEventCount: 0,
    strokeCount: 0,
    liveDotCount: 0,

    pageInfo: {
      section: -1,
      owner: -1,
      book: -1,
      page: -1,
    },

    viewFit: ZoomFitEnum.WIDTH,

    /** @type {Array.<NeoSmartpen>} */
    pens: [],
  };

  /** @type {React.RefObject<any>} */
  canvasRef = null;

  /** @type {React.RefObject<any>} */
  myRef = null;

  /** @type {InkStorage} */
  inkStorage = null;


  /** @type {string} */
  canvasId = "";

  /** @type {Array<NeoSmartpen>} */
  curr_pens = new Array(0);

  constructor(props) {
    super(props);
    // kitty
    this.canvasRef = React.createRef();
    this.myRef = React.createRef();

    /** @type {{pageId:number, inkStorage:InkStorage, scale:number, playState:number, pens:Array.<NeoSmartpen> }} */
    let { pageId, inkStorage, scale, playState } = props;

    if (!inkStorage) {
      inkStorage = InkStorage.getInstance();
    }

    this.inkStorage = inkStorage;

    this.state = {
      pageId,
      scale,
      playState,
      ...this.state
    };

    this.canvasId = uuidv4();

    this.curr_pens = props.pens;
  }

  /**
   * @private
   * @param {NeoSmartpen} pen
   */
  subscribePenEvent = (pen) => {
    pen.addEventListener(PenEventName.ON_PEN_DOWN, this.onLivePenDown);
    pen.addEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo);
    pen.addEventListener(PenEventName.ON_PEN_MOVE, this.onLivePenMove);
    pen.addEventListener(PenEventName.ON_PEN_UP, this.onLivePenUp);
    pen.addEventListener(PenEventName.ON_HOVER_MOVE, this.onLiveHoverMove);
  }

  /**
   * @private
   * @param {NeoSmartpen} pen
   */
  unsubscribePenEvent = (pen) => {
    pen.removeEventListener(PenEventName.ON_PEN_DOWN, this.onLivePenDown);
    pen.removeEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo);
    pen.removeEventListener(PenEventName.ON_PEN_MOVE, this.onLivePenMove);
    pen.removeEventListener(PenEventName.ON_PEN_UP, this.onLivePenUp);
    pen.removeEventListener(PenEventName.ON_HOVER_MOVE, this.onLiveHoverMove);

  }


  /**
   * @override
   * @public
   */
  componentDidMount() {
    const node = this.myRef.current;
    if (node) {
      let parentHeight = node.offsetHeight;
      let parentWidth = node.offsetWidth;

      console.log(`(width, height) = (${parentHeight}, ${parentWidth})`);
    }

    // let size = this.size;

    /** @type {{pageId:number, width:number, height:number, pens:Array.<NeoSmartpen> }} */
    let { pageId, width, height, pens } = this.props;

    let rect = { x: 0, y: 0, width, height };

    // const page = pages.filter((p) => p.pageNumber === pageId)[0];
    // console.log("Draw Stroke size", pageId, "canvas size", size, "rect", rect);

    this.initRenderer(this.size);
    window.addEventListener("resize", this.resizeListener);

    // subscribe all event from pen
    pens.forEach(pen => {
      console.log(`PenBasedRenderer: componentDidMount, EventSubscribing`);
      this.subscribePenEvent(pen)
    });
  }


  /**
   * @override
   * @public
   */
  shouldComponentUpdate(nextProps, nextState) {
    let ret_val = true;

    if (nextProps.pens !== this.curr_pens) {
      /** @type {Array<NeoSmartpen>} */
      const new_pens = nextProps.pens;

      /** @type {Array<NeoSmartpen>} */
      const curr_pens = this.curr_pens;

      // subscribe all event from pen
      new_pens.forEach(pen => {
        console.log(`PenBasedRenderer: shouldComponentUpdate, EventSubscribing`);
        const index = curr_pens.indexOf(pen);
        if (index < 0) {
          this.subscribePenEvent(pen)
        }
      });

      this.curr_pens = nextProps.pens;

      ret_val = true;
    }

    return ret_val;
  }

  /**
   * @override
   * @public
   */
  componentWillUnmount() {
    /** @type {Array.<NeoSmartpen>} */
    const pens = this.props.pens;
    pens.forEach(pen => this.unsubscribePenEvent(pen));

    // this.state.renderer.stopInterval();
    window.removeEventListener("resize", this.resizeListener);

    // penManager에 연결 해제
    let penManager = PenManager.getInstance();
    penManager.unregisterRenderContainer(this);
  }


  resizeListener = () => {
    this.setState({ sizeUpdate: this.state.sizeUpdate + 1 });

    // const { classes, scaleType, scale } = this.props;
    const { scale, width, height } = this.props;


    const rect = { x: 0, y: 0, width, height };
    // const { rect } = this.state;
    const { penEventCount } = this.state;
    this.size = this.getSize(scale, rect);

    if (this.state.renderer) {
      // console.log("render resize", this.size)
      this.state.renderer.resize(this.size);
    }
  };

  initRenderer(size) {
    /** @type {{width:number, height:number}} */
    const { width, height } = this.props;

    const rect = { x: 0, y: 0, width, height };
    // const { rect } = this.state;
    // const page = pages.filter((p) => p.pageNumber === pageId)[0];

    const inkStorage = this.inkStorage;
    const options = {
      canvasId: this.canvasId,
      viewFit: this.state.viewFit,
      width,
      height,
    };

    let renderer = new PenBasedRenderWorker(options);
    this.setState({ renderer: renderer });
  }



  /**
   *
   * @param {{strokeKey:string, mac:string, time:number, stroke:NeoStroke}} event
   */
  onLivePenDown = (event) => {
    // console.log(event);
    if (this.state.renderer) {
      this.state.renderer.createLiveStroke(event);
    }
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, section:number, owner:number, book:number, page:number}} event
   */
  onLivePenPageInfo = (event) => {
    const { penEventCount, pageInfo } = this.state;
    const { section, owner, book, page } = event;

    this.setState({
      penEventCount: penEventCount + 1,
      pageInfo: { section, owner, book, page }
    });

    const inkStorage = this.inkStorage;
    if (inkStorage) {
      let pageStrokesCount = inkStorage.getPageStrokes(event).length;
      this.setState({ strokeCount: pageStrokesCount });
    }

    if (this.state.renderer) {
      this.state.renderer.changePage(section, owner, book, page, false);
    }
    // console.log(event);
  }


  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, dot:NeoDot}} event
   */

  onLivePenMove = (event) => {
    if (this.state.renderer) {
      this.state.renderer.pushLiveDot(event);
    }
    // const { liveDotCount } = this.state;

    // this.setState({ liveDotCount: liveDotCount + 1 });
    // console.log(event);
  }

  /**
   *
   * @param {{strokeKey:string, mac:string, stroke, section:number, owner:number, book:number, page:number}} event
   */
  onLivePenUp = (event) => {
    if (this.state.renderer) {
      this.state.renderer.closeLiveStroke(event);
    }

    // const { penEventCount, inkStorage } = this.state;
    // this.setState({ penEventCount: penEventCount + 1 });
    // if (inkStorage) {
    //   let pageStrokesCount = inkStorage.getPageStrokes(event).length;
    //   this.setState({ strokeCount: pageStrokesCount });
    // }
    // console.log(event);
  }


  /**
   *
   * @param {{strokeKey:string, mac:string, stroke:NeoStroke, dot:NeoDot}} event
   */

  onLiveHoverMove = (event) => {
    if (this.state.renderer) {
      this.state.renderer.moveHoverPoint(event);
    }
    // const { liveDotCount } = this.state;

    // this.setState({ liveDotCount: liveDotCount + 1 });
    // console.log(event);
  }


  getSize = (scale, rect) => {
    let size = {
      width: rect.width,
      height: rect.height,
    };

    return size;
  };

  render() {
    // const { classes, scaleType, scale } = this.props;
    const { scale, width, height, pens } = this.props;
    const { section, owner, book, page } = this.state.pageInfo;

    const rect = { x: 0, y: 0, width, height };
    // const { rect } = this.state;
    const { penEventCount } = this.state;
    this.size = this.getSize(scale, rect);

    const manager = PenManager.getInstance();
    let connected_pens = manager.getConnectedPens();

    return (
      <div id="replayContainer" ref={this.myRef}>
        <h1>PenBasedRenderer</h1><h2>{section}.{owner}.{book}.{page}:{penEventCount}</h2>
        <ul>
          {pens.map(pen => (
            <li key={pen.mac}>{pen.mac}</li>
          ))}
        </ul>

        <Paper style={{ height: this.size.height, width: this.size.width }}>
          <canvas id={this.canvasId} ref={this.canvasRef} />
        </Paper>
      </div>
    );
  }

}

const propTypes = {
  scale: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  // rect: PropTypes.object,
  pageId: PropTypes.string,
  inkStorage: PropTypes.instanceOf(InkStorage),

  playTimeHandler: PropTypes.func,
  playStateHandler: PropTypes.func,


  isPlay: PropTypes.bool,
  replaySpeed: PropTypes.number,
  playTime: PropTypes.number,

  playState: PropTypes.symbol,
  // function (props, propName, componentName) {
  //   if (propName === "playState" && !PLAYSTATE.hasOwnProperty(props.playState)) {
  //     return new Error(
  //       "Invalid prop `playState` supplied to `StorageRenderer`. Validation failed."
  //     );
  //   }
  // },
};


const defaultProps = {
  scale: 1,
  pageId: "0.0.0.0",    // s.o.b.p
  inkStorage: null,
};


PenBasedRenderer.propTypes = propTypes;
PenBasedRenderer.defaultProps = defaultProps;

export default PenBasedRenderer;