import { IPageSOBP } from "../DataStructure/Structures";

/**
 * in mm 
 */
export type IPaperSize = {
  unit: "mm" | "inch" | "pu" | "nu" | "css" | "600dpi",
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
