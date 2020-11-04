import { NeoSmartpen, PenEventName } from "./pencomm/neosmartpen";
import { InkStorage } from "./penstorage";
// import KerisMain from "./renderer/KerisMain";
import ReplayContainer from "./renderer/pageviewer/ReplayContainer";
import NoteserverClient from "./noteserver/NoteserverClient";
import { paperInfo } from "./noteserver/PaperInfo";
import { PenManager } from "./pencomm/PenManager";

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
  ReplayContainer, PenEventName,
  paperInfo, NoteserverClient,
  PenManager,
  
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
};
