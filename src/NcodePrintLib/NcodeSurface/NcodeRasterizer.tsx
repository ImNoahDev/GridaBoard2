import { UNIT_TO_DPI, IPageSOBP, IPointDpi, IRectDpi, autoSetDpi, } from "../DataStructure/Structures";

import NcodeFetcher from "./NcodeFetcher";
import { INcodeSurfaceDesc, IPaperSize } from "./SurfaceDataTypes";

// import expect from "expect.js";
import { getSurfaceSize_dpi } from "./SurfaceInfo";
import { devideSurfaceAreaTo, getCellMatrixShape } from "./SurfaceSplitter";
import { IPrintOption } from "../NcodePrint/PrintDataTypes";
import { NCODE_CLASS6_NUM_DOTS } from "./NcodeConstans";

// import { PrintContextConsumer } from "react-to-print";

const debugNcode_w = 200;
const debugNcode_h = 500;



export function drawArrow(context: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number) {
  const headlen = 100; // length of head in pixels
  const dx = tox - fromx;
  const dy = toy - fromy;
  const angle = Math.atan2(dy, dx);

  context.beginPath();
  context.moveTo(fromx, fromy);
  context.lineTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  context.moveTo(tox, toy);
  context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
  context.stroke();
}

const codePos: { [key: string]: { code: number; dx: number, dy: number, } } = {
  "u": { code: 0, dx: +1, dy: +1 },
  "d": { code: 1, dx: -1, dy: +1 },
  "l": { code: 2, dx: -1, dy: -1 },
  "r": { code: 3, dx: +1, dy: -1 },
  "n": { code: -1, dx: 0, dy: 0 },
}

/** (dx,dy) ~ (dw=width, dh=height) */
type IPdfPixelArea = {
  dx: number,
  dy: number,
  dw: number,
  dh: number,
}



/**
 * rotation이 90이면 회전시켜서 내용물을 그려야 한다.
 *
 * areas에 있는 값은, 회전한 다음을 가정하고 있음.
 *
 *    ctx.save();
 *    ctx.translate(canvas.width, 0);
 *    ctx.rotate( -90 * Math.PI/180);
 *    ... drawing operation ...
 *    ctx.restore(); *
 */
export interface IAreasDesc {
  rotation: number;
  areas: IRectDpi[];
}

export type INcodeAreaDesc = {
  success: boolean,

  dpi: number,
  pixelsPerDot: number,
  dotsPerCell: number,

  pageInfo: IPageSOBP,
  rect: IRectDpi,
  // x_nu: number,
  // y_nu: number,
  // width_nu: number,
  // height_nu: number,
}

/**
 * canvasAreas.rotation이 90이면 회전시켜서 내용물을 그려야 한다.
 *
 * areas에 있는 값은, 회전한 다음을 가정하고 있음.
 *
 *    ctx.save();
 *    ctx.translate(canvas.width, 0);
 *    ctx.rotate( -90 * Math.PI/180);
 *    ... drawing operation ...
 *    ctx.restore(); *
 */
export type ICellsOnSheetDesc = {
  canvas: HTMLCanvasElement;
  canvasAreas: IAreasDesc;
  ncodeAreas: INcodeAreaDesc[];
}

export type ICanvasContextForCodeDraw = {
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
}

export type IPagesPerSheetNumbers = 1 | 4 | 9 | 16 | 25 | 2 | 8 | 18 | 32;
/**
 * srcDirection은, PDF 파일 전체의 landscape/portrait를 넣어야 한다.
 */
export interface IPrepareSurfaceParam {
  mediaSize: IPaperSize,
  srcDirection: "auto" | "portrait" | "landscape",
  dpi: number,
  numItems: IPagesPerSheetNumbers
  pageInfos: IPageSOBP[],

  hasToPutNcode: boolean,

  drawCalibrationMark: boolean,

  drawMarkRatio: number, // typically 0.1 ( 1 = 100% )

  /** border를 그릴지 안그릴지 */
  drawFrame: boolean,

