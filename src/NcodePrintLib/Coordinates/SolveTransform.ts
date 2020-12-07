import { IPoint } from "../DataStructure/Structures";
import { EchelonMatrix } from "./EchelonMatrix";
import { TransformParameters, TransformPointPairs } from "./DataTypes";
import * as Gaussian from "./GaussianElimination";
import expect from "expect.js";
/**
 * private
 * @param points
 */
function initEchelonMtx_Homography(points: TransformPointPairs): EchelonMatrix {
  expect(points.src.type).to.be("homography");
  const mtx = new EchelonMatrix("homography");

  // Point *src, *dst;

  // [0..7][0..8]의 행렬, 가우스 소거법을 쓰기 위해서
  for (let i = 0; i < 4; i++) {
    const r1 = i * 2;
    const r2 = r1 + 1;

    const src = points.src.pts[i];
    const dst = points.dst.pts[i];

    /**
     * x's
     */
    mtx.elem[r1][0] = src.x;
    mtx.elem[r1][1] = src.y;
    mtx.elem[r1][2] = 1;

    mtx.elem[r1][3] = 0;
    mtx.elem[r1][4] = 0;
    mtx.elem[r1][5] = 0;

    mtx.elem[r1][6] = -(src.x * dst.x);
    mtx.elem[r1][7] = -(src.y * dst.x);
    mtx.elem[r1][8] = dst.x;

    /**
     * y's
     */
    mtx.elem[r2][0] = 0;
    mtx.elem[r2][1] = 0;
    mtx.elem[r2][2] = 0;

    mtx.elem[r2][3] = src.x;
    mtx.elem[r2][4] = src.y;
    mtx.elem[r2][5] = 1;

    mtx.elem[r2][6] = -(src.x * dst.y);
    mtx.elem[r2][7] = -(src.y * dst.y);
    mtx.elem[r2][8] = dst.y;
  }

  return mtx;
}

/**
 * private
 * @param points
 */
function initEchelonMtx_Affine(points: TransformPointPairs): EchelonMatrix {
  expect(points.src.type).to.be("affine");

  const mtx = new EchelonMatrix("affine");
  // [0..7][0..8]의 행렬, 가우스 소거법을 쓰기 위해서
  for (let i = 0; i < 3; i++) {
    const r1 = i * 2;
    const r2 = r1 + 1;

    const src = points.src.pts[i];
    const dst = points.dst.pts[i];

    /**
     * x's
     */
    mtx.elem[r1][0] = src.x;
    mtx.elem[r1][1] = src.y;

    mtx.elem[r1][2] = 0;
    mtx.elem[r1][3] = 0;

    mtx.elem[r1][4] = 1;
    mtx.elem[r1][5] = 0;
    mtx.elem[r1][6] = dst.x;

    /**
     * y's
     */
    mtx.elem[r2][0] = 0;
    mtx.elem[r2][1] = 0;

    mtx.elem[r2][2] = src.x;
    mtx.elem[r2][3] = src.y;

    mtx.elem[r2][4] = 0;
    mtx.elem[r2][5] = 1;
    mtx.elem[r2][6] = dst.y;
  }

  return mtx;
}


/**
 * public
 * @param points
 */
export function solveHomography(points: TransformPointPairs): TransformParameters {
  expect(points.src.type).to.be("homography");

  // EchelonMatrix A;
  // int n;
  const mat = initEchelonMtx_Homography(points);
  Gaussian.reduce(mat);

  const params: TransformParameters = {
    type: "homography",

    a: mat.elem[0][8],
    b: mat.elem[1][8],
    c: mat.elem[2][8],

    d: mat.elem[3][8],
    e: mat.elem[4][8],
    f: mat.elem[5][8],

    g: mat.elem[6][8],
    h: mat.elem[7][8],
    i: 1,

    tx: mat.elem[2][8],
    ty: mat.elem[5][8],
  };
  return params;
}


/**
 * public
 * @param points
 */
export function solveAffine(points: TransformPointPairs): TransformParameters {
  expect(points.src.type).to.be("affine");

  // _affineCalcMatrix A;
  // int n;
  const mat = initEchelonMtx_Affine(points);
  Gaussian.reduce(mat);
  const params: TransformParameters = {
    type: "affine",
    a: mat.elem[0][6],
    b: mat.elem[1][6],
    c: mat.elem[4][6],

    d: mat.elem[2][6],
    e: mat.elem[3][6],
    f: mat.elem[5][6],

    g: 0,
    h: 0,
    i: 1,

    tx: mat.elem[4][6],
    ty: mat.elem[5][6],
  };
  return params;
}

/**
 * public
 * @param mtx
 * @param pt
 * @return Ipoint
 */
export function applyTransform(pt: IPoint, params: TransformParameters): IPoint {
  const { x, y } = pt;
  const { a, b, c, d, e, f, g, h } = params;

  const det = 1 / (g * x + h * y + 1);
  const xx = (a * x + b * y + c) * det;
  const yy = (d * x + e * y + f) * det;

  return { x: xx, y: yy }
}
