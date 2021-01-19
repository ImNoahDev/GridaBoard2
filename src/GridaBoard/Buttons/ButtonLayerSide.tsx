import React from "react";
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
import { Box, Button, Paper } from "@material-ui/core";
import PostAddIcon from '@material-ui/icons/PostAdd';
import GridaDoc from "../GridaDoc";
import { setActivePageNo } from "../../store/reducers/activePageReducer";
import InkStorage from "../../nl-lib/common/penstorage/InkStorage";
import { PageEventName } from "../../nl-lib/common/enums";

const mainFrameStyle = {
  position: "absolute",
  flexDirection: "row-reverse",
  display: "flex",

  left: "0%",
  top: "10%",
  bottom: "10%",

  alignItems: "center",
  zIndex: 3,
  marginLeft: "-1px",
} as React.CSSProperties;

const addBlankPage = (event) => {
  const doc = GridaDoc.getInstance();
  const pageNo = doc.addBlankPage();
  setActivePageNo(pageNo);
}


/**
 *
 */
const ButtonLayerSide = () => {
  const activePageNo_store = useSelector((state: RootState) => {
    return state.activePage.activePageNo
  });


  const handleTrashBtn = () => {
    const doc = GridaDoc.getInstance();
    const basePageInfo = doc.getPage(activePageNo_store).basePageInfo;

    const inkStorage = InkStorage.getInstance();
    inkStorage.dispatcher.dispatch(PageEventName.PAGE_CLEAR, null);
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

  return (
    <div style={{ zIndex: 0 }}>

      <div id="mainFrame" style={mainFrameStyle}>
        {/* <nav id="sidenav" className="navbar fixed-left navbar-light bg-transparent"> */}

        <div className="d-flex flex-column h-100">
          <div id="leftmenu" className="main-container flex-grow-1">
            <div id="menu-wide" className="d-flex menu-container float-left h-100">
              <div className="d-flex flex-column justify-content-between" style={{ zIndex: 1030 }}>
                <ConnectButton onPenLinkChanged={e => onPenLinkChanged(e)} />
                <div className="btn-group-vertical neo_shadow" style={{ fontSize: "20px", fontWeight: "bold" }}>
                  <button className="btn btn-neo btn-neo-vertical" onClick={(event) => addBlankPage(event)} >
                    <PostAddIcon fontSize="large">빈 페이지 추가</PostAddIcon>
                  </button>
                </div>
                <div className="btn-group-vertical neo_shadow" style={{ marginBottom: 10 }}>
                  <div className="btn-group dropright" role="group">
                    <PenTypeButton />
                  </div>

                  {/* Trash Button  */}
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
        </div>
        {/* </nav> */}
      </div>

    </div>
  );
}

export default ButtonLayerSide;