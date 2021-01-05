import { g_paperType } from "./NcodeSurfaceDataJson";
import { DEFAULT_SECTION, DEFAULT_OWNER, DEFAULT_BOOK, NCODE_TO_INCH_SCALE } from "../constants";
import { IPageSOBP, INcodeSOBPxy, ISize } from "../structures";

class PaperInfo_module {
  public getPaperInfo = (pageInfo: IPageSOBP) => {
    let section = -1, owner = -1, book = -1;
    if (pageInfo) {
      section = pageInfo.section;
      owner = pageInfo.owner;
      book = pageInfo.book;
    }

    let isDefault = false;
    let key = section.toString() + "." + owner.toString() + "." + book.toString();
    let found = g_paperType.definition[key];
    if (!found) {
      key = g_paperType.defaultKey;
      found = g_paperType.definition[key];
      isDefault = true;
    }

    return found
  }
}

export const PaperInfo = (function () {
  return new PaperInfo_module();
})();
