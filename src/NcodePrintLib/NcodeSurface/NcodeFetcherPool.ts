import { FieldAlreadyExistsError } from "pdf-lib";
import { IPageSOBP } from "../DataStructure/Structures";
import * as Util from "../UtilFunc";
import { makeNPageIdStr } from "../UtilFunc";
import NcodeFetcher from "./NcodeFetcher";
import { INcodeSurfaceDesc } from "./SurfaceDataTypes";


let _instance: NcodeFetcherPool = null;
export default class NcodeFetcherPool {

  _codeData: INcodeSurfaceDesc[] = [];

  private constructor() {
    if (_instance) return _instance;
  }

  static getInstance() {
    if (_instance) return _instance;

    _instance = new NcodeFetcherPool();
    return _instance;
  }

  findCodeData = (pageInfo: IPageSOBP) => {
    const found = this._codeData.find(item => Util.isSamePage(pageInfo, item.pageInfo));
    return found;
  }

  getNcodeData = async (pageInfo: IPageSOBP) => {
    const alreadyDownloaded = this.findCodeData(pageInfo);
    if (alreadyDownloaded) {
      console.log(`[fetch already] NcodeFetcherPool, already loaded: ${makeNPageIdStr(pageInfo)}`);
      return alreadyDownloaded;
    }

    const fetcher = new NcodeFetcher(pageInfo);
    const ncodeSurfaceDesc = await fetcher.getNcodeData(pageInfo);
    this._codeData.push(ncodeSurfaceDesc);
    return ncodeSurfaceDesc;
  }
}
