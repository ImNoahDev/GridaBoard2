import React, {useState} from "react";
import '../../styles/buttons.css';
import ThemeManager from "../../styles/ThemeManager";
import GridaToolTip from "../../styles/GridaToolTip";
import { Button, makeStyles, ClickAwayListener, Icon } from "@material-ui/core";
import $ from "jquery";
import getText from "../../language/language";

const themeManager: ThemeManager = ThemeManager.getInstance();
const useStyle = makeStyles(theme => ({
  buttonStyle : {
    marginRight: "4px",
    color : theme.custom.icon.mono[0],
    "&:hover" : {
      color : theme.palette.action.hover
    }
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
  const [theme, setTheme] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const classes = useStyle();
  const themeNameArr = ["basic", "neoprism"];

  const setBackground = (background) => {
    setTheme(background);
    if(background === 0) {
      themeManager.setT1();
    } else if(background === 1) {
      themeManager.setT2();
    } else if(background === 2) {
      themeManager.setT4();
    } else {
      themeManager.setT5();
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
          <Button variant="outlined" type="button" className={classes.buttonStyle} onClick={handleClick}>
                <span>
                  {getText(`nav_background_${themeNameArr[theme]}`)}
                </span>
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