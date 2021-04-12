import React, { useState, useEffect} from 'react';
import '../../styles/main.css';
import PenManager from '../../../nl-lib/neosmartpen/PenManager';
import { ButtonBase, makeStyles, Theme, Tooltip, TooltipProps } from '@material-ui/core';
import { IBrushType, PenEventName } from "nl-lib/common/enums";
import getText from "../../language/language";

const manager: PenManager = PenManager.getInstance();

const useStyles = makeStyles((theme: Theme) => ({
  smallBtn: {
    width: "18px !important", 
    height: "18px !important",
  },
  colorBtn : {
    textAlign: "center",
    padding: "0px",
    transition: "none",
    float: "left"
  },
  colorIcon : {
    marginTop: "0px",
    width: "24px",
    height: "24px",
    borderRadius: "24px",
    "&:hover" : {
      boxShadow: "0px 0px 2px 2px rgba(0, 0, 0, 0.4) inset"
    },
    "&:pressed" : {
      border: "2px solid var(--gridaboard_cyan)"
    }
  },
  dropColorBtn : {
    marginTop: "8px",
    marginLeft: "22px"
  },
  selectColorBtn : {
    marginLeft: "24px",
  },
  colorDropDownStyle : {
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
  }
}));

const useStylesBootstrap = makeStyles((theme: Theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: "11px"
  }
}));

function BootstrapTooltip(props: TooltipProps) {
  const classes = useStylesBootstrap();

  return <Tooltip arrow classes={classes} {...props} />;
}

let btnStyles = [] as React.CSSProperties[];

const ColorButtons = () => {
  const [penType, setPenType] = useState(manager.penRendererType as IBrushType);
  const [color, setColor] = useState(manager.color as string);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [dropVisible, setDropVisible] = useState(true);
  let _dropDom = undefined as HTMLElement;
  
  const classes = useStyles();

  useEffect(() => {
    changeBtnStyles();
    manager.addEventListener(PenEventName.ON_PEN_TYPE_CHANGED, changeColorBtns);
    manager.addEventListener(PenEventName.ON_COLOR_CHANGED, changeColorBtnSelected);

    return () => {
      manager.removeEventListener(PenEventName.ON_PEN_TYPE_CHANGED, changeColorBtns);
      manager.removeEventListener(PenEventName.ON_COLOR_CHANGED, changeColorBtnSelected);
    }
  }, []);
  
  useEffect(() => {
    if(!dropVisible){
      const element = _dropDom;
      element.focus();
    }
  },[dropVisible]);
  

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeColor = (color: number) => {
    manager.setColor(color);
    handleClose();
  }

  function handleClickColor(visible:boolean = null) {
    if(visible !== null){
      setDropVisible(visible);
    }else if(visible !== dropVisible){
        setDropVisible(!dropVisible);
    }
  }
  function dropBlur(e){
    const  currentTarget = e.currentTarget;
    // 이벤트 루프의 다음 틱에서 새로 포커스 된 요소를 확인합니다.
    setTimeout(() => {
      // 새 activeElement가 원래 컨테이너의 자식인지 확인
      if (!currentTarget.contains(document.activeElement)) {
        // 여기에서 콜백을 호출하거나 맞춤 로직을 추가 할 수 있습니다.
        handleClickColor(true);
      }
    }, 0);
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
  return (
    <React.Fragment>
      <div>
        <BootstrapTooltip title={getText("nav_color")}>
          <ButtonBase className={`${classes.colorBtn} ${classes.selectColorBtn}`} onClick={()=>handleClickColor()}>
            <div id="" className={`${classes.smallBtn} ${classes.colorIcon}`} style={{"backgroundColor": color }}></div>
            {/* <KeyboardArrowDownRoundedIcon style={{marginLeft: "6px"}}/> */}
          </ButtonBase>
        </BootstrapTooltip>

        <div ref={(e)=>{_dropDom=e}} tabIndex={-1} hidden={dropVisible} className={`${classes.colorDropDownStyle}`}  onBlur={dropBlur}>
          {(Array.from({length:10},(el,idx)=>idx)).map(el=>{
            return (<ButtonBase key={el} className={`${classes.colorBtn} ${classes.dropColorBtn}`} onClick={() => changeColor((el+1)%10)}>
            <div className={classes.colorIcon} style={btnStyles[el]}></div>
            </ButtonBase>)
          })}
        </div>
      </div>
    </React.Fragment>
  );
}
export default ColorButtons;