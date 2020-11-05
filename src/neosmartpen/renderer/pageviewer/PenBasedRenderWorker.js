import "../../types";
import { fabric } from "fabric";
import { PLAYSTATE } from "./StorageRenderer";
import { InkStorage } from "../..";
import { PATH_THICKNESS_SCALE, drawPath, drawLinePath } from "./DrawCurves";
import { NCODE_TO_SCREEN_SCALE } from "../../constants";
import { paperInfo } from "../../noteserver/PaperInfo";

const timeTickDuration = 20; // ms
const DISABLED_STROKE_COLOR = "rgba(0, 0, 0, 0.1)";
const INVISIBLE_STROKE_COLOR = "rgba(255, 255, 255, 0)";
const INCOMPLETE_STROKE_COLOR = "rgba(255, 0, 255, 0.4)";
const CURRENT_POINT_STROKE_COLOR = "rgba(255, 255, 255, 1)";



export const ZoomFitEnum = {
  WIDTH: "width",
  HEIGHT: "height",
  FULL: "full",
  ACTUAL: "100%",
}

const STROKE_OBJECT_ID = "ns";
const GRID_OBJECT_ID = "g";

/**
 * TO DO: 2020/11/05 
 *    1)  StorageRenderWorker (StorageBasedRenderWorker)와 병합해서 하나의 클래스를 만들 것
 *        ex.) PageRenderWorker
 * 
 * @enum {string}
 */
export default class PenBasedRenderWorker {
}