  debugMode: 0 | 1 | 2 | 3,

  /** 상하좌우 여백, mm 단위 */
  padding: number,
}

/**
 * Class
 */
export default class NcodeRasterizer {

  // private ncodeSurfaceDesc: INcodeSurfaceDesc = null;

  private glyphDistancePx_canvas = 8;

  printOption: IPrintOption;

  // private rotation: number = 0;

  fetcher: NcodeFetcher = null;


  constructor(printOption: IPrintOption) {
    this.printOption = { ...printOption };
  }

  private drawAreaArrow = (ctx, area) => {
    const { x, y, width, height } = area;
    // drawArrow(ctx, area.x, area.y, area.x + area.width, area.y + area.height);

    ctx.save();
    ctx.font = "150px Arial";

    ctx.strokeStyle = "rgba(255, 0, 255)";     // 투명 캔버스
    // ctx.fillStyle = "rgb(255, 0, 0)";     // 투명 캔버스
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.strokeRect(area.x, area.y, area.width - ctx.lineWidth, area.height - ctx.lineWidth);

    // ctx.strokeStyle = "rgba(0, 0,0)";     // 투명 캔버스
    // drawArrow(ctx, area.x + 100, area.y, area.x + 100, area.y + area.height - 100);
    // drawArrow(ctx, area.x, area.y + 100, area.x + area.width - 100, area.y + 100);

    ctx.strokeStyle = "rgb(0,0,255)";
    ctx.fillStyle = "rgb(0,0, 255)";
    drawArrow(ctx, x + 50, y + 200, x + width - 100, y + 200);
    ctx.fillText("x", x + width / 2, y + 350);

    ctx.strokeStyle = "rgb(255,0,0)";
    ctx.fillStyle = "rgb(255,0, 0)";
    drawArrow(ctx, x + 200, y + 50, x + 200, y + height - 100);
    ctx.fillText("y", x + 250, y + height / 2);

    ctx.restore();
  }

  /**
   * 이 함수 내부에서 쓰이는 모든 단위는 600dpi 인쇄를 기준으로 한 pixel 값
   *
   * @param mediaSize
   * @param numItems
   * @param srcDirection
   */
  public prepareNcodePlane = async (options: IPrepareSurfaceParam): Promise<ICellsOnSheetDesc> => {
    const { padding, drawFrame, drawMarkRatio, drawCalibrationMark, mediaSize, srcDirection, numItems, pageInfos, hasToPutNcode } = options;
    let dpi = options.dpi;
    dpi = 600;  // kitty  2020/11/29, 코드 제네레이터는 600 dpi로 고정

    // expect(pageInfos.length).to.be(numItems);

    // temp canvas size를 구한다.
    let isLandscape = (srcDirection === "landscape");
    const isRotationNeeded = getCellMatrixShape(numItems, srcDirection).rotation === 90;
    if (isRotationNeeded) isLandscape = !isLandscape;
    const size = getSurfaceSize_dpi(mediaSize, dpi, isLandscape, padding);
    // let logicalSize = { ...size };



    // sheet의 면을 cell로 나누고,
    const entireRect = { x: 0, y: 0, ...size };
    const canvasAreas = devideSurfaceAreaTo(this.printOption, entireRect, numItems);
    const { areas } = canvasAreas;

    // 캔버스를 준비
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0)";     // 투명 캔버스
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    if (options.debugMode > 0) {
      ctx.strokeStyle = "rgba(0, 255, 0, 255)";     // 외곽
      ctx.lineWidth = 70;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    // 좌표계의 논리적 회전이 필요하면 회전, when numItems === 2 | 8 | 18 | 32
    // if (canvasAreas.rotation === 90) {
    //   ctx.translate(canvas.width, 0);
    //   ctx.rotate(Math.PI / 2);
    // }


    // 출력할 페이지/시트의 실제 출력 대상의 페이지 수 보다 적을 수 있다
    const ncodeAreas = [];
    for (let i = 0; i < areas.length; i++) {
      // 디버깅용 화살표를 그린다. debug mode 1이상
      const drawingContext: ICanvasContextForCodeDraw = { ctx, ...areas[i], };
      const area = areas[i];
      if (this.printOption.debugMode > 0) {
        this.drawAreaArrow(ctx, area);
      }

      if (drawFrame) {
        this.drawFrame(drawingContext, null);
      }

      // Calibration 십자가를 그린다.
      if (drawCalibrationMark && numItems < 24) {
        this.drawCrossMark(drawingContext, drawMarkRatio, null);
      }

      // 코드를 그린다
      if (hasToPutNcode && i < pageInfos.length) {
        const pageInfo = pageInfos[i];
        const fetcher = new NcodeFetcher(pageInfo);
        const ncodeSurfaceDesc = await fetcher.getNcodeData(pageInfos[i]);

        // (left, top) margin을 세팅
        if (this.printOption.marginLeft_nu === -1) {
          this.printOption.marginLeft_nu = ncodeSurfaceDesc.margin.Xmin;
        }

        if (this.printOption.marginTop_nu === -1) {
          this.printOption.marginTop_nu = ncodeSurfaceDesc.margin.Ymin;
        }
        // 코드를 그린다

        // ctx.strokeStyle = "rgba(0, 255, 0, 255)";     // 투명 캔버스
        // ctx.lineWidth = 70;
        // ctx.strokeRect(0, 0, canvas.width, canvas.height);
        const ncodeArea = await this.drawNcode(drawingContext, ncodeSurfaceDesc, dpi);
        ncodeAreas.push(ncodeArea);

      }
    }
    ctx.restore();

    const result: ICellsOnSheetDesc = {
      canvas,
      canvasAreas,
      ncodeAreas,
    }

    return result;
  }

