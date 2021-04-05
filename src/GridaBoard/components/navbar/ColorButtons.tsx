import React, { useState, useEffect} from 'react';
import '../../styles/main.css';
import PenManager from '../../../nl-lib/neosmartpen/PenManager';
import { ButtonBase, makeStyles, Theme, Tooltip, TooltipProps } from '@material-ui/core';
import { IBrushType, PenEventName } from "../../../nl-lib/common/enums";

const manager: PenManager = PenManager.getInstance();

const colorStyle = {
  marginLeft: "24px",
} as React.CSSProperties;

const colorDropDownStyle = {
  display: "none",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "4px 4px",
  position: "absolute",
  width: "486px",
  height: "48px",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
  borderRadius: "12px",
  zIndex: 100,
  marginTop: "30px",
  marginLeft: "20px"
} as React.CSSProperties;

const groupStyle = {
  marginTop: "8px",
  marginLeft: "22px"
} as React.CSSProperties;

const useStylesBootstrap = makeStyles((theme: Theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: "11px"
  },
}));

function BootstrapTooltip(props: TooltipProps) {
  const classes = useStylesBootstrap();

  return <Tooltip arrow classes={classes} {...props} />;
}

let btnStyles = [] as React.CSSProperties[];
let selectStyle = {
  width: "18px", 
  height: "18px",
  backgroundColor: manager.color
};

const ColorButtons = () => {
  const [penType, setPenType] = useState(manager.penRendererType as IBrushType);
  const [color, setColor] = useState(manager.color as string);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    changeBtnStyles();
    manager.addEventListener(PenEventName.ON_PEN_TYPE_CHANGED, changeColorBtns);
    manager.addEventListener(PenEventName.ON_COLOR_CHANGED, changeColorBtnSelected);

    return () => {
      manager.removeEventListener(PenEventName.ON_PEN_TYPE_CHANGED, changeColorBtns);
      manager.removeEventListener(PenEventName.ON_COLOR_CHANGED, changeColorBtnSelected);
    }
  }, []);
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeColor = (color: number) => {
    manager.setColor(color);
    handleClose();
  }

  function handleClickColor() {
    const color = document.getElementById("colorDrop");
    if (color.style.display == 'none') {
      color.style.display = 'block'
    } else {
      color.style.display = 'none'
    }
  }

  const changeBtnStyles = () => {
    switch (manager.penRendererType) {
      case IBrushType.PEN: {
        btnStyles = [];
        for (let i = 1; i <= 10; i++) {
          btnStyles.push({
            backgroundColor: manager.pen_colors[i]
          })
        }
        break;
      }
      case IBrushType.MARKER: {
        btnStyles = [];
        for (let i = 1; i <= 10; i++) {
          btnStyles.push({
            backgroundColor: manager.marker_colors[i]
          })
        }
        break;
      }
      default: break;
    }

    changeColorBtnSelected();
  }
  
  const changeColorBtns = () => {
    changeBtnStyles();
    setPenType(manager.penRendererType);
  }

  const changeColorBtnSelected = () => {
    switch (manager.penRendererType) {
      case IBrushType.PEN: {
        let bgColor = "";
        bgColor = manager.color;
        setColor(bgColor) //for re-render
        break;
      }
      case IBrushType.MARKER: {
        let bgColor = "";
        const colorNum = manager.getColorNum(manager.color);
        bgColor = manager.marker_colors[colorNum];
        setColor(bgColor) //for re-render
        break;
      }
      default: break;
    }
  }

  selectStyle = {
    width: "18px", 
    height: "18px",
    backgroundColor: color
  };

  return (
    <React.Fragment>
      <div>
        <BootstrapTooltip title="색상 [1 ~ 0]">
          <ButtonBase className="color_btn select_color" style={colorStyle} onClick={handleClickColor}>
            <div id="select_color" className="color_icon" style={selectStyle}></div>
            {/* <KeyboardArrowDownRoundedIcon style={{marginLeft: "6px"}}/> */}
          </ButtonBase>
        </BootstrapTooltip>

        <div id="colorDrop" className="selected_color" style={colorDropDownStyle}>
          <ButtonBase id="clr_1" className="color_btn" style={groupStyle} onClick={() => changeColor(1)}>
              <div className="color_icon" style={btnStyles[0]}></div>
          </ButtonBase>
          <ButtonBase id="clr_2" className="color_btn" style={groupStyle} onClick={() => changeColor(2)}>
              <div className="color_icon" style={btnStyles[1]}></div>
          </ButtonBase>
          <ButtonBase id="clr_3" className="color_btn" style={groupStyle} onClick={() => changeColor(3)}>
              <div className="color_icon" style={btnStyles[2]}></div>
          </ButtonBase>
          <ButtonBase id="clr_4" className="color_btn" style={groupStyle} onClick={() => changeColor(4)}>
              <div className="color_icon" style={btnStyles[3]}></div>
          </ButtonBase>
          <ButtonBase id="clr_5" className="color_btn" style={groupStyle} onClick={() => changeColor(5)}>
              <div className="color_icon" style={btnStyles[4]}></div>
          </ButtonBase>
          <ButtonBase id="clr_6" className="color_btn" style={groupStyle} onClick={() => changeColor(6)}>
              <div className="color_icon" style={btnStyles[5]}></div>
          </ButtonBase>
          <ButtonBase id="clr_7" className="color_btn" style={groupStyle} onClick={() => changeColor(7)}>
              <div className="color_icon" style={btnStyles[6]}></div>
          </ButtonBase>
          <ButtonBase id="clr_8" className="color_btn" style={groupStyle} onClick={() => changeColor(8)}>
              <div className="color_icon" style={btnStyles[7]}></div>
          </ButtonBase>
          <ButtonBase id="clr_9" className="color_btn" style={groupStyle} onClick={() => changeColor(9)}>
              <div className="color_icon" style={btnStyles[8]}></div>
          </ButtonBase>
          <ButtonBase id="clr_0" className="color_btn" style={groupStyle} onClick={() => changeColor(0)}>
              <div className="color_icon" style={btnStyles[9]}></div>
          </ButtonBase>
        </div>
      </div>
    </React.Fragment>
  );
}
export default ColorButtons;