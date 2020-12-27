import { IPageSOBP, IRectDpi } from "../DataStructure/Structures";
import { IPageMapItem, IPdfPageDesc, IPolygonArea, TransformParameters, TransformPoints } from "../Coordinates";

export class MappingItem {
  _params: IPageMapItem = {
    pageInfo: {} as IPageSOBP,
    npageArea: [] as any,
    pdfDesc: {} as IPdfPageDesc,
    h: {} as TransformParameters,
    h_rev: {} as TransformParameters,
  }

  /** Ncode Unit coordinate system */
  _srcPts: TransformPoints;

  /** Pdf Unit coordinate system */
  _dstPts: TransformPoints;

  // ncodePoints: IPoint[] = new Array(4);
  // pdfPoints: IPoint[] = new Array(4);


  get srcPts() {
    return this._srcPts;
  }

  get dstPts() {
    return this._dstPts;
  }

  setPointsFromRect = (target: "ncode" | "pdf", rc: IRectDpi) => {
    const x0 = rc.x;
    const y0 = rc.y;

    const x1 = x0 + rc.width;
    const y1 = y0 + rc.height;

    let unit: "nu" | "pu";    // ncode unit

    if (target === "pdf") {
      unit = "pu"; // pdf unit
    }
    else {
      unit = "nu";
    }

    const points: TransformPoints = {
      type: "homography",
      unit,
      pts:
        [
          { x: x0, y: y0 },
          { x: x1, y: y0 },
          { x: x1, y: y1 },
          { x: x0, y: y1 }
        ]
    };

    if (target === "pdf") {
      this._dstPts = points;
    }
    else {
      this._srcPts = points;

    }
  }

  setNcodeArea = (arg: INcodePageMappingParam) => {
    const { pdfDrawnRect: area_nu } = arg;

    this._srcPts = {} as TransformPoints;
    this.setPointsFromRect("ncode", area_nu);

    this._params.pageInfo = { ...arg.pageInfo };
    this._params.npageArea = { ...arg.npageArea };
  }

  setPdfArea = (arg: IPdfPageMappingParam) => {
    const { rect: area_pu } = arg;

    this._dstPts = {} as TransformPoints;
    this.setPointsFromRect("pdf", area_pu);
    this._params.pdfDesc = arg.pdfPageInfo;
  }
}

export interface IPdfPageMappingParam {
  rect: IRectDpi,        // unit should be "pu"
  pdfPageInfo: IPdfPageDesc,
}

export interface INcodePageMappingParam {
  /** 4점 매핑을 위한 rect */
  pdfDrawnRect: IRectDpi,        // unit should be "nu"
  pageInfo: IPageSOBP,

  /** 아래의 영역에 들어오면 위의 */
  npageArea: IPolygonArea,
}