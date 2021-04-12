import React, { useEffect, useState } from "react";
import { useTheme } from "@material-ui/core";
import { ImageProps } from "react-bootstrap";
import { hex2ColorObject } from "nl-lib/common/util";


function convertColor(c: HTMLCanvasElement, color: string) {
  const { width, height } = c;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.save();
  // ctx.fillStyle = "rgba(255, 255, 255, 0)";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(c, 0, 0);
  ctx.drawImage(c, 0, 0);
  const id = ctx.getImageData(0, 0, width, height);
  const data = id.data;
  const { r: rr, g: gg, b: bb } = hex2ColorObject(color);
  // console.log(`rgb = ${rr}, ${gg}, ${bb}`);

  for (let y = 0; y < width; y++) {
    let addr = y * width * 4;
    for (let x = 0; x < height; x++) {
      const r = data[addr + 0];
      const g = data[addr + 1];
      const b = data[addr + 2];
      const a = data[addr + 3];
      const luminance = (255 - (0.2126 * r + 0.7152 * g + 0.0722 * b)) / 255;

      data[addr + 0] = rr;
      data[addr + 1] = gg;
      data[addr + 2] = bb;

      // data[addr + 0] = luminance * rr;
      // data[addr + 1] = luminance * gg;
      // data[addr + 2] = luminance * bb;
      addr += 4;
    }
  }
  ctx.putImageData(id, 0, 0);

  return canvas;
}


function convertColorShade(c: HTMLCanvasElement, color: string, shadow = false) {
  const { width, height } = c;
  const mainCanvas = convertColor(c, color);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (shadow) {
    const shadeCanvas = convertColor(c, "rgb(0, 0, 0)");
    ctx.drawImage(shadeCanvas, 1, 1);
  }
  ctx.drawImage(mainCanvas, 0, 0);
  return canvas;
}



function getImageIndex(hoverOn: boolean, checked: boolean, disabled: boolean) {
  const hoverIndex = hoverOn ? 1 : 0;
  const checkIndex = checked ? 1 : 0;
  const disabledIndex = disabled ? 1 : 0;

  if (disabled) { return 4 + hoverIndex }
  const imgIndex = checkIndex * 2 + hoverIndex;
  return imgIndex;
}


interface Props extends ImageProps {
  src: string,
  // 0: default, 1:hover, 2:active, 3:active_hover, 4:disabled
  checked?: boolean,

  disabled?: boolean,
}

/**
 *
 * @param props
 */
export function NeoImage(props: Props): React.ReactElement<Props> {
  const { children, ...rest } = props;
  const [icons, setIcons] = useState(new Array(5));
  const [checked, setChecked] = useState(props.checked);
  const [hoverOn, setHoverOn] = useState(false);
  const [disabled, setDisabled] = useState(props.disabled ? props.disabled : false);

  const theme = useTheme();
  const getColoredImage = async (url: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      ctx.drawImage(img, 0, 0);

      /** 0:normal, 1:normal-hover, 2:checked, 3:checked-hover, 4:disabled, 5:disabled-hover */
      const icons: string[] = new Array(6);
      icons[0] = convertColorShade(canvas, "rgb(32, 32, 32)").toDataURL();
      icons[1] = convertColorShade(canvas, theme.palette.info.main).toDataURL();

      icons[2] = convertColorShade(canvas, "rgb(16, 64, 255)").toDataURL();
      icons[3] = convertColorShade(canvas, theme.palette.primary.main).toDataURL();

      icons[4] = convertColorShade(canvas, "rgb(117, 117, 117)").toDataURL();
      icons[5] = convertColorShade(canvas, "rgb(0, 220, 233)").toDataURL();

      setIcons(icons);
    }
    img.src = url;

    // const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
  }

  useEffect(() => {
    if (props.disabled) setDisabled(true);
    else setDisabled(false);
  }, [props.disabled]);

  useEffect(() => {
    getColoredImage(props.src);
  }, [props.src]);

  const hover = (e) => {
    console.log("mouse, hover");
    setHoverOn(true);
  }

  const unhover = (e) => {
    console.log("mouse, unhover");
    setHoverOn(false);
  }

  const imgIndex = getImageIndex(hoverOn, checked, disabled);

  return (
    <React.Fragment>
      {
        icons.map((ttt, index) => {
          const display = { ...props.style, display: imgIndex === index ? "block" : "none" };
          // const ppp = {...props, src: ttt, style:{display} };
          return (<img key={index} {...rest} src={ttt} style={display} onMouseOver={hover} onMouseOut={unhover} />);
        })
      }
    </React.Fragment >
  );
}
