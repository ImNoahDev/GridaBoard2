import React from "react";
import getText, {languageType} from "../language/language";
import { makeStyles } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';

const useStyle = makeStyles(theme => ({
  main : {
    width: "100%",
    height: "100%",
    position: "absolute",
    display:"flex",
    zIndex: 2000,
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(0,0,0,0.8)",
    "&>div:first-child" : {
      transform: "translateY(-12%)"
    }
  },
  closer : {
    position: "absolute",
    display:"block",
    top: "20px",
    right: "20px",
    // top: "24px",
    // right: "64px",
    color: theme.custom.icon.mono[4],
    cursor: "pointer",

    "&>div" : {
      position: "relative",
      top: "4px",
      right: "44px",
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "14px",
      lineHeight: "16px",
      textAlign: "center",
      letterSpacing: "0.25px",
      textDecorationLine: "underline"
    },
    "&>svg": {
      color : theme.custom.icon.mono[4],
      position: "absolute",
      display:"block",
      top: "0px",
      right: "0px",
    }
  },
  clear : {
  }
}));

const TutorialPage = (props) => {
  const {dontShow, ...rest} = props;
  const imgName = `/tutorialImg/tutorial_${languageType}.png`;
  const classes = useStyle();


  const setClose = () => {
    dontShow();
  }


  return (
    <div {...rest} className={classes.main} onClick={(evt)=>{
      evt.preventDefault();
    }}>
      <div>
        <img src={`${imgName}`}  alt=''/>
      </div>
      <div className={classes.closer} onClick={setClose}>
        <div>
          {getText("dont_show_day")}
        </div>
        <ClearIcon />
      </div>
    </div>
  );
}


export default TutorialPage;