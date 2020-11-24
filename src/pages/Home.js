import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { StorageRenderer, PenBasedRenderer, PLAYSTATE } from "../neosmartpen";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@material-ui/core";
import { Button, Box } from "@material-ui/core";
import NeoPdfViewer from "../neosmartpen/pdf/NeoPdfViewer";
import UpperNav from '../components/navbar/UpperNav';

import PenManager from '../neosmartpen/pencomm/PenManager';

import ConnectButton from '../components/buttons/ConnectButton'

import PenTypeButton from '../components/buttons/PenTypeButton'
import TrashButton from '../components/buttons/TrashButton'
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
// import MenuButton from '../components/navbar/MenuButton';

import {
  //PenEvent,
  NeoSmartpen, NeopenInterface, InkStorage, paperInfo, NoteserverClient, PenEventName
} from "../neosmartpen";

const menuStyle = {
  width: '36px',
  height: '36px',
  padding: '4px'
}

function hideAndShowFnc () {
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
  }else {
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




const useStyles = makeStyles({
  table: {
    minWidth: 480,
  },
});

let _pens = new Array(0);
let _num_pens = 0;
let manager = PenManager.getInstance();

const Home = () => {
  const useForceUpdate = () => useState()[1];
  const forceUpdate = useForceUpdate();

  const classes = useStyles();
  const [num_pens, setNumPens] = useState(0);
  const [pens, setPens] = useState(new Array(0));

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

  const tempStyle = {
    position: "absolute",
    height: "100%",
    width: "100%",
    left: "0px",
    top: "0px",
    overflow: "hidden",
  }

  return (
    <div>
      <div>
        <UpperNav />
      </div>

      <div style={{
        position: "absolute",
        display: "flex", flexDirection: "row-reverse",
        alignItems: "center",
        left: "0px", top: "0px",
        width: "100%", height: "40px",
        zIndex: 100,
      }}>
        {/* Connect a pen */}
        {/* <div style={{ fontSize: "20px", fontWeight: "bold" }}>
          <Button variant="outlined" color="primary" onClick={(event) => handleConnectPen(event)} >
            <Box fontSize={14} fontWeight="fontWeightBold" >Connect</Box>
          </Button>
        </div> */}
        <div style={{ flex: 1 }}></div>

        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
          Pen Connected: {num_pens}
        </div>

        <div style={{ flex: 8 }}>
        </div>
      </div>
      
      <nav id="colornav" className="navbar fixed-bottom navbar-light bg-transparent">
        <div className="d-inline-flex p-2 bd-highlight">
          <div className="navbar-menu d-flex justify-content-end align-items-end neo_shadow">
            {/* <MenuButton onClick={hideAndShowFnc} /> */}
            <button id="btn_menu" type="button" className="btn btn-neo " title="Open a menu" onClick={hideAndShowFnc}>
              <div className="c2">
                <img style={menuStyle} src={require('../icons/all_menu.png')} className="normal-image"></img>
                <img style={menuStyle} src={require('../icons/all_menu.png')} className="hover-image"></img>
              </div>
            </button>
          </div>
          <div id="color_bar" className="color_bar neo_shadow float-left bottom_text color_bar">
            <ColorButtons />
          </div>
        </div>
        <div id="navbar_center">
          <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
            <PageNumbering />
            <PrintButton />
            <FileLoad />
          </div>
        </div>
        <div id="navbar_end">
          <div className="navbar-menu d-flex justify-content-end align-items-end neo_shadow">
            <CalibrationMenual />
          </div>
        </div>
      </nav>
      {/* <div>
        <BottomNav />
      </div> */}

      {/* <div style={{position:"relative"}}>
        <div style={tempStyle}>
          <NeoPdfViewer url={"./mixed_output.pdf"} />
        </div>
        <div style={tempStyle}>
          <StorageRenderer scale={1} pageId={"0.0.0.0"} playState={PLAYSTATE.live} width={800} height={400} />
        </div>
      </div>  */}

      <div style={{
        // position: "absolute",
        left: "0px", top: "0px",
        flexDirection: "row-reverse", display: "flex",
        width: "100%", height: "40px",
        alignItems: "center",
        zIndex: 1,
      }}>
        <div class="d-flex flex-column h-100">
        <div style={tempStyle}>
          <NeoPdfViewer url={"./mixed_output.pdf"} />
        </div>
        
        <div id="leftmenu" class="main-container flex-grow-1">
            <div id="menu-wide" class="d-flex menu-container float-left h-100">
              <div className="d-flex flex-column justify-content-between" style = {{zIndex: 1030}}>
                <ConnectButton onPenLinkChanged={e => onPenLinkChanged(e)} />
                <div className="btn-group-vertical neo_shadow" style = {{ marginBottom: 10 }}>
                  <div className="btn-group dropright" role="group">
                    <PenTypeButton/>
                  </div>
                  <TrashButton/><RotateButton/><BackgroundButton/>
                </div>
                <div class="btn-group-vertical neo_shadow" style = {{ marginBottom: 10 }}>
                  <FitButton/><ZoomButton/><FullScreenButton/>
                </div>
                <div class="btn-group-vertical neo_shadow" style = {{ marginBottom: 10 }}>
                  <TracePointButton/>
                </div>
              </div>
            </div>
        </div>

        <div style={tempStyle}>
          <PenBasedRenderer scale={1} pageId={"0.0.0.0"} playState={PLAYSTATE.live} pens={pens} />
        </div>
        </div>
      </div>

      {/* <TableContainer component={Paper}>
        <Table className={classes.table} size="small" aria-label="a dense table">
          <TableBody>
            <TableRow key={1}>
              <TableCell component="th" scope="row">
                <StorageRenderer scale={1} pageId={"0.0.0.0"} playState={PLAYSTATE.live} width={800} height={400} />
              </TableCell>

              <TableCell component="th" scope="row">
                <PenBasedRenderer scale={1} pageId={"0.0.0.0"} playState={PLAYSTATE.live} width={800} height={400} pens={pens} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer> */}

    </div >
  );
};

export default Home;
