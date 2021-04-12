import { SheetRenderer } from "./SheetRenderer";

import { IPrintOption, IProgressCallbackFunction } from "nl-lib/common/structures";
import { cloneObj, isSameObject } from "nl-lib/common/util";
import { NeoPdfDocument } from "nl-lib/common/neopdf";


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
        printOption: cloneObj(printOption),
        renderer
      };
      this._cache.push(item);
    }

    return result;
  }
}