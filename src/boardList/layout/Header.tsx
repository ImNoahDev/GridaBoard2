import React, { useEffect, useState } from 'react';
import firebase , { auth } from "GridaBoard/util/firebase_config";
import { makeStyles } from '@material-ui/core';
import LogoSvg from "GridaBoard/logo.svg";

const useStyle = makeStyles(theme=>({
  wrap : {
    height : "72px",
    background : theme.custom.white[100],
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "16px 24px",
    backdropFilter: "blur(4px)",
    borderBottom : "1px solid " + theme.custom.grey[2]
  },
  imgStyle: {
    borderRadius: "8px"
  },
}))


const Header = ()=>{
  console.log(auth.currentUser);
  const classes = useStyle();

  return (
    <div className={classes.wrap}>
      <img src={LogoSvg} className={classes.imgStyle}></img>
    </div>
  );
}

export default Header;