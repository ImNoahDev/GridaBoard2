
/**
 * 
 */
export class EchelonMatrix {
  private type: string;
  public rows: number;
  public cols: number;
  public elem: Array<number[]>;

  /**
   * 
   * @param rows 
   */
  constructor(type: "homography" | "affine" | number) {
    let rows = 8;
    if (typeof (type) === "string") {
      this.type = type;

      if (type === "homography") rows = 8;
      else if (type === "affine") rows = 6;
    }
    else if (typeof (type) === "number") {
      rows = type;
    }

    this.init(rows);
  }

  /**
   * 
   * @param rows 
   */
  private init(rows: number) {
    this.rows = rows;
    this.cols = rows + 1;
    this.elem = new Array(rows);

    for (let i = 0; i < rows; i++) {
      this.elem[i] = new Array(this.cols);
    }
  }


  /**
   * @param row 
   * @param data 
   */
  public setRow(row: number, data: number[]) {
    if (row >= this.rows) {
      throw new Error(`"setRow Error, row index(${row}) larger than the rows array size(${this.rows})`);
    }
    this.elem[row] = data;
  }
}