  // public putCode = async (context: ICanvasContextForCodeDraw, pageInfo: IPageSOBP): Promise<any> => {
  //   // return new Promise( (resolve) => resolve() );   // kitty
  //   // this.rotation = rotation;

  //   // 코드 정보를 받아온다
  //   // 코드 정보를 받아올 때 나중에는 x margin, y margin도 서버에서 받아오게 해야 한다
  //   this.fetcher = new NcodeFetcher(pageInfo);
  //   const ncodeSurfaceDesc = await this.fetcher.getNcodeData(pageInfo);
  //   // this.ncodeSurfaceDesc = result;

  //   // (left, top) margin을 세팅
  //   if (this.printOption.marginLeft_nu === -1) {
  //     this.printOption.marginLeft_nu = ncodeSurfaceDesc.margin.Xmin;
  //   }

  //   if (this.printOption.marginTop_nu === -1) {
  //     this.printOption.marginTop_nu = ncodeSurfaceDesc.margin.Ymin;
  //   }

  //   // 코드를 그린다
  //   await this.drawNcode(context, ncodeSurfaceDesc, 600);
  // }

  private drawSingleCrossMark = (context: ICanvasContextForCodeDraw, x: number, y: number) => {
    const ctx = context.ctx;
    const line_width = 5;
    const line_len = 100;


    ctx.strokeStyle = "rgb(255, 0, 0)";
    ctx.save();

    ctx.beginPath();
    ctx.lineWidth = line_width;
    // 2020/08/31 kitty
    // canvas_context.arc(x, y, r, r, 0, Math.PI * 2, true); // Outer circle
    ctx.moveTo(x, y - line_len);
    ctx.lineTo(x, y + line_len);
    ctx.moveTo(x - line_len, y);
    ctx.lineTo(x + line_len, y);
    ctx.stroke();

    ctx.restore();
  }


