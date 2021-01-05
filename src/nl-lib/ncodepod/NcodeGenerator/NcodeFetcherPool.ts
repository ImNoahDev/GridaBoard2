import NcodeFetcher from "./NcodeFetcher";

import { INoteServerItem_forPOD, IPageSOBP } from "../../common/structures";
import { isSamePage, makeNPageIdStr } from "../../common/util";



let _fi: NcodeFetcherPool = null;
export default class NcodeFetcherPool {

  _codeData: INoteServerItem_forPOD[] = [];

  private constructor() {
    if (_fi) return _fi;
  }

  static getInstance() {
    if (_fi) return _fi;

    _fi = new NcodeFetcherPool();
    return _fi;
  }

  findCodeData = (pageInfo: IPageSOBP) => {
    const found = this._codeData.find(item => isSamePage(pageInfo, item.pageInfo));
    if (!found) return undefined;

    if (found.glyphData.length < 16) {
      console.error("something wrong!");
      return undefined;
    }
    return found;
  }

  getNcodeData = async (pageInfo: IPageSOBP) => {
    const alreadyDownloaded = this.findCodeData(pageInfo);
    if (alreadyDownloaded) {
      console.log(`[fetch already] NcodeFetcherPool, already loaded: ${makeNPageIdStr(pageInfo)}`);
      return alreadyDownloaded;
    }

    // const fetcher = new NcodeFetcher(pageInfo);
    const fetcher = new NcodeFetcher();
    const ncodeSurfaceDesc = await fetcher.getNcodeData(pageInfo);
    if (ncodeSurfaceDesc.glyphData.length > 16) {
      this._codeData.push(ncodeSurfaceDesc);
    }

    return ncodeSurfaceDesc;
  }
}
