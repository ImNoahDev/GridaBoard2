import React, { useState } from "react";
import { RootState } from "../../store/rootReducer";
import { useSelector } from "react-redux";
import GridaApp from "../GridaApp";
import { IconButton, makeStyles, Paper } from "@material-ui/core";
import GridaDoc from "../GridaDoc";
import { setActivePageNo } from "../../store/reducers/activePageReducer";
import InkStorage from "../../nl-lib/common/penstorage/InkStorage";
import { PageEventName } from "../../nl-lib/common/enums";
import { scrollToBottom } from "../../nl-lib/common/util";
import PersistentDrawerRight from "../View/Drawer/PersistentDrawerRight";
import { updateDrawerWidth } from "../../store/reducers/ui";
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import $ from "jquery";

const sideStyle = {
  display: "flex",
  flex: "none",
  width: "9.375vw",
} as React.CSSProperties;

const arrowRightStyle = {
  display: "flex",
  padding: "8px",
  width: "40px",
  height: "40px",
  top: "16px",
  background: "rgba(255,255,255,0.25)",
  borderRadius: "40px",
  marginLeft: "16px",
  zIndex: 1000
} as React.CSSProperties;

const SideLayer = () => {
  const activePageNo_store = useSelector((state: RootState) => {
    return state.activePage.activePageNo
  });
  
  const pens = useSelector((state: RootState) => {
    return state.appConfig.pens;
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const setDrawerWidth = (width: number) => updateDrawerWidth({ width });

  const handleDrawerOpen = () => {
    $('#arrow-btn').css('display', 'none');
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    $('#arrow-btn').css('display', 'block');
    setDrawerOpen(false);
  };

  const onDrawerResize = (size) => {
    setDrawerWidth(size);
  }

  return (
      <div id="mainFrame" style={sideStyle}>
        {/* Drawer 구현 */}
          <IconButton
            id="arrow-btn"
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerOpen}
            style={arrowRightStyle}
          >
            <KeyboardArrowRightIcon/>
          </IconButton>
          <PersistentDrawerRight
            open={drawerOpen} handleDrawerClose={handleDrawerClose} onDrawerResize={onDrawerResize}
            noInfo = {true}
          />
      </div>
  );
}

export default SideLayer;
