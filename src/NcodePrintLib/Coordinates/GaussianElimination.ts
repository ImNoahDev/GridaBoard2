import { EchelonMatrix } from "./EchelonMatrix";
import { sprintf } from "sprintf-js";

/**
 * public
 * @param mtx 
 */
export function reduce(mtx: EchelonMatrix) {
  // 본격적을 RREF를 구하기 시작
  let lead = 0;
  for (let row = 0; row < mtx.rows; row++) {
    if (lead >= mtx.cols) return;

    let nonZeroRow = row;
    while (0 === mtx.elem[nonZeroRow][lead]) {
      nonZeroRow++;

      if (nonZeroRow === mtx.rows) {
        nonZeroRow = row;
        lead++;
        if (lead === mtx.cols) return;
      }
    }

    swapRows(mtx, nonZeroRow, row);
    nomalizeRow(mtx, row, lead);

    for (nonZeroRow = 0; nonZeroRow < mtx.rows; nonZeroRow++) {
      if (nonZeroRow !== row) {
        const fElem = mtx.elem[nonZeroRow][lead];
        rowMultiplyAndAdd(mtx, nonZeroRow, row, -1 * fElem);
      }
    }
    lead++;
  }
}


/**
 * for debug
 * @param mtx 
 */
export function dumpMatrix(mtx: EchelonMatrix) {
  console.log(`${mtx.rows} x ${mtx.cols} MATRIX`);
  for (let row = 0; row < mtx.rows; row++) {
    let line = "";
    for (let col = 0; col < mtx.cols; col++) {
      const val = mtx.elem[row][col];
      line += sprintf("%6.4f", val);
    }
    console.log(line);
  }
}

/**
 * 
 * @param mtx 
 * @param row 
 * @param lead 
 */
function nomalizeRow(mtx: EchelonMatrix, row: number, lead: number) {
  const val = mtx.elem[row][lead];

  for (let i = 0; i < mtx.cols; i++) {
    mtx.elem[row][i] /= val;
  }
}


/**
 * 
 * @param mtx 
 * @param rowDst 
 * @param rowSrc 
 * @param multiplier 
 */
function rowMultiplyAndAdd(mtx: EchelonMatrix, rowDst: number, rowSrc: number, multiplier: number) {
  for (let i = 0; i < mtx.cols; i++) {
    mtx.elem[rowDst][i] += mtx.elem[rowSrc][i] * multiplier;
  }
}

/**
 * 
 * @param mtx 
 * @param row1 
 * @param row2 
 */
function swapRows(mtx: EchelonMatrix, row1: number, row2: number) {
  if (row1 === row2) return;

  for (let i = 0; i < mtx.cols; i++) {
    const temp = mtx.elem[row1][i];
    mtx.elem[row1][i] = mtx.elem[row2][i];
    mtx.elem[row2][i] = temp;
  }
}

