import React, {useState} from "react";
import '../../styles/buttons.css';
import { Button, makeStyles, ClickAwayListener } from '@material-ui/core';
import GridaToolTip from "../../styles/GridaToolTip";
import { setViewFit } from '../../store/reducers/viewFitReducer';
import { PageZoomEnum, ZoomFitEnum } from "nl-lib/common/enums";
import { useSelector } from "react-redux";
import { RootState } from "../../store/rootReducer";
import { setZoomStore } from '../../store/reducers/zoomReducer';
import getText from "../../language/language";

const useStyle = makeStyles(theme => ({
  buttonStyle : {
    marginLeft: "10px",
    marginRight: "30px",
    color : theme.custom.icon.mono[0],
    "&:hover" : {
      color : theme.palette.action.hover
    }
  },
  dropDown : {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "8px",
    position: "absolute",
    width: "240px",
    boxShadow: theme.custom.shadows[0],
    borderRadius: "12px",
    zIndex: 10000,
    marginLeft: "-160px",
    color : theme.custom.icon.mono[0],
    background: theme.custom.white[0],
    "&:hover" : {
      color : theme.palette.action.hover,
      background: theme.custom.icon.blue[3]
    },
    "& > button" : {
      width: "224px",
      height: "40px",
      padding: "4px 12px",
      "&>span" : {
        width: "200px",
        height: "16px",
        textAlign:"left"
      }
    }
  }
}));

export default function FitButton() {
  const [isOpen, setIsOpen] = useState(false);
  const classes = useStyle();
  
  const zoom = useSelector((state: RootState) => state.zoomReducer.zoom);
  const zoomPercent = Math.round(zoom * 100);
  const selectArr = ["increase", "reduce", "toHeight", "toWidth"];

  const changeView = (selected:number)=>{
    if([0,1].includes(selected)){
      setViewFit(ZoomFitEnum.FREE);
      let delta;
      if(selected == 0)
        delta = -100;
      else if(selected == 1)
        delta = 100;
      
      let newZoom = zoom * 0.9985 ** delta;
  
      setZoomStore(newZoom);
    }else{
      const selectedArr = [ZoomFitEnum.HEIGHT, ZoomFitEnum.WIDTH];
      setViewFit(selectedArr[selected-2]);
    }
    setIsOpen(false);
  }
  
  function handleClick() {
    setIsOpen((prev) => !prev);
  }
  function handleClickAway(){
    setIsOpen(false);
  }

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
    <div>
      <div>
        <Button variant="outlined" type="button" id="btn_fit" className={`${classes.buttonStyle}`} onClick={handleClick} style={{}}>
          <span >{zoomPercent}%</span>
        </Button>
      </div>

      {isOpen ? (<div id="fitDrop" className={classes.dropDown}>
        {selectArr.map((el, idx)=>(
          <Button key={idx} onClick={() => changeView(idx)}>
            <span>
              {getText(`nav_scale_${el}`)}
            </span>
          </Button>
        ))}
        </div>) : null}
    </div>
    </ClickAwayListener>
  );
}