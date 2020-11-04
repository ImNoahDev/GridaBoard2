import { fabric } from "fabric";
import "../../types";

import { drawLinePath } from "../pageviewer/DrawCurves";
import { getStrokesTimeInfo } from "../StrokeInfo";

const timeTickDuration = 20; // ms

const BG_COLOR = "rgba(125, 137, 239, 0.0)";
const STROKE_PULSE_COLOR = "rgba(125, 137, 239, 1.0)";

const BG_COLOR_DISABLED = "rgba(125, 137, 239, 0.1)";
const STROKE_PULSE_COLOR_DISABLED = "rgba(125, 137, 239, 0.6)";

const NOW_PAYING_BAR_COLOR = "rgba(255, 0, 0, 0.7)";

// const CURR_PAGE_COLOR = "rgba(0, 0, 0, 0.1)";
const CURR_PAGE_COLOR = "rgba(125, 137, 239, 0.5)";
const OTHER_PAGE_COLOR = "rgba(125, 137, 239, 0.1)";

const PAGE_SEPARATOR_COLOR = "rgba(0, 0, 0, 0.6)";
const PAGE_NUMBER_COLOR = "rgba(255, 255, 255, 1)";
const PAGE_NUMBER_BGCOLOR = "rgba(0, 0, 0, 0.6)";


export default class StrokeGraph {
  /**
   *
   * @param {string} canvasName
   * @param {function} playTimeHandler
   * @param {TimebasedRenderStrokes} strokeStream
   */

  constructor(canvasName, strokeStream) {
    this.strokeStream = strokeStream;
    this.playingTIme = -1;

    this.strokes = null;
    this.start_time = 0;
    this.duration = 0;

    this.n_entries = 0;
    this.seg_width = 1;

    this.size = null;
    this.canvasName = canvasName;
    this.canvas = null;

    this.pathArray = [];
  }

  init = (size) => {
    this.canvas = new fabric.Canvas(this.canvasName, {
      backgroundColor: BG_COLOR,
      // selectionColor: 'blue',
      selection: false,
      controlsAboveOverlay: true,
      centeredScaling: true,
      allowTouchScrolling: true,
      selectionLineWidth: 4,
      width: size.width,
      height: size.height,
    });

    this.size = {
      ...size,
      width: size.width - 2,
    };

    this.initGraph(this.canvas);
  };

  resizeCanvas = (size) => {
    let canvas = this.canvas;
    canvas.clear();

    // var objects = canvas.getObjects();
    // for (var i = 0; i < objects.length; i++) {
    //   //console.log(objects[i]);
    //   canvas.remove(objects[i]);
    // }
    // canvas.renderAll();

    canvas.setWidth(size.width);
    canvas.setHeight(size.height);

    this.size = {
      ...size,
      width: size.width - 2,
    };


    let self = this;
    self.initGraph(canvas);

    // canvas.on("after:render", function (e) {
    //   canvas.setWidth(self.size.width);
    //   canvas.setHeight(self.size.height);
    //   self.initGraph(canvas);
    // });
  };

  /**
   *
   * @param {Array.<NeoStroke>} strokes
   * @return {Array.<Array.<NeoStroke>>} StrokeChunk
   */
  chunkPageStrokes(strokes) {
    const equalStroke = (a, b) => {
      return (
        a &&
        b &&
        a.section === b.section &&
        a.owner === b.owner &&
        a.book === b.book &&
        a.pageNum === b.pageNum
      );
    };

    // prepare for return value
    const chunked = [];

    let prev = null;
    // 주어진 배열을 탐색
    for (let stroke of strokes) {
      let curr = {
        section: stroke.section,
        owner: stroke.owner,
        book: stroke.book,
        pageNum: stroke.pageNum,
      };

      // console.log(curr);

      const last = chunked[chunked.length - 1];
      if (!last || !equalStroke(prev, curr)) {
        chunked.push([stroke]);
        prev = { ...curr };
      } else {
        last.push(stroke);
      }
    }

    return chunked;
  }

  initGraph = (canvas) => {
    canvas.clear();

    let size = this.size;
    let strokeStream = this.strokeStream;

    let info = getStrokesTimeInfo(strokeStream);

    this.startTime_whole = info.start;
    this.endTime_whole = info.end + 1;

    this.strokes = info.strokes;
    this.start_time = info.start;
    this.duration = info.duration;

    this.n_entries = size.width + 1;
    this.seg_width = this.n_entries / (this.duration + 10);

    this.resetPathArray();
    this.initPathArray(info);
  };

  /**
   *
   * @param {*} page
   * @param {Array.<Array.<NeoStroke>>} strokes_chunk
   *
   * @return {number} page start time, relative
   */
  setPage = (page, strokes_chunk) => {
    const { section, owner, book, pageNumber } = page;
    this.pageNumber = pageNumber;

    // let chunks = this.chunkPageStrokes(this.strokeStream.strokes);
    let chunks = strokes_chunk;

    let pageRects = [];

    let page_start_time = -1;
    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i];

      /** @type {NeoStroke} */
      let first = chunk[0];

      /** @type {NeoStroke} */
      let last = chunk[chunk.length - 1];