  private drawFrame = (context: ICanvasContextForCodeDraw, srcMapped: IPdfPixelArea = null) => {

    // 이전 버전과 호환성을 위해
    if (srcMapped === null) {
      srcMapped = { dx: context.x, dy: context.y, dw: context.width, dh: context.height };
    }

    const x0 = srcMapped.dx
    const y0 = srcMapped.dy
    const x1 = srcMapped.dx + srcMapped.dw;
    const y1 = srcMapped.dy + srcMapped.dh;

    const ctx = context.ctx;
    ctx.strokeStyle = "rgb(0, 0, 255)";
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeRect(srcMapped.dx, srcMapped.dy, srcMapped.dw, srcMapped.dh);
    ctx.stroke();
    ctx.restore();
  }

  public drawCrossMark = (context: ICanvasContextForCodeDraw, drawMarkRatio: number, srcMapped: IPdfPixelArea = null) => {

    // 이전 버전과 호환성을 위해
    if (srcMapped === null) {
      srcMapped = { dx: context.x, dy: context.y, dw: context.width, dh: context.height };
    }

    const ratio = drawMarkRatio;
    const d = srcMapped.dw * ratio;
    const x0 = srcMapped.dx + d;
    const y0 = srcMapped.dy + d;
    const x1 = srcMapped.dx + srcMapped.dw - d;
    const y1 = srcMapped.dy + srcMapped.dh - d;

    this.drawSingleCrossMark(context, x0, y0);
    // this.drawSingleCrossMark(canvas, x0, y1);
    this.drawSingleCrossMark(context, x1, y1);
    // this.drawSingleCrossMark(canvas, x1, y0);
  }


  /**
   *
   * @param context
   * @param code_txt
   * @param y
   * @param fullOfGlyphs - for debugging
   */
  private drawNcodeSingleLine = (context: ICanvasContextForCodeDraw, code_txt: string, y: number, width: number, fullOfGlyphs = true): Promise<void> => {
    // if (this.printOption.codeDensity > 2) {
    //   return this.drawNcodeSingleLine_BOLD(context, code_txt, y, fullOfGlyphs);
    // }
    // else {
    //   return this.drawNcodeSingleLine_NORMAL(context, code_txt, y, fullOfGlyphs);
    // }

    return this.drawNcodeSingleLine_DOT(context, code_txt, y, width, fullOfGlyphs);
  }

  private drawNcodeSingleLine_DOT = (context: ICanvasContextForCodeDraw, code_txt: string, y: number, width: number, fullOfGlyphs = true): Promise<void> => {
    const { ctx, x: baseX, y: baseY } = context;

    const glyphStringSkipLeft = Math.round(this.printOption.marginLeft_nu * NCODE_CLASS6_NUM_DOTS);

    return new Promise(resolve => {
      const glyphDistancePx_canvas = this.glyphDistancePx_canvas;
      /** for debugging */
      if (!fullOfGlyphs) width = debugNcode_w;

      ctx.fillStyle = "rgba(0,0,0,255)";
      ctx.lineWidth = 0;

      let charIndex = glyphStringSkipLeft;
      for (let x = 0; x < width; x += glyphDistancePx_canvas) {
        if (charIndex >= 0) {
          const glyph = code_txt[charIndex];
          const pos = codePos[glyph];
          let dx = 0, dy = 0;
          if (pos) {
            dx = pos.dx;
            dy = pos.dy;
          }

          ctx.beginPath();
          ctx.rect(baseX + x + dx, baseY + y + dy, 1, 1);
          ctx.fill();
        }
        charIndex++;
      }
      resolve();
    });
  }

