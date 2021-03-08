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

const mainFrameStyle = {
  position: "static",
  // flexDirection: "row-reverse",
  // display: "block",

  // left: "0%",
  // top: "10%",
  // bottom: "10%",

  alignItems: "center",
  // zIndex: 3,
  // marginLeft: "-1px",
  border: "1px solid black",
  height: "87.8vh",
  width: "9.375vw",
  float: "left",
} as React.CSSProperties;

const arrowRightStyle = {
  display: "flex",
  // flexDirection: "row",
  // justifyContent: "center",
  // alignItems: "center",
  padding: "8px",
  width: "40px",
  height: "40px",
  // left: "16px",
  top: "16px",
  background: "rgba(255,255,255,0.25)",
  // boxShadow: "2px 0px 24px rgba(0, 0, 0, 0.15), inset 0px 2px 0px rgba(255, 255, 255, 0.15)",
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

  const showForm = React.useState(false)
  const classes = useStyles();
  
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
      <div id="mainFrame" style={mainFrameStyle}>

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
        {/* </div> */}

        {/* <div className="d-flex flex-column h-100">
          <div id="leftmenu" className="main-container flex-grow-1">
            <div id="menu-wide" className="d-flex menu-container float-left h-100">
              <div className="d-flex flex-column justify-content-between" style={{ zIndex: 1030 }}>
                <ConnectButton onPenLinkChanged={e => onPenLinkChanged(e)} />
                <div className="btn-group-vertical neo_shadow" style={{ fontSize: "20px", fontWeight: "bold" }}>
                  <GridaToolTip open={true} placement="left" tip={{
                    head: "Add Page",
                    msg: "ncode 페이지를 추가하는 버튼입니다.",
                    tail: "키보드 버튼 ?로 선택 가능합니다"
                  }} title={undefined}>
                    <IconButton className={classes.iconContainer} onClick={(event) => addBlankPage(event)} style={{padding: "4px"}} >
                      {!showForm
                        ? <PostAddIcon fontSize="large" className={classes.icon}>빈 페이지 추가</PostAddIcon>
                        : <PostAddIcon fontSize="large" className={classes.icon}>빈 페이지 추가</PostAddIcon>
                      }
                    </IconButton> 
                  </GridaToolTip>
                </div>
                <div className="btn-group-vertical neo_shadow" style={{ marginBottom: 10 }}>
                  <div className="btn-group dropright" role="group">
                    <PenTypeButton />
                  </div>

                  <button id="btn_trash" type="button" className="btn btn-neo btn-neo-dropdown"
                    onClick={() => handleTrashBtn()}>
                    <GridaToolTip open={true} placement="left" tip={{
                      head: "Clear",
                      msg: "화면의 글자를 모두 지우는 버튼입니다.",
                      tail: "키보드 버튼 1로 선택 가능합니다"
                    }} title={undefined}>
                      <div className="c2">
                        <img src='./icons/icon_trash_n.png' className="normal-image"></img>
                        <img src='./icons/icon_trash_p.png' className="hover-image"></img>
                      </div>
                    </GridaToolTip>
                  </button>

                  <RotateButton />
                  <BackgroundButton />
                </div>
                <div className="btn-group-vertical neo_shadow" style={{ marginBottom: 10 }}>
                  <FitButton />
                  <ZoomButton />
                  <FullScreenButton />
                </div>
                <div className="btn-group-vertical neo_shadow" style={{ marginBottom: 10 }}>
                  <TracePointButton />
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
  );
}

export default SideLayer;
