import React, { useState } from "react";
import { RootState } from "../store/rootReducer";
import { useSelector } from "react-redux";
import { IconButton } from "@material-ui/core";
import PersistentDrawerRight from "../View/Drawer/PersistentDrawerRight";
import { updateDrawerWidth } from "../store/reducers/ui";
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import $ from "jquery";

const arrowRightStyle = {
  display: "flex",
  padding: "8px",
  width: "40px",
  height: "40px",
  top: "8px",
  background: "rgba(255,255,255,0.25)",
  borderRadius: "40px",
  marginLeft: "16px",
  zIndex: 1000
} as React.CSSProperties;

const LeftSideLayer = () => {

  const [drawerOpen, setDrawerOpen] = useState(false);
  const setDrawerWidth = (width: number) => updateDrawerWidth({ width });
  
  const activePageNo_store = useSelector((state: RootState) => state.activePage.activePageNo);
  
  const handleDrawerOpen = () => {
    // $('#arrow-btn').css('display', 'none');
    $('#arrow-btn').hide(100);
    $('#show').show(100);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    
    // $('#arrow-btn').show(100);
    // $('#show').hide(100);
    setDrawerOpen(false);

    $('#arrow-btn').show(200);
  };

  const onDrawerResize = (size) => {
    setDrawerWidth(size);
  }

  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);

  const sideStyle = {
    display: "flex",
    width: drawerOpen ? "180px" : 0,
    height: "816px",
    zoom: 1 / brZoom,
  } as React.CSSProperties;

  let disabled = true;
  if (activePageNo_store !== -1) {
    disabled = false;
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
            disabled={disabled}
          >
            <KeyboardArrowRightIcon/>
          </IconButton>
          <PersistentDrawerRight
            id="show"
            open={drawerOpen} handleDrawerClose={handleDrawerClose} onDrawerResize={onDrawerResize}
            noInfo = {true}
          />
      </div>
  );
}

export default LeftSideLayer;
