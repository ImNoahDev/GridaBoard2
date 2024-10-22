import React, {useEffect, useState} from "react";
import '../../styles/buttons.css';
import ThemeManager from "../../styles/ThemeManager";
import GridaToolTip from "../../styles/GridaToolTip";
import { Button, makeStyles, ClickAwayListener, Icon } from "@material-ui/core";
import $ from "jquery";
import getText from "../../language/language";
import { ArrowDropDown, KeyboardArrowDown } from "@material-ui/icons";

const themeManager: ThemeManager = ThemeManager.getInstance();
const useStyle = makeStyles(theme => ({
  buttonStyle : {
    width: "180px",
    height: "40px",
    color : theme.custom.icon.mono[0],
    background: '#FFFFFF',
    "&:hover" : {
      color : theme.palette.action.hover
    },
    "& > span" : {
    },

  },
  dropDown : {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "8px",
    position: "absolute",
    width: "140px",
    background: theme.custom.white[90],
    boxShadow: theme.custom.shadows[0],
    borderRadius: "12px",
    "& > button" : {
      textAlign: "left",
      width: "120px",
      height: "40px", 
      zIndex: 5000,
      color : theme.custom.icon.mono[0],
      background : theme.custom.white[90],
      "&:hover" : {
        color : theme.palette.action.hover,
        background : theme.custom.icon.blue[3]
      }
    }
  }
}));

const basicStyle = {
  display: "block",
  marginRight: "4px"
} as React.CSSProperties;

const neoStyle = {
  display: "none",
  marginRight: "4px"
} as React.CSSProperties;

export default function BackgroundButton() {
  let backgroundTheme;
  if(localStorage.GridaBoard_theme === undefined){
    backgroundTheme = 0;
  }else{
    backgroundTheme = parseInt(localStorage.GridaBoard_theme);
  }
  const [theme, setTheme] = useState(backgroundTheme);
  const [isOpen, setIsOpen] = useState(false);
  const classes = useStyle();
  const themeNameArr = ["basic", "neoprism"];

  const setBackground = (background:number) => {
    setTheme(background);
    setBg(background)
    setIsOpen(false);
    localStorage.GridaBoard_theme = background;
  }

  function handleClick() {
    setIsOpen((prev) => !prev);
  }
  function handleClickAway(){
    setIsOpen(false);
  }
  
  function setBg(background){
    if(background === 0) {
      themeManager.setT1();
    } else if(background === 1) {
      themeManager.setT2();
    } else if(background === 2) {
      themeManager.setT4();
    } else {
      themeManager.setT5();
    }
  }

  useEffect(()=>{
    setBg(theme);
  },[])

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div>
        <div>
          <Button variant="outlined" type="button" className={classes.buttonStyle} onClick={handleClick}>
            <div style={{width: "122px", textAlign: "left"}}>
              {getText(`nav_background_${themeNameArr[theme]}`)}
            </div>
            <div ><KeyboardArrowDown /></div>
          </Button>
        </div>
        {isOpen? (<div className={classes.dropDown}>
            {themeNameArr.map((el,idx)=>(
              <Button key={idx} onClick={() => setBackground(idx)}>
                <span className="bg-dropmenu">{getText(`nav_background_${el}`)}</span>
              </Button>
            ))}
        </div>  ) : null }
      </div>
    </ClickAwayListener> 
  );
}