      let rel_time_start = first.startTime - this.startTime_whole;
      let rel_time_end = last.startTime + last.duration - this.startTime_whole;
      let rel_before_next = rel_time_end;

      if (i !== chunks.length - 1) {
        let next_chunk = chunks[i + 1];

        /** @type {NeoStroke} */
        let next_first = next_chunk[0];

        rel_before_next = next_first.startTime - this.startTime_whole - 1;
      }

      let x0 = rel_time_start * this.seg_width;
      let x1 = rel_time_end * this.seg_width;
      let x2 = rel_before_next * this.seg_width;

      let fill_color = CURR_PAGE_COLOR;

      // kitty, 페이지에 아예 스트로크가 없을때에는 시작 시작이 제대로 설정되지 않는다.
      if (pageNumber === first.pageNum) {
        if (page_start_time === -1) {
          page_start_time = rel_time_start;
        }
      } else {
        fill_color = OTHER_PAGE_COLOR;
      }

      let rect = new fabric.Rect({
        left: x0,
        top: 0,
        height: this.size.height,
        width: x1 - x0,
        fill: fill_color,
        stroke: PAGE_SEPARATOR_COLOR,
        strokeWidth: 1,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
      });
      pageRects.push(rect);

      let circ = new fabric.Circle({
        left: x0,
        top: 0,
        radius: 6,
        fill: PAGE_SEPARATOR_COLOR,
        stroke: "",
        strokeWidth: 0,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
      });
      // pageRects.push(circ);

      let rect2 = new fabric.Rect({
        left: x0,
        top: 0,
        width: 15,
        height: 20,
        fill: PAGE_NUMBER_BGCOLOR,
        stroke: "",
        strokeWidth: 0,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
      });
      // pageRects.push(rect2);

      let pageNum = chunk[0].pageNum;
      let txt = new fabric.Text(` ${pageNum} `, {
        fontFamily: "",
        fontSize: 12,
        width: 30,
        height: 10,
        left: x0 + 1,
        top: 0,
        textBackgroundColor: PAGE_NUMBER_BGCOLOR,
        fill: PAGE_NUMBER_COLOR,
        stroke: "",
        strokeWidth: 0,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
      });
      pageRects.push(txt);

    }

    this.clearPageRects();
    this.pageRects = pageRects;
    this.setPageRects(pageRects);

    // console.log(chunks);

    return page_start_time;
  };
  setPageRects = (rects) => {
    if (this.canvas) {
      rects.forEach((rect) => {
        this.canvas.add(rect);
      });
    }
  };

  clearPageRects = () => {
    if (this.pageRects) {
      this.pageRects.forEach((rect) => {
        this.canvas.remove(rect);
      });
    }
  };

  // Drawing iOS Data Format

  /**
   *
   */
  resetPathArray = () => {
    if (this.canvas) {
      this.pathArray.forEach((path) => {
        this.canvas.remove(path);
      });
    }
    this.pathArray = [];
  };

  initPathArray = (strokes_t) => {
    let size = this.size;
    let strokes = strokes_t.strokes;
    let start_time = strokes_t.start;
    let duration = strokes_t.duration;

    let n_entries = size.width + 1;
    let density_bars = Array.apply(null, Array(n_entries + 1)).map(
      Number.prototype.valueOf,
      0
    );
    // density_bars = density_bars.map(n => 0);

    let seg_width = n_entries / duration;

    strokes.forEach((stroke, index) => {
      let dots = stroke.dotArray;
      dots.forEach((dot) => {
        let t = Math.floor((dot.time - start_time) * seg_width);
        let before = density_bars[t];
        density_bars[t] = before + 1;
      });
    });

    let max = Math.max(...density_bars);
    let relative_density = density_bars.map((v) => v / max);

    const pathOption = {
      objectCaching: false,
      stroke: STROKE_PULSE_COLOR,
      strokeWidth: 1 / seg_width,
      strokeLineCap: "round",
      fill: STROKE_PULSE_COLOR,
    };

    let h1 = size.height - 1;
    relative_density.forEach((v, i) => {
      let x = i;

      let y0 = h1;
      let y1 = h1 - v * 20;
      let y2 = this.size.height - v * 20;

      if (v > 0) {
        let line = new fabric.Line([0, 0, 0, v * 20], {
          left: x,
          top: y2,
          fill: "",
          stroke: STROKE_PULSE_COLOR,
          strokeWidth: 1,
          hasControls: false,
          lockMovementX: true,
          lockMovementY: true,
        });

        if (this.canvas) {
          this.canvas.add(line);
        }
      }
    });

    let nowPlayingLine = new fabric.Line([0, 0, 0, size.height], {
      left: this.playingTIme,
      top: 0,
      fill: "",
      stroke: NOW_PAYING_BAR_COLOR,
      strokeWidth: 2,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
    });

    this.playingLine = nowPlayingLine;
    this.canvas.add(nowPlayingLine);

    // this.canvas.requestRenderAll();
    this.canvas.renderAll();
  };

  setPlayingTime = (ms) => {
    this.playingTIme = ms;

    if (this.canvas && this.playingLine) {
      this.playingLine.set({ left: ms * this.seg_width, top: 0 });
      this.canvas.renderAll();
    }
  };
}
