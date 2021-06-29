import React from 'react';
import { makeStyles } from '@material-ui/core';
import LogoTextSvg from "GridaBoard/logoText.svg";
import ProfileButton from '../../GridaBoard/components/buttons/ProfileButton';

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
  return (
    <React.Fragment>
      <div className={classes.wrap}>
        <img src={LogoTextSvg} className={classes.imgStyle}></img>
        <ProfileButton/>
      </div>
    </React.Fragment>
  );
}

export default Header;