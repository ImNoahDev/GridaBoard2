import { store } from "./client/Root";
import { PenEventName } from "../nl-lib/common/enums";
import { IPageSOBP } from "../nl-lib/common/structures";
import { MappingStorage } from "../nl-lib/common/mapper";
import { INeoSmartpen, IPenToViewerEvent } from "../nl-lib/common/neopen";
import { setPens } from "./store/reducers/appConfigReducer";
import { DefaultFilmNcode, DefaultPUINcode } from "../nl-lib/common/constants";
import { isSameNcode } from "../nl-lib/common/util";
import GridaDoc from "./GridaDoc";
import PenManager from "../nl-lib/neosmartpen/PenManager";
import { setActivePageNo } from "./store/reducers/activePageReducer";
import $ from "jquery";

let _app_instance = undefined as GridaApp;

export default class GridaApp {
  _doc: GridaDoc;
  _penManager: PenManager;

  _pens: INeoSmartpen[];

  constructor() {
    if (_app_instance) return _app_instance;

    this._doc = GridaDoc.getInstance();
    this._penManager = PenManager.getInstance();
    this._penManager.addEventListener(PenEventName.ON_PEN_PAGEINFO, this.onNcodePageChanged);

    store.subscribe(this.onStateChanged);
    console.log("GridaApp: GridaDoc initied");
  }

  static getInstance() {
    if (_app_instance) return _app_instance;
    _app_instance = new GridaApp();

    return _app_instance;
  }

  onStateChanged = () => {
    // const state = store.getState();
    // console.log(`GridaApp: store state changed`);
  }

  start = async () => {
    const doc = GridaDoc.getInstance();
    // const filename = "Portrait, codeError_test.pdf";
    // const url = "./Portrait, codeError_test.pdf";

    // const filename = "Mixed, rotation.pdf";
    // const url = "./Mixed, rotation.pdf";

    // const filename = "2P_test.pdf";
    // const url = "./2P_test.pdf";

    // const filename = "C90,91포장.pdf";
    // const url = "./C90,91포장.pdf";

    // const filename = "0. 네오랩컨버전스 초당위치전송율, 각도에 따른 정확도, 정밀도, 필기왜곡도, 필기편차(F121).pdf";
    // const url = "./0. 네오랩컨버전스 초당위치전송율, 각도에 따른 정확도, 정밀도, 필기왜곡도, 필기편차(F121).pdf";

    // const filename = "A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf";
    // const url = "./A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf";

    // doc.openPdfFile({ url, filename });

    // const pageNo = await doc.addBlankPage();
    // setActivePageNo(pageNo);
  }


  onNcodePageChanged = (event: IPenToViewerEvent) => {
    const calibraionMode = store.getState().calibration.calibrationMode;
    if (calibraionMode) return;

    const pageInfo = { section: event.section, owner: event.owner, book: event.book, page: event.page } as IPageSOBP;

    if (isSameNcode(pageInfo, DefaultFilmNcode) || isSameNcode(pageInfo, DefaultPUINcode)) {
        return;
    }

    const msi = MappingStorage.getInstance();
    const found = msi.getNPageTransform(pageInfo);

    const doc = GridaDoc.getInstance();
    const result = doc.handleActivePageChanged(pageInfo, found);

    // if (!noMoreAutoLoad && result.needToLoadPdf) {
    //   handleFileLoadNeeded(found, result.pageInfo, result.basePageInfo);
    // }

    // console.log(`GridaApp: get new page info: ${makeNPageIdStr(pageInfo)}`);
  }


  onPenLinkChanged = (e) => {
    const state = store.getState();
    this._pens = state.appConfig.pens;

    const pen = e.pen;
    if (e.event.event === 'on_connected') {
      $('#btn_connect').css('display', 'none');
      $('#btn_connected').css('display', 'block')
      this._pens.push(pen);
      setPens([...this._pens]);
    }
    else if (e.event.event === 'on_disconnected') {
      $('#btn_connect').css('display', 'block');
      $('#btn_connected').css('display', 'none')
      const mac = pen.getMac();
      console.log(`Home: OnPenDisconnected, mac=${pen.getMac()}`);
      const index = this._pens.findIndex(p => p.getMac() === mac);
      if (index > -1) {
        const newPens = this._pens.splice(index, 1);
        setPens([...newPens]);
      }
    }
  }
}

