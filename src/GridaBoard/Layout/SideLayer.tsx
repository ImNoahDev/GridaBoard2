import React, { useState } from "react";
import BackgroundButton from "../../components/buttons/BackgroundButton";
import ConnectButton from "../../components/buttons/ConnectButton";
import FitButton from "../../components/buttons/FitButton";
import PenTypeButton from "../../components/buttons/PenTypeButton";
import RotateButton from "../../components/buttons/RotateButton";
import GridaToolTip from "../../styles/GridaToolTip";
import ZoomButton from "../../components/buttons/ZoomButton";
import FullScreenButton from "../../components/buttons/FullScreenButton";
import TracePointButton from "../../components/buttons/TracePointButton";
import { RootState } from "../../store/rootReducer";
import { useSelector } from "react-redux";
import GridaApp from "../GridaApp";
import { Box, Button, IconButton, makeStyles, Paper } from "@material-ui/core";
import PostAddIcon from '@material-ui/icons/PostAdd';
import GridaDoc from "../GridaDoc";
import { setActivePageNo } from "../../store/reducers/activePageReducer";
import InkStorage from "../../nl-lib/common/penstorage/InkStorage";
import { PageEventName } from "../../nl-lib/common/enums";
import { scrollToBottom } from "../../nl-lib/common/util";
import MenuIcon from '@material-ui/icons/Menu';
import PersistentDrawerRight from "../View/Drawer/PersistentDrawerRight";
import { updateDrawerWidth } from "../../store/reducers/ui";
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import $ from "jquery";

const sideStyle = {
  // display: "block",
  // alignItems: "center",
  // height: "87.8vh",
  // width: "9.375vw",
  // float: "left",
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

const useStyles = makeStyles(theme => ({
  iconContainer: {
      "&:hover $icon": {
          color: 'red',
      }
  },
  icon: {
      color: 'black',
  },
}));

const addBlankPage = async (event) => {
  const doc = GridaDoc.getInstance();
  const pageNo = await doc.addBlankPage();
  setActivePageNo(pageNo);
  scrollToBottom("drawer_content");
}

/**
 *
 */
const SideLayer = () => {
  const activePageNo_store = useSelector((state: RootState) => {
    return state.activePage.activePageNo
  });
  
  const handleTrashBtn = () => {
    const doc = GridaDoc.getInstance();
    const basePageInfo = doc.getPage(activePageNo_store).basePageInfo;

    const inkStorage = InkStorage.getInstance();
    inkStorage.dispatcher.dispatch(PageEventName.PAGE_CLEAR, basePageInfo);
    inkStorage.removeStrokeFromPage(basePageInfo);
  }

  const pens = useSelector((state: RootState) => {
    return state.appConfig.pens;
  });

  const onPenLinkChanged = e => {
    const app = GridaApp.getInstance();
    app.onPenLinkChanged(e);
    // const pen = e.pen;
    // if (e.event.event === 'on_connected') {
    //   pens.push(pen);
    //   setPens([...pens]);
    // }
    // else if (e.event.event === 'on_disconnected') {
    //   const mac = pen.getMac();
    //   console.log(`Home: OnPenDisconnected, mac=${pen.getMac()}`);
    //   const index = pens.findIndex(p => p.getMac() === mac);
    //   if (index > -1) {
    //     const newPens = pens.splice(index, 1);
    //     setPens([...newPens]);
    //   }
    // }
  }

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
        {/* <div id="drawer-icon"
          style={{ position: "absolute", right: 10, top: 0, zIndex: 4 }}
        > */}
          <IconButton
            id="arrow-btn"
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerOpen}
            style={arrowRightStyle}
          // className={clsx(drawerOpen && classes.hide)}
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
