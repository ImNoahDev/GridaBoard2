import React, { useState } from "react";
import clsx from 'clsx';
import { RootState } from "../store/rootReducer";
import { useSelector } from "react-redux";
import { IconButton, makeStyles } from "@material-ui/core";
import PersistentDrawerRight from "../View/Drawer/PersistentDrawerRight";
import { updateDrawerWidth } from "../store/reducers/ui";
import CustomBadge from "../components/CustomElement/CustomBadge";
import {ArrowLeft, ArrowRight} from '@material-ui/icons';

const useStyle = props => makeStyles(theme=>({
  wrap: {
    display: "flex",
    height:"100%",
    width: props.drawerOpen ? "190px" : 0,
    zoom: 1 / props.brZoom,
    zIndex: 1000,
    position:"relative",
    background: theme.custom.white[25]
  },
  arrowRight : {
    display: "flex",
    padding: "8px",
    width: "40px",
    height: "40px",
    top: "8px",
    background: "rgba(255,255,255,0.25)",
    borderRadius: "40px",
    marginLeft: "16px",
    zIndex: 1000
  },
  opener : {
    width: "24px",
    height: "100%",
    position:"absolute",
    background: "rgba(0,0,0,0)",
    borderRight : "rgba(88, 98, 125, 0.15) solid 1px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  openerHover: {
    "&:hover" : {
      background:"rgba(0,0,0,0.15)",
    }
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: "190px",
  },
}));

const LeftSideLayer = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const setDrawerWidth = (width: number) => updateDrawerWidth({ width });
  
  const activePageNo_store = useSelector((state: RootState) => state.activePage.activePageNo);
  
  const handleDrawerOpen = () => {
    if(activePageNo_store === -1) return ;
    setDrawerOpen((prev)=>!prev);
  };

  const onDrawerResize = (size) => {
    setDrawerWidth(size);
  }

  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);
  const classes = useStyle({brZoom:brZoom, drawerOpen:drawerOpen})()


  let disabled = true;
  if (activePageNo_store !== -1) {
    disabled = false;
  }
  
  return (
      <div className={classes.wrap}>
          <PersistentDrawerRight
            id="show"
            open={drawerOpen} onDrawerResize={onDrawerResize}
            noInfo = {true}
          />
          <div id="arrow-btn" className={clsx(classes.opener,{
            [classes.contentShift] : drawerOpen,
            [classes.openerHover] : !disabled
          })} onClick={handleDrawerOpen}>
          <CustomBadge badgeContent={`L`}>
            <IconButton disabled={disabled}>
              {drawerOpen? (<ArrowLeft />) : (<ArrowRight />)}
            </IconButton>
          </CustomBadge>
          </div>
      </div>
  );
}

export default LeftSideLayer;