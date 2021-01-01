import { makeNPageIdStr } from "../NcodePrintLib";
import { PenEventName, PenManager } from "../neosmartpen";
import { IPageSOBP } from "../neosmartpen/DataStructure/Structures";
import { IPenToViewerEvent } from "../neosmartpen/pencomm/neosmartpen";
import GridaDoc from "./GridaDoc";

let _app_instance = undefined as GridaApp;

export default class GridaApp {
  _doc: GridaDoc;
  _penManager: PenManager;

  constructor() {
    if (_app_instance) return _app_instance;

    this._doc = GridaDoc.getInstance();
    this._penManager = PenManager.getInstance();
    this._penManager.addEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo);

    console.log("GridaDoc initied");
  }

  static getInstance() {
    if (_app_instance) return _app_instance;
    _app_instance = new GridaApp();

    return _app_instance;
  }

  start = () => {
    const doc = GridaDoc.getInstance();
    // const filename = "___1page.pdf";
    // const url = "./___1page.pdf";

    const filename = "A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf";
    const url = "./A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf";

    doc.openPdfFile({ url, filename });
  }


  onLivePenPageInfo = (event: IPenToViewerEvent) => {
    const { section, owner, book, page } = event;
    const pageInfo: IPageSOBP = { section, owner, book, page };
    console.log( `${makeNPageIdStr(pageInfo)}`);
  }
}