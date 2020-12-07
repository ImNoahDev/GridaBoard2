import React, { useState, useRef } from "react";
import { PLAYSTATE, MixedPageView } from "../neosmartpen";
import { Button, Box } from "@material-ui/core";

import PenManager from '../neosmartpen/pencomm/PenManager';
import InkStorage from "../neosmartpen/penstorage/InkStorage";

import ConnectButton from '../components/buttons/ConnectButton'

import PenTypeButton from '../components/buttons/PenTypeButton'
import RotateButton from '../components/buttons/RotateButton'
import BackgroundButton from '../components/buttons/BackgroundButton'

import FitButton from '../components/buttons/FitButton'
import ZoomButton from '../components/buttons/ZoomButton'
import FullScreenButton from '../components/buttons/FullScreenButton'

import TracePointButton from '../components/buttons/TracePointButton'

import '../styles/main.css'
import ColorButtons from '../components/navbar/ColorButtons';
import PageNumbering from '../components/navbar/PageNumbering';
import PrintButton from '../components/navbar/PrintButton';
import FileLoad from '../components/navbar/FileLoad';
import CalibrationMenual from '../components/navbar/CalibrationMenual';
import UpperNav from '../components/navbar/UpperNav';
import { FileBrowserButton, IFileBrowserReturn } from "../NcodePrintLib";

import all_menu from '../icons/all_menu.png';
import icon_trash_n from '../icons/icon_trash_n.png';
import icon_trash_p from '../icons/icon_trash_p.png';

import {
  //PenEvent,
  NoteserverClient,
} from "../neosmartpen";

const PDF_URL = "./2020학년도 서울대학교 수시모집 일반전형 면접 및 구술고사 문항.pdf";

const menuStyle = {
  width: '36px',
  height: '36px',
  padding: '4px'
}

function hideAndShowFnc() {
  var colorMenu = document.getElementById('color_bar');
  var leftMenu = document.getElementById('leftmenu');
  var navCenter = document.getElementById('navbar_center');
  var navEnd = document.getElementById('navbar_end');

  if (colorMenu.style.display === 'none' && navCenter.style.display === 'none'
    && navEnd.style.display === 'none' && leftMenu.style.display === 'none') {
    colorMenu.style.display = 'block';
    navCenter.style.display = 'block';
    navEnd.style.display = 'block';
    leftMenu.style.display = 'block';
  } else {
    colorMenu.style.display = 'none';
    navCenter.style.display = 'none';
    navEnd.style.display = 'none';
    leftMenu.style.display = 'none';
  }

}



const getNoteInfo = (event) => {
  // let url = "http://nbs.neolab.net/v1/notebooks/attributes?device=android";
  let note_info = new NoteserverClient();
  note_info.getNoteInfo({});
};


let _pens = new Array(0);
let _num_pens = 0;


