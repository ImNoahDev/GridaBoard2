import { IPageSOBP } from "../DataStructure/Structures";


/**
 * https://stackoverflow.com/questions/44757411/what-is-pixel-width-and-length-for-jspdfs-default-a4-format

    function convertPointsToUnit(points, unit) {
      // Unit table from https://github.com/MrRio/jsPDF/blob/ddbfc0f0250ca908f8061a72fa057116b7613e78/jspdf.js#L791
      var multiplier;
      switch(unit) {
        case 'pt':  multiplier = 1;          break;
        case 'mm':  multiplier = 72 / 25.4;  break;
        case 'cm':  multiplier = 72 / 2.54;  break;
        case 'in':  multiplier = 72;         break;
        case 'px':  multiplier = 96 / 72;    break;
        case 'pc':  multiplier = 12;         break;
        case 'em':  multiplier = 12;         break;
        case 'ex':  multiplier = 6;
        default:
          throw ('Invalid unit: ' + unit);
      }
      return points * multiplier;
    }
 */


/**
 * in mm
 */
export type IPaperSize = {
  unit: "mm" | "inch" | "pu" | "nu" | "css" | "600dpi",     // pu = points, css = px
  width: number,
  height: number
};

export type INcodeSurfaceDesc = {
  id: string;           //
  pageInfo: IPageSOBP;

  /** Ncode Unit margin  */
  margin: {
    Xmin: number,
    Xmax?: number,

    Ymin: number,
    Ymax?: number,
  };

  /** n,u,l,d,r */
  glyphData: string;
}

export type IPaperTypeDesc = {
  [key: string]: {
    section: number,
    owner: number,
    books: number[],

    Xmin: number,
    Ymin: number,
    Xmax: number,
    Ymax: number,
  }
}
