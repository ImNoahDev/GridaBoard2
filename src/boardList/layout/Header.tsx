import React, { useEffect, useState } from 'react';
import firebase , { auth } from "GridaBoard/util/firebase_config";
import { Button, makeStyles } from '@material-ui/core';
import LogoTextSvg from "GridaBoard/logoText.svg";
import { KeyboardArrowDown } from "@material-ui/icons";

const useStyle = makeStyles(theme=>({
  wrap : {
    height : "72px",
    background : theme.custom.white[100],
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "16px 24px",
    backdropFilter: "blur(4px)",
    borderBottom : "1px solid " + theme.custom.grey[2],
    justifyContent: "space-between"
  },
  imgStyle: {
    borderRadius: "8px"
  },
}))


const Header = ()=>{
  const classes = useStyle();

  let userId = "";
  if (auth.currentUser !== null) {
    userId = auth.currentUser.email;
  }

  return (
    <React.Fragment>
      <div className={classes.wrap}>
        <img src={LogoTextSvg} className={classes.imgStyle}></img>
        <Button style={{textTransform: 'none'}}>
          {userId}
          <KeyboardArrowDown/>
        </Button>
      </div>
    </React.Fragment>
  );
}

export default Header;