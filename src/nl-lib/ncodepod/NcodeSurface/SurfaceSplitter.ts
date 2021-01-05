import { IAreasDesc } from "./NcodeRasterizer";
import { getSurfaceSize_px_600dpi } from "../../common/noteserver";

import { IPrintOption, IRectDpi, ISize} from "../../common/structures";
import { MediaSize } from "../../common/constants";

// import { isPortrait } from "./SurfaceInfo";
export const PAGES_CELL_SPACING = 120; // 600dpi px, 5.08mm

// http://www.javascripter.net/math/primes/factorization.htm
function factor(n: number) {
  if (isNaN(n) || !isFinite(n) || n % 1 !== 0 || n === 0) return '' + n;
  if (n < 0) return '-' + factor(-n);
  const minFactor = leastFactor(n);
  if (n === minFactor) return n;

  const recursive = factor(n / minFactor);
  // console.log(`[recursive] ${typeof recursive}`);

  return [minFactor].concat(recursive);
}

// find the least factor in n by trial division
function leastFactor(n: number) {
  if (isNaN(n) || !isFinite(n)) return NaN;
  if (n === 0) return 0;
  if (n % 1 || n * n < 2) return 1;
  if (n % 2 === 0) return 2;
  if (n % 3 === 0) return 3;
  if (n % 5 === 0) return 5;
  const m = Math.sqrt(n);
  for (let i = 7; i <= m; i += 30) {
    if (n % i === 0) return i;
    if (n % (i + 4) === 0) return i + 4;
    if (n % (i + 6) === 0) return i + 6;
    if (n % (i + 10) === 0) return i + 10;
    if (n % (i + 12) === 0) return i + 12;
    if (n % (i + 16) === 0) return i + 16;
    if (n % (i + 22) === 0) return i + 22;
    if (n % (i + 24) === 0) return i + 24;
  }
  return n;
}

function findBestCombination(factored: number[]) {
  let min_left = 1, min_right = 1;

  const reducer = (mul: number, curr: number) => mul * curr;

  for (let i = 1; i < factored.length; i++) {
    const left = factored.slice(0, i).reduce(reducer, 1);
    const right = factored.slice(i, factored.length + 1).reduce(reducer, 1);

    if (left > right) break;
    min_left = left;
    min_right = right;
  }

  return [min_left, min_right];
}

function findRotation(rows: number, cols: number, srcDirection: string): number {
  const srcSize = getSurfaceSize_px_600dpi(MediaSize.A4, srcDirection === "landscape");
  let rotation = 0;

  const cellSize = {
    width: srcSize.width / cols,
    height: srcSize.height / rows,
  };

  let cellSize_90 = {
    width: srcSize.height / cols,
    height: srcSize.width / rows,
  };

  if (srcDirection === "landscape") {
    cellSize_90 = {
      width: srcSize.height / rows,
      height: srcSize.width / cols,
    };
  }


  const scale_x = cellSize.width / srcSize.width;
  const scale_y = cellSize.height / srcSize.width;
  const scale_normal = Math.min(scale_x, scale_y);

  const scale_rev_x = cellSize_90.width / srcSize.width;
  const scale_rev_y = cellSize_90.height / srcSize.height;
  const scale_rev = Math.min(scale_rev_x, scale_rev_y);

  if (scale_rev > scale_normal) {
    rotation = 90;
  }

  return rotation;
}