  private drawNcodeSingleLine_NORMAL = (context: ICanvasContextForCodeDraw, code_txt: string, y: number, width: number, fullOfGlyphs = true): Promise<void> => {
    const { ctx, x: baseX, y: baseY } = context;

    const glyphStringSkipLeft = Math.round(this.printOption.marginLeft_nu * NCODE_CLASS6_NUM_DOTS);

    return new Promise(resolve => {
      const glyphDistancePx_canvas = this.glyphDistancePx_canvas;
      /** for debugging */
      if (!fullOfGlyphs) width = debugNcode_w;
      const codeDensity = this.printOption.codeDensity;

      ctx.fillStyle = "rgba(0,0,0,255)";
      ctx.lineWidth = 0;

      let charIndex = 0;
      for (let x = 0; x < width; x += glyphDistancePx_canvas) {
        if (charIndex + glyphStringSkipLeft >= 0) {
          const glyph = code_txt[charIndex + glyphStringSkipLeft];

          const pos = codePos[glyph];
          let dx = 0, dy = 0;
          if (pos) {
            dx = pos.dx;
            dy = pos.dy;
          }

          ctx.beginPath();
          ctx.rect(baseX + x + dx, baseY + y + dy, codeDensity, codeDensity);
          // ctx.rect(baseX + x + dx, baseY + y + dy, 1, 1);
          ctx.fill();

        }
        charIndex++;
      }
      resolve();
    });
  }

  private drawNcodeSingleLine_BOLD = (context: ICanvasContextForCodeDraw, code_txt: string, y: number, width: number, fullOfGlyphs = true): Promise<void> => {
    const { ctx, x: baseX, y: baseY } = context;

    const glyphStringSkipLeft = Math.round(this.printOption.marginLeft_nu * NCODE_CLASS6_NUM_DOTS);

    return new Promise(resolve => {
      const glyphDistancePx_canvas = this.glyphDistancePx_canvas;
      /** for debugging */
      if (!fullOfGlyphs) width = debugNcode_w;
      // const codeDensity = this.printOption.codeDensity;

      let charIndex = 0;
      for (let x = 0; x < width; x += glyphDistancePx_canvas) {
        if (charIndex + glyphStringSkipLeft >= 0) {
          const glyph = code_txt[charIndex + glyphStringSkipLeft];

          const pos = codePos[glyph];
          let dx = 0, dy = 0;
          if (pos) {
            dx = pos.dx;
            dy = pos.dy;
          }

          const radius = 1.35;
          ctx.beginPath();
          ctx.arc(baseX + x + dx, baseY + y + dy, radius, 0, 2 * Math.PI, false);
          // ctx.rect(x + dx, y + dy, codeDensity, codeDensity);
          ctx.fillStyle = "black";
          ctx.lineWidth = 0;
          ctx.fill();
        }
        charIndex++;
      }
      resolve();
    });
  }


  private drawNcode = (
    context: ICanvasContextForCodeDraw,
    surfaceDesc: INcodeSurfaceDesc,
    dpi: number)
    : Promise<INcodeAreaDesc> => {

    // kitty
    const DEBUG_MODE = this.printOption.debugMode;

    const { glyphData } = surfaceDesc;
    const { width, height } = context;
    const glyphDistancePx_canvas = Math.round(dpi * 8 / 600);
    const glyphStringSkipTop = Math.round(this.printOption.marginTop_nu * NCODE_CLASS6_NUM_DOTS);
    const codeDrawingPromises = new Array(0);

    const result: INcodeAreaDesc = {
      success: false,
      dpi,
      pixelsPerDot: glyphDistancePx_canvas,
      dotsPerCell: NCODE_CLASS6_NUM_DOTS,

      pageInfo: { section: -1, owner: -1, book: -1, page: -1 },

      rect: {
        unit: "nu",
        x: 0, y: 0, width: 0, height: 0,
      }
    };


    if (glyphData.length < 1) {
      console.log("ERROR: no ncode data given");
      return Promise.resolve(result);
    }

    const ctx = context.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,255)";


    try {
      // const PRINT_RESOLUTION = getPrintResolution();

      const glyphStrings = glyphData.split("\r\n");
      if (glyphStrings.length < 7) {
        return Promise.resolve(result);
      }
      //  const glyph_y = codePaperInfo.Ymin * dotsInACell;
      let glyph_y = glyphStringSkipTop;

      let y = 0;
      for (y = 0; y < debugNcode_h; y += glyphDistancePx_canvas) {
        if (glyph_y >= 0) {
          const codeTxtSingleLine = glyphStrings[glyph_y];
          const pr = this.drawNcodeSingleLine(context, codeTxtSingleLine, y, width, true);
          codeDrawingPromises.push(pr);
        }
        glyph_y++;
      }

      for (; y < height; y += glyphDistancePx_canvas) {
        if (glyph_y >= 0) {
          const codeTxtSingleLine = glyphStrings[glyph_y];
          const pr = this.drawNcodeSingleLine(context, codeTxtSingleLine, y, width, !(DEBUG_MODE > 1));
          codeDrawingPromises.push(pr);
        }
        glyph_y++;
      }

      ctx.restore();

    } catch (e) {
      ctx.restore();

      console.error(e);
      return Promise.resolve(result);
    }

