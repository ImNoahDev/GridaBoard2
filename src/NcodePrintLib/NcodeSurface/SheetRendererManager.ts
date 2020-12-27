import { IPrintOption, IProgressCallbackFunction } from "../NcodePrint/PrintDataTypes";
import NeoPdfDocument from "../NeoPdf/NeoPdfDocument";
import { isSameObject } from "../UtilFunc";
import { SheetRenderer } from "./SheetRenderer";
import * as Util from "../UtilFunc";


type ISheetRendererDesc = {
  pdf: NeoPdfDocument,
  pageNums: number[],
  printOption: IPrintOption,
  renderer?: SheetRenderer,
}


let _srm: SheetRendererManager = null;

export class SheetRendererManager {

  _cache: ISheetRendererDesc[] = [];

  static getInstance() {
    if (_srm) return _srm;

    _srm = new SheetRendererManager();
    return _srm;
  }

  private isSameSheet = (a: ISheetRendererDesc, b: ISheetRendererDesc) => {
    if (a.pdf !== b.pdf)
      return false;

    if (!isSameObject(a.pageNums, b.pageNums))
      return false;

    if (!isSameObject(a.printOption, b.printOption))
      return false;

    return true;
  }

  public getPreparedSheet = async (pdf: NeoPdfDocument, pageNums: number[], printOption: IPrintOption, progressCallback: IProgressCallbackFunction) => {
    let renderer: SheetRenderer;
    let isNew = false;

    const rendererDesc = this._cache.find(r => this.isSameSheet(r, { pdf, pageNums, printOption }));
    if (rendererDesc)
      renderer = rendererDesc.renderer;
    else {
      renderer = new SheetRenderer(printOption, progressCallback);
      isNew = true;
    }

    const result = await renderer.getPreparedSheet(pdf, pageNums, printOption, progressCallback);

    if (isNew) {
      const item: ISheetRendererDesc = {
        pdf,
        pageNums: [...pageNums],
        printOption: Util.cloneObj(printOption),
        renderer
      };
      this._cache.push(item);
    }

    return result;
  }
}