import React, { useEffect, useState } from 'react';
import firebase , { auth } from "GridaBoard/util/firebase_config";
import { Button, makeStyles } from '@material-ui/core';
import LogoSvg from "GridaBoard/logo.svg";
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
  console.log(auth.currentUser);
  const classes = useStyle();
  const userId = auth.currentUser.email;

  return (
    <React.Fragment>
      <div className={classes.wrap}>
        <img src={LogoSvg} className={classes.imgStyle}></img>

        <Button style={{textTransform: 'none'}}>
          {userId}
          <KeyboardArrowDown/>
        </Button>
      </div>
    </React.Fragment>
  );
}

export default Header;