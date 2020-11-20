import { NeoSmartpen } from "./pencomm/neosmartpen";
import { PenEventName } from "./DataStructure";

import { InkStorage } from "./penstorage";
// import KerisMain from "./renderer/KerisMain";
import StorageRenderer from "./renderer/pageviewer/StorageRenderer";
import PenBasedRenderer from "./renderer/pageviewer/PenBasedRenderer";

import NoteserverClient from "./noteserver/NoteserverClient";
import { paperInfo } from "./noteserver/PaperInfo";
import PenManager from "./pencomm/PenManager";
import { uuidv4, pdfSizeToDIsplayPixel } from "./utils/UtilsFunc";
import { PLAYSTATE, ZoomFitEnum } from "./renderer/pageviewer/RenderWorkerBase";
import MixedPageView from "./renderer/MixedPageView";

import {
  SINGLE_CODE_SIZE_PER_INCH,
  NCODE_TO_MM_SCALE,
  NCODE_TO_INCH_SCALE,
  NCODE_TO_SCREEN_SCALE,
  INCH_TO_MM,

  DEFAULT_SECTION,
  DEFAULT_OWNER,
  DEFAULT_BOOK,

  PDF_DEFAULT_DPI,
  DISPLAY_DEFAULT_DPI,
} from "./constants";

import "./types";

export {
  NeoSmartpen, InkStorage,
  PenEventName,
  paperInfo, NoteserverClient,
  PenManager,

  PenBasedRenderer,
  StorageRenderer,

  SINGLE_CODE_SIZE_PER_INCH,
  NCODE_TO_MM_SCALE,
  NCODE_TO_INCH_SCALE,
  NCODE_TO_SCREEN_SCALE,
  INCH_TO_MM,

  DEFAULT_SECTION,
  DEFAULT_OWNER,
  DEFAULT_BOOK,

  PDF_DEFAULT_DPI,
  DISPLAY_DEFAULT_DPI,

  MixedPageView,
  PLAYSTATE, ZoomFitEnum,
  uuidv4,
  pdfSizeToDIsplayPixel,
};
