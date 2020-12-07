import { IPoint } from "../DataStructure/Structures";
import * as Solve from "./SolveTransform";
import { TransformPoints, TransformPointPairs, TransformParameters, IMappingParams } from "./DataTypes";
import { MappingItem } from "../SurfaceMapper/MappingItem";
import { sprintf } from "sprintf-js";

const solveAffine = Solve.solveAffine;
const solveHomography = Solve.solveHomography;
const applyTransform = Solve.applyTransform;


/** for debugging */
let _srcPts: TransformPoints = null;
let _dstPts: TransformPoints = null;
let _params: TransformParameters = null;

/**
 * -----------------------------------------------------------------------------------
 * A. 우리는 다음과 같은 좌표계를 쓴다.
 *
 * 1) Ncode 좌표계
 * 2) PDF 좌표계
 * 3) Canvas 좌표계
 * 4) 화면 좌표계
 *
 *
 * 1) NU(Ncode Unit): 56/600 DPI, Ncode 좌표계는 펜에서 검출되는 좌표계를 기준으로 한다.
 *    - 600DPI에서 8 pixel 거리를 가지는 7개 glyph 가 하나의 Ncode
 *    - 1 NU = 7(glyphs) * 8(pixels) / 600 (DPI) = 56/600 Inch = 약 2.370666667 mm
 *
 *
 * 2) PU(Pdf Unit): 72 DPI, PDF 좌표계는 PdfJs.getViewport({scale:1})을 통해서 나오는 크기를 기준으로 하는 좌표계
 *    - PDF가 설계될 당시 1:1 scale의 좌표계는 72DPI
 *    - 1 PU = 1 pixel @ 72DPI = 1(pixel) / 72(DPI) = 1/72 Inch = 약 0.352777778 mm
 *
 * 3) CU(Canvas Unit): 96 DPI, HTML의 CSS에 의해 만들어진 좌표
 *    - 1 CU = 1pixel @ 96DPI = 1(pixel) / 96(DPI) = 1/96 Inch = 약 0.010416667 mm
 *
 * 4) SU(Screen Unit): 화면의 zoom과 offset에 따라 달라짐
 *    - zoom은 CU와 1:1일 때, 100%
 *    - fabric의 canvas.zoom, offset_x, offset_y에 의해 계산이 달라짐
 *
 * -----------------------------------------------------------------------------------
 * B. 1:1일 때, 계산 방법
 *
 * 1) NU to PU
 *    pu = nu * (56/600) / (1/72) = nu * 6.72
 *
 * 2) PU to CU
 *    cu = pu * (1/72) / (1/96) = pu * 4 / 3
 *
 * 3) NU to CU
 *    cu = nu * 6.72 * (4/3) = nu * 8.96
 *
 * 4) CU to SU(zoom, offset)
 *    su = zoom * CU + offset
 *
 * -----------------------------------------------------------------------------------
 * C. Transform matrix로 계산 방법
 *
 * 0) TransformMatrix를 구한다
 *    a) src points (Ncode Unit)의 4개 점 (affine에서는 3개 점)
 *    b) 각 src point에 해당하는 dst points (Pdf Unit)의 4개 점을 (affine에서는 3개 점)
 *    c) HomographyPoints (또는 AffinePoints)에 넣고
 *    d) solveHomography 또는 solveAffine으로 값을 구하고 TransformMatrix 타입의 리턴을
 *    e) 어딘가에 저장해 둔다. (예, transMtx)
 *
 * 1) pt in NU to pt' in PU
 *    pt' = applyTransform( pt, transMtx );
 *
 * 2) PU to CU
 *    - B-2)과 같다.
 *
 * 3) NU to CU
 *    - cu = applyTransform( nu, transMtx ) * 4 /3
 *
 * -----------------------------------------------------------------------------------
 * D. 코딩 시 변수 구별 원칙
 * 1) ptNu = pt at Ncode coordinate system
 * 2) ptPu = pt at Pdf Pixel coordinate system
 * 3) ptCu = pt at Fabric Canvas coordinate system
 * 4) ptSu = pt at screen coordinate system
 *
 *
 */
export default class CoordinateTanslater {
  // private _params: TransformParameters = null;
  // private _paramsReverse: TransformParameters = null;