const Home = () => {
  const pageRef: React.RefObject<MixedPageView> = useRef();
  const [num_pens, setNumPens] = useState(0);
  const [pens, setPens] = useState(new Array(0));
  const [pdfUrl, setUrl] = useState(PDF_URL);

  const onPenLinkChanged = e => {
    const pen = e.pen;
    if (e.event.event === 'on_connected') {
      _pens.push(pen);
      setPens([..._pens]);

      _num_pens++;
      setNumPens(_num_pens);
    }
    else if (e.event.event === 'on_disconnected') {
      const mac = pen.getMac();
      console.log(`Home: OnPenDisconnected, mac=${pen.getMac()}`);
      const index = _pens.findIndex(p => p.getMac() === mac);

      if (index > -1) {
        _pens.splice(index, 1);
        setPens([..._pens]);
        _num_pens--;
        setNumPens(_num_pens);
      }
    }
  }

  const handleTrashBtn = () => {
    const penRendererState = pageRef.current.rendererRef.current.state;

    penRendererState.renderer.removeAllCanvasObject();
    InkStorage.getInstance().removeStrokeFromPage(penRendererState.pageInfo);

    console.log('Handle Trash Btn');
  }

  // 이 함수에서 pdf를 연다
  const onFileOpen = (event: IFileBrowserReturn) => {
    console.log(event.url)
    if (event.result === "success") {
      setUrl(event.url);
    }
  };

  return (
    <div>
      <nav id="uppernav" className="navbar navbar-light bg-transparent" style={{ float: "left" }}>
        <a id="grida_board" className="navbar-brand" href="#">Grida board
        <small id="neo_smartpen" className="text-muted">
            <span data-l10n-id="by_neosmart_pen"> by Neo smartpen</span>
          </small>
        </a>
      </nav>

      <div id={"home_div"} style={{
        position: "absolute",
        left: "0px", top: "0px",
        flexDirection: "row-reverse", display: "flex",
        width: "100%", height: "100%",
        alignItems: "center",
        zIndex: 1,
      }}>
        <div id={"button_div"} style={{
          position: "absolute",
          display: "flex", flexDirection: "row-reverse",
          alignItems: "center",
          left: "0px", top: "0px",
          width: "100%", height: "40px",
          zIndex: 100,
        }}>
          {/* Connect a pen */}
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            <FileBrowserButton variant="contained" color="primary" onFileOpen={onFileOpen}>
              <Box fontSize={14} fontWeight="fontWeightBold" >PDF열기</Box>
            </FileBrowserButton>
          </div>

          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            <Button variant="outlined" color="primary" onClick={(event) => getNoteInfo(event)} >
              <Box fontSize={14} fontWeight="fontWeightBold" >Get Notebook Infos</Box>
            </Button>
          </div>
          <div style={{ flex: 1 }}>
          </div>

          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            Pen Connected: {num_pens}
          </div>

          <UpperNav />

          <div style={{ flex: 8 }}>
          </div>
        </div>



      <nav id="colornav" className="navbar fixed-bottom navbar-light bg-transparent">
        <div className="d-inline-flex p-2 bd-highlight">
          <div className="navbar-menu d-flex justify-content-end align-items-end neo_shadow">
            {/* <MenuButton onClick={hideAndShowFnc} /> */}
            <button id="btn_menu" type="button" className="btn btn-neo " title="Open a menu" onClick={hideAndShowFnc}>
              <div className="c2">
                <img style={menuStyle} src={all_menu} className="normal-image" alt=""></img>
                <img style={menuStyle} src={all_menu} className="hover-image" alt=""></img>
              </div>
            </button>
          </div>
          <div id="color_bar" className="color_bar neo_shadow float-left bottom_text color_bar">
            <ColorButtons />
          </div>
          <div id="navbar_center">
            <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
              <PageNumbering /><PrintButton /><FileLoad />
            </div>
          </div>
          <div id="navbar_end">
            <div className="navbar-menu d-flex justify-content-end align-items-end neo_shadow">
              <CalibrationMenual />
            </div>
          </div>
        </div>
      </nav>

        <div style={{
          // position: "absolute",
          left: "0px", top: "0px",
          flexDirection: "row-reverse", display: "flex",
          width: "5%", height: "80%",
          alignItems: "center",
          zIndex: 100,
        }}>
          <div className="d-flex flex-column h-100">
            <div id="leftmenu" className="main-container flex-grow-1">
              <div id="menu-wide" className="d-flex menu-container float-left h-100">
                <div className="d-flex flex-column justify-content-between" style={{ zIndex: 1030 }}>
                  <ConnectButton onPenLinkChanged={e => onPenLinkChanged(e)} />
                  <div className="btn-group-vertical neo_shadow" style={{ marginBottom: 10 }}>
                    <div className="btn-group dropright" role="group">
                      <PenTypeButton />
                    </div>

                    {/* Trash Button  */}
                    <button id="btn_trash" type="button" title="Clear" className="btn btn-neo btn-neo-dropdown"
                      onClick={() => handleTrashBtn()}>
                      <div className="c2">
                          <img src= {icon_trash_n} className="normal-image"></img>
                          <img src= {icon_trash_p} className="hover-image"></img>
                      </div>
                    </button>

                    <RotateButton /><BackgroundButton />
                  </div>
                  <div className="btn-group-vertical neo_shadow" style={{ marginBottom: 10 }}>
                    <FitButton /><ZoomButton /><FullScreenButton />
                  </div>
                  <div className="btn-group-vertical neo_shadow" style={{ marginBottom: 10 }}>
                    <TracePointButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MixedPageView pdfUrl={pdfUrl} pageNo={1} scale={1} playState={PLAYSTATE.live} pens={pens} ref={pageRef} />
      </div >
    </div>
  );
};

export default Home;
