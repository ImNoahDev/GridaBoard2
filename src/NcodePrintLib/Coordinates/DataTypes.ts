
import { IPageSOBP, IPoint } from "../DataStructure/Structures";

// export type HomographyPoints = {
//   type: "homography",
//   pts: [IPoint, IPoint, IPoint, IPoint],
// }

// export type AffinePoints = {
//   type: "affine",
//   pts: [IPoint, IPoint, IPoint],
// };

export type TransformPoints = {
  type: "homography" | "affine",
  unit: "nu" | "pu",
  pts: IPoint[],
}

/**
 * Homography용 pairs (4쌍)
 */
export type TransformPointPairs = {
  /** Ncode Coordinate system */
  src: TransformPoints;

  /** PDF Pixel coordinate system (72DPI) */
  dst: TransformPoints;
}



/**
 * 결과물, 아래의 함수에서 불러서 쓰자
 * function applyTransform(mtx: TransformParameters, pt: IPoint): IPoint
 */
export type TransformParameters = {
  type: "homography" | "affine",
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  g: number,
  h: number,
  i: number,

  tx: number,
  ty: number,
}


/**
 * [topLeft, topRight, bottomRight, bottomLeft]
 */
export type IPolygonArea = [IPoint, IPoint, IPoint, IPoint];


/**
 * pageInfo 라고 쓰는 것은 Ncode page (IPageSOBP)
 *
 *
 * numPages는 PDF의 총 페이지수
 * PageNo는 PDF의 페이지 번호 (1부터 시작)
 */
export type INcodePageArea = IPageSOBP & IPolygonArea;



/**
 * 좌표계 매핑을 위한 PDF 페이지 주소
 */
export interface IPdfPageDesc {
  /** PDF url */
  url: string,

  /** PDF fingerprint */
  fingerprint: string,

  /** POD id = fingerprint + "/" + pagesPerSheet */
  id?: string,

  /** total pages in pdf file */
  numPages: number,

  /** pdf page number, starting from 1 */
  pageNo: number,
}

export type IPdfMappingDesc = {
  /** PDF url */
  url: string,

  /** for local file */
  filename: string,

  /** PDF fingerprint */
  fingerprint: string,

  /** POD id = fingerprint + "/" + pagesPerSheet */
  id: string,

  /** total pages in pdf file */
  numPages: number,

  /** NCode pageInfo of the 1st page (physical first page, not the printed first page) */
  nPageStart?: IPageSOBP,

  /** mapping 정보가 생성된 시각 */
  timeString?: string,

  params?: IMappingParams[],
}


/**
 * Ncode to PDF page
 * Ncode와 mapping된 PDF 정보를 저장하기 위한 구조체
 *
 * while x=ncode_x, y=ncode_y and (x,y) in npageArea of pageInfo
 * (x', y') in Inch Unit
 *    G = x*h[6] + y*h[7] + 1;
 *    x' = (x*h[0] + y*h[1] + h[2]) / G;
 *    y' = (x*h[3] + y*h[4] + h[5]) / G;
 */
export interface IMappingParams {
  /** 최초 로컬 Mapping Storage에 store된 시각 */
  timeString?: string,

  /** Ncode page information */
  pageInfo: IPageSOBP,

  /**
   * Ncode area information,
   *
   * 하나의 Ncode page에 여러 PDF가 들어가 있는 경우에만 쓸 것이라,
   * 현재는 IPageSOBP에 의해, PDF의 페이지가 바로 구분되므로
   * 현재는 구현하고 있지 않다. 2020/12/06
   *
   * 또한, 나중에 구현한다 하더라도, Ncode A4에서 종이가 비뚤어지게 나오는
   * 경우가 있으므로, Rect로 처리하지 않고 4각형으로 처리해야 한다.
   *
   * 따라서, IPolygonArea로 쓰도록 했다.
   **/
  npageArea: IPolygonArea,

  /** (section.owner.book.page): (x,y)~(width,height) ==> pdfInfo */
  pdfDesc: IPdfPageDesc,

  /** Homography matrix (Ncode to Pdf) */
  h: TransformParameters,

  /** Homography matrix (Pdf to Ncode) */
  h_rev: TransformParameters,
}