export function getCellMatrixShape(numItems: number, srcDirection: string): { rows: number, cols: number, rotation: number } {
  const factored = [1].concat(factor(numItems));
  let [rows, cols] = findBestCombination(factored);

  let rotation = findRotation(rows, cols, srcDirection);

  /**
   * 정수 제곱 개의 cell을 가지는 경우에는 90도 돌려서 출력할 필요 없음
   */
  if (numItems === 1) { rows = 1; cols = 1; rotation = 0; }
  else if (numItems === 4) { rows = 2; cols = 2; rotation = 0; }
  else if (numItems === 9) { rows = 3; cols = 3; rotation = 0; }
  else if (numItems === 16) { rows = 4; cols = 4; rotation = 0; }
  else if (numItems === 25) { rows = 5; cols = 5; rotation = 0; }
  /**
   * 아래의 면분할 숫자들은, 각 cell을 출력할 때 90도 돌려서 출력
   * 90도 돌려서 출력하는 것은 ctx.rotate를 쓰도록 한다.
   *    ctx.save();
   *    ctx.translate(canvas.width, 0);
   *    ctx.rotate( -90 * Math.PI/180);
   *    ... drawing operation ...
   *    ctx.restore();
   *
   * rows, cols는 90도 돌아갔다고 가정하고 나눈 면을 뜻한다.
   *
   *    r=1, c=1
   *    +-----+           r=1, c=2
   *    |     |           +---+---+
   *    |  1  |     =>    | 1 | 2 |
   *    |     |           +---+---+
   *    +-----+
   */
  else if (numItems === 2) { rows = 1; cols = 2; rotation = 90; }
  else if (numItems === 8) { rows = 2; cols = 4; rotation = 90; }
  else if (numItems === 18) { rows = 3; cols = 6; rotation = 90; }
  else if (numItems === 32) { rows = 4; cols = 8; rotation = 90; }

  // else if (numItems === 3) { rows = 1; cols = 3; rotation = 90; }

  return { rows, cols, rotation };
}

export function devideSurfaceAreaTo(printOptions: IPrintOption, szSrc: ISize, numItems: number)
  : IAreasDesc {
  const cellSpace = PAGES_CELL_SPACING;

  // eslint-disable-next-line prefer-const
  let { rows, cols, rotation } = getCellMatrixShape(numItems, printOptions.direction);

  // if (rotation === 90) {
  //   const { width, height } = szSrc;
  //   szSrc = { width: height, height: width };
  // }

  // sheet가 landscape이면 면을 나누는 row, col을 바꾼다.
  if (printOptions.direction === "landscape") {
    const temp = rows;
    rows = cols;
    cols = temp;
  }

  const rcSrc = { x: 0, y: 0, ...szSrc };
  const areas: IRectDpi[] = devideSurfaceAreaToMxN(rcSrc, rows, cols, cellSpace);
  return { rotation, areas };
}



function devideSurfaceAreaToMxN(rcSrc: IRectDpi, rows: number, cols: number, cellSpace: number): IRectDpi[] {
  const retAreas = [];
  const areas = devideVertical(rcSrc, rows, cellSpace);

  for (let row = 0; row < rows; row++) {
    const cells = devideHorizontal(areas[row], cols, cellSpace);
    retAreas.push(...cells);
  }

  return retAreas;
}


/**
 * 영역 세로로 나누기 ( cellSpace 만큼 띄우고)
 */
function devideVertical(rcSrc: IRectDpi, numItems: number, cellSpace: number): IRectDpi[] {
  const areas: IRectDpi[] = new Array(0);

  const width = rcSrc.width;
  const height = (rcSrc.height - cellSpace * (numItems - 1)) / numItems;

  const x = rcSrc.x
  let y = rcSrc.y
  for (let i = 0; i < numItems; i++) {
    const rc = {
      x: Math.floor(x),
      y: Math.floor(y),
      width: Math.floor(width),
      height: Math.floor(height),
    };
    areas.push(rc);
    y += height + cellSpace;
  }

  return areas;
}



/**
 * 영역 가로로 나누기 ( cellSpace 만큼 띄우고)
 */
function devideHorizontal(rcSrc: IRectDpi, numItems: number, cellSpace: number): IRectDpi[] {
  const areas: IRectDpi[] = new Array(0);

  const width = (rcSrc.width - cellSpace * (numItems - 1)) / numItems;
  const height = rcSrc.height;

  let x = rcSrc.x
  const y = rcSrc.y
  for (let i = 0; i < numItems; i++) {
    const rc = {
      x: Math.floor(x),
      y: Math.floor(y),
      width: Math.floor(width),
      height: Math.floor(height),
    };
    areas.push(rc);
    x += width + cellSpace;
  }

  return areas;
}
