import { ColorConvertMethod } from "../enums";

/**
 * Class
 */
export default class CanvasColorConverter {
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  convert = (method = ColorConvertMethod.ANDROID_STYLE, luminanceMaxRatio: number): Promise<void> => {
    const canvas = this.canvas;
    const ctx = canvas.getContext("2d");

    const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { width, height } = canvas;

    const promises = new Array(0);

    if (method === ColorConvertMethod.BLUEPRINT) {
      for (let y = 0; y < height; y++) {
        const pr = this.convertSingleRow(id.data, y, width, luminanceMaxRatio);
        promises.push(pr);
      }
    }
    else {
      for (let y = 0; y < height; y++) {
        const pr = this.ConvertRgb_A3(id.data, y, width, luminanceMaxRatio);
        promises.push(pr);
      }
    }

    return new Promise(resolve => {
      Promise.all(promises).then(() => {
        // console.log("End convert");
        ctx.putImageData(id, 0, 0);
        resolve();
      });
    })
  }

  private ConvertRgb_A3 = (data: Uint8ClampedArray, row: number, width: number, luminanceMaxRatio: number): Promise<void> => {
    const byteWidth = width * 4;
    const pixelAddr = byteWidth * row;
    const pixelAddrEnd = pixelAddr + byteWidth;
    const luminanceOffset = 255 * (1 - luminanceMaxRatio);

    return new Promise(resolve => {
      for (let i = pixelAddr; i < pixelAddrEnd; i += 4) {
        let r = data[i];        // red
        let g = data[i + 1];      // green
        let b = data[i + 2];      // blue
        let luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) * luminanceMaxRatio;
        luminance += luminanceOffset;


        if (r < g) {
          if (g <= b + 10) {
            b = 0xff;
            r = g = luminance;
          } else {
            g = 0xff;
            r = b = luminance;
          }
        } else {
          if (r <= b + 10) {
            b = 0xff;
            r = g = luminance;

          } else {
            r = 0xff;
            g = b = luminance;
          }
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
        data[i + 3] = 255;   // alpha

      }
      resolve();
    });
  }

  private convertSingleRow = (data: Uint8ClampedArray, row: number, width: number, luminanceMaxRatio: number): Promise<void> => {
    const byteWidth = width * 4;
    const pixelAddr = byteWidth * row;
    const pixelAddrEnd = pixelAddr + byteWidth;
    const luminanceOffset = 255 * (1 - luminanceMaxRatio);

    return new Promise(resolve => {
      for (let i = pixelAddr; i < pixelAddrEnd; i += 4) {
        const r = data[i];        // red
        const g = data[i + 1];      // green
        const b = data[i + 2];      // blue
        let luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) * luminanceMaxRatio;
        luminance += luminanceOffset;

        data[i] = luminance;
        data[i + 1] = luminance;
        data[i + 2] = 255;
        data[i + 3] = 255;   // alpha

      }
      resolve();
    });
  }
}