    return new Promise(resolve => {
      Promise.all(codeDrawingPromises).then(() => {
        result.success = true;
        result.dpi = dpi;
        result.pixelsPerDot = glyphDistancePx_canvas;
        result.dotsPerCell = NCODE_CLASS6_NUM_DOTS;

        result.pageInfo = { ...surfaceDesc.pageInfo };
        result.rect.unit = "nu";
        result.rect.x = this.printOption.marginLeft_nu;
        result.rect.y = this.printOption.marginTop_nu;
        result.rect.width = Math.ceil(width / (NCODE_CLASS6_NUM_DOTS * glyphDistancePx_canvas));
        result.rect.height = Math.ceil(height / (NCODE_CLASS6_NUM_DOTS * glyphDistancePx_canvas));

        resolve(result);
      });
    });
  }

}

function isPtInRect(x: number, y: number, rect: IRectDpi) {
  const x0 = rect.x;
  const x1 = x0 + rect.width;
  const y0 = rect.y;
  const y1 = y0 + rect.height;

  if (x >= x0 && x <= x1 && y >= y0 && y <= y1) return true;
  return false;
}

export function getNcodeAtCanvasPixel(pt: IPointDpi, areas: ICellsOnSheetDesc)
  : IPointDpi {

  if (areas.ncodeAreas.length < 1) return null;

  let { x, y } = pt;
  const scale = areas.ncodeAreas[0].dpi / pt.dpi;
  x *= scale;
  y *= scale;

  for (let i = 0; i < areas.ncodeAreas.length; i++) {
    const cArea = areas.canvasAreas.areas[i];

    if (isPtInRect(x, y, cArea)) {
      const dx_cu = x - cArea.x;
      const dy_cu = y - cArea.y;

      const nArea = areas.ncodeAreas[i];
      const ncodeUnit = nArea.dotsPerCell * nArea.pixelsPerDot;
      const dx_nu = dx_cu / ncodeUnit;
      const dy_nu = dy_cu / ncodeUnit;

      const x_nu = dx_nu + nArea.rect.x;
      const y_nu = dy_nu + nArea.rect.y;

      return { unit: "nu", dpi: UNIT_TO_DPI["nu"], x: x_nu, y: y_nu };
    }
  }

  return null;
}

export function getNcodeRectAtCanvasPixel(rc: IRectDpi, areas: ICellsOnSheetDesc)
  : IRectDpi {

  if (areas.ncodeAreas.length < 1) return null;

  rc = autoSetDpi(rc);
  const scale = areas.ncodeAreas[0].dpi / rc.dpi;
  const center: IPointDpi = {
    x: rc.x + (rc.width / 2),
    y: rc.y + (rc.height / 2),
    dpi: rc.dpi,
  };


  const center_nu = getNcodeAtCanvasPixel(center, areas);
  if (!center_nu) return null;

  const nArea = areas.ncodeAreas[0];    // 0과 다른 부분면(splitted area)는 항상 같다
  const ncodeUnit = nArea.dotsPerCell * nArea.pixelsPerDot;

  return {
    unit: "nu",
    x: center_nu.x - (rc.width / 2 * scale / ncodeUnit),
    y: center_nu.y - (rc.height / 2 * scale / ncodeUnit),
    width: (rc.width * scale / ncodeUnit),
    height: (rc.height * scale / ncodeUnit),
  }
}

