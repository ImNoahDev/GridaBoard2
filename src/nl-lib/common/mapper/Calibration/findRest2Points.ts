
import { IPageSOBP, IPdfPageDesc, IPoint, IPolygonArea } from "../../structures";




/**
 * 아래의 p0, p1, p2, p3에 각각 적당한 값을 넣을 것
 * 특히 PDF는 MARK_POS_RATIO와 관련된 값일 것
 *
 * 아래 함수에서 p1과 p3의 방향을 판단하는 부분이 있으므로. p1, p3의 방향에 너무 신경 쓰지 말 것
 *
 * @param pu - p0(좌상단), p1(우상단이면 좋음), p2(우하단), p3(좌하단이면 좋음)
 * @param nu - p0(좌상단), p2(우하단)
 *
 * @return nu.p1, nu.p3 - 각각 pu.p1, pu.p3에 해당하는 점
 */
export function calculateCalibrationData(
  pu: { p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, },
  nu: { p0: IPoint, p2: IPoint, }
) {
  // const MARK_POS_RATIO = AppOptions.get("calibrationMarkPos") || DEFAULT_CALIBRATION_MARK_POS_RATIO;
  const ret = {
    nu: {
      p1: { x: undefined, y: undefined } as IPoint,
      p3: { x: undefined, y: undefined } as IPoint,
    }
  };


  const distDiagonal_pu = getDistance(pu.p0, pu.p2);
  const distHorizontal_pu = getDistance(pu.p0, pu.p1);
  const distVertical_pu = getDistance(pu.p0, pu.p3);


  const distDiagonal_nu = getDistance(nu.p0, nu.p2);

  const scale = distDiagonal_pu / distDiagonal_nu;
  const r0_at_p1 = distHorizontal_pu / scale;
  const r2_at_p1 = distVertical_pu / scale;


  const intersections_p1 = circlesIntersection(
    { ...nu.p0, r: r0_at_p1 },
    { ...nu.p2, r: r2_at_p1 });


  const isOnRightSide_pu_p1 = isRightSide(pu.p0, pu.p2, pu.p1);

  if (isRightSide(nu.p0, nu.p2, intersections_p1[0]) === isOnRightSide_pu_p1) {
    ret.nu.p1 = { ...intersections_p1[0] };
  } else {
    ret.nu.p1 = { ...intersections_p1[1] };
  }


  const r0_at_p3 = distVertical_pu / scale;
  const r2_at_p3 = distHorizontal_pu / scale;

  const intersections_p3 = circlesIntersection(
    { ...nu.p0, r: r0_at_p3 },
    { ...nu.p2, r: r2_at_p3 });


  if (isRightSide(nu.p0, nu.p2, intersections_p3[0]) !== isOnRightSide_pu_p1) {
    ret.nu.p3 = { ...intersections_p3[0] };
  } else {
    ret.nu.p3 = { ...intersections_p3[1] };
  }

  return ret;

}





/**
 * p1->p2의 방향으로 이룬 직선에 target이 왼쪽에 있는지 판별
 *
 * @param p1
 * @param p2
 * @param target
 */
function isRightSide(v1: IPoint, v2: IPoint, p: IPoint) {
  const d = (v2.x - v1.x) * p.y + (v1.y - v2.y) * p.x + (v1.x * v2.y) - (v2.x * v1.y);
  return d > 0;
  // return (v2.x - v1.x) * (p.y - v1.y) - (v2.y - v1.y) * (p.x - v1.x) > 0;
}


/**
 * pt1-pt2의 거리
 *
 * @param pt1
 * @param pt2
 */
function getDistance(pt1: IPoint, pt2: IPoint) {
  const d2 = Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2);
  return Math.sqrt(d2);
}

/**
 *
 * 두 원의 교차점을 반환
 *
 * @param c0 - (x0, y0, r0)
 * @param c1 - (x1, y1, r1)
 *
 * @returns - 교차점이 없으면 undefined
 */
function circlesIntersection(
  c0: { x: number, y: number, r: number },
  c1: { x: number, y: number, r: number }) {
  const x0 = c0.x;
  const y0 = c0.y;
  const r0 = c0.r;

  const x1 = c1.x;
  const y1 = c1.y;
  const r1 = c1.r;


  /* dx and dy are the vertical and horizontal distances between
   * the circle centers.
   */
  const dx = x1 - x0;
  const dy = y1 - y0;

  /* Determine the straight-line distance between the centers. */
  const d = Math.sqrt(dy * dy + dx * dx);

  /* Check for solvability. */
  if (d > r0 + r1) {
    /* no solution. circles do not intersect. */
    return undefined;
  }
  if (d < Math.abs(r0 - r1)) {
    /* no solution. one circle is contained in the other */
    return undefined;
  }

  /* 'point 2' is the point where the line through the circle
   * intersection points crosses the line between the circle
   * centers.
   */

  /* Determine the distance from point 0 to point 2. */
  const a = (r0 * r0 - r1 * r1 + d * d) / (2.0 * d);

  /* Determine the coordinates of point 2. */
  const x2 = x0 + (dx * a) / d;
  const y2 = y0 + (dy * a) / d;

  /* Determine the distance from point 2 to either of the
   * intersection points.
   */
  const h = Math.sqrt(r0 * r0 - a * a);

  /* Now determine the offsets of the intersection points from
   * point 2.
   */
  const rx = -dy * (h / d);
  const ry = dx * (h / d);

  /* Determine the absolute intersection points. */
  const xi = x2 + rx;
  const xi_prime = x2 - rx;
  const yi = y2 + ry;
  const yi_prime = y2 - ry;

  // return [xi, xi_prime, yi, yi_prime];
  return [
    { x: xi, y: yi },
    { x: xi_prime, y: yi_prime }
  ];
}