  private _mappingParams: IMappingParams = null;

  constructor(original: CoordinateTanslater = null) {
    if (original) {
      const json = JSON.stringify(original._mappingParams);
      this._mappingParams = JSON.parse(json);
      this.calcReverse();
    }
  }

  get mappingParams() {
    return this._mappingParams;
  }

  /**
   * calculate transform parameters (reverse
   * @param points
   */
  public calc = (mappingItem: MappingItem) => {
    this._mappingParams = mappingItem._params;

    const srcPts = mappingItem.srcPts;
    const dstPts = mappingItem.dstPts;

    _srcPts = mappingItem.srcPts;
    _dstPts = mappingItem.dstPts;

    /** src:NU, dst:PU */
    const pts = {
      src: { ...srcPts, },
      dst: { ...dstPts, }
    } as TransformPointPairs;

    /** src:PU, dst:NU */
    const ptsReverse = {
      src: { ...dstPts, },
      dst: { ...srcPts, }
    } as TransformPointPairs;


    if (srcPts.type === "affine") {
      this._mappingParams.h = solveAffine(pts);  // NU -> PU
      this._mappingParams.h_rev = solveAffine(ptsReverse);  // PU -> NU

      _params = this._mappingParams.h;
      return;
    }
    else if (srcPts.type === "homography") {
      this._mappingParams.h = solveHomography(pts);  // NU -> PU
      this._mappingParams.h_rev = solveHomography(ptsReverse);  // PU -> NU

      _params = this._mappingParams.h;
      return;
    }

    throw Error("CoordinateTanslater needs '3 or 4 pairs of points' to initiate class.");
  }


  /**
   *
   */
  private calcReverse = () => {
    // 아래는 임의의 숫자
    const srcPts: TransformPoints = {
      type: "homography",
      unit: "pu",
      pts: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ]
    };

    // 정방향 파라메터로 역방향의 대상이 되는 점을 연산
    const dstPts: TransformPoints = {
      type: "homography",
      unit: "nu",
      pts: new Array(4),
    };

    for (let i = 0; i < 4; i++) {
      const dstPt = this.NUtoPU(srcPts[i]);
      dstPts[i] = dstPt;
    }

    /** src:PU, dst:NU */
    const ptsReverse = {
      src: { ...dstPts, },
      dst: { ...srcPts, }
    } as TransformPointPairs;

    this._mappingParams.h_rev = solveHomography(ptsReverse);
  }

  public dump = (prefix: string) => {
    const { a, b, c, d, e, f, g, h } = _params;
    const sp = _srcPts.pts;
    const dp = _dstPts.pts;

    for (let i = 0; i < 4; i++) {
      console.log(`[${prefix}] ${sprintf("(%6.1f, %6.1f) => (%5d, %5d)", sp[i].x, sp[i].y, dp[i].x, dp[i].y)}`);

    }


    const first = sprintf("%7.1f %7.1f %7.1f", a, b, c);
    const second = sprintf("%7.2f %7.1f %7.1f", d, e, f);
    const thrid = sprintf("%7.1f %7.1f %7.1f", g, h, 1);

    console.log(`[${prefix}]`);
    console.log(`[${prefix}]          | ${first} |`);
    console.log(`[${prefix}]     H =  | ${second} |`);
    console.log(`[${prefix}]          | ${thrid} |`);
    console.log(`[${prefix}]`);
  }

  /**
   * 계산된 변환행렬을 반환
   *
   * return {...this._params} 로 해야 하지 않을까?
   * 이것 때문에 class가 메모리에 계속 남아 있으면 어떻게 하지?
   */
  public get params(): TransformParameters {
    return this._mappingParams.h;
  }

  /**
   * Ncode point to Pds point
   * @param ptNu
   */
  public NUtoPU = (ptNu: IPoint): IPoint => {
    const ptPu = applyTransform(ptNu, this._mappingParams.h);
    return ptPu;
  }

  /**
   * Pds point to Ncode point
   * @param ptNu
   */
  public PUtoNU = (ptPu: IPoint): IPoint => {
    const ptNu = applyTransform(ptPu, this._mappingParams.h_rev);
    return ptNu;
  }

}
