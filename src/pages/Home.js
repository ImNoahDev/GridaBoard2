import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { StorageRenderer, PenBasedRenderer, PLAYSTATE } from "../neosmartpen";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@material-ui/core";
import { Button, Box } from "@material-ui/core";
import NeoPdfViewer from "../neosmartpen/pdf/NeoPdfViewer";
import UpperNav from '../components/navbar/UpperNav';

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
import Canvas from '../components/view/Canvas';
import ColorButtons from '../components/navbar/ColorButtons';
import PageNumbering from '../components/navbar/PageNumbering';
import PrintButton from '../components/navbar/PrintButton';
import FileLoad from '../components/navbar/FileLoad';
import CalibrationMenual from '../components/navbar/CalibrationMenual';

import {
  //PenEvent,
  NeoSmartpen, NeopenInterface, InkStorage, paperInfo, NoteserverClient, PenEventName
} from "../neosmartpen";



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

const Home = () => {
  const useForceUpdate = () => useState()[1];
  const forceUpdate = useForceUpdate();

  const classes = useStyles();
  const [num_pens, setNumPens] = useState(0);
  const [pens, setPens] = useState(new Array(0));


  /**
   * @param {{pen:NeoSmartpen, mac:string, event:PenEvent}} e
   */
  const onPenConnected = (e) => {
    const pen = e.pen;
    console.log(`Home: onPenConnected, mac=${pen.getMac()}`);

    setPens([..._pens]);

    _num_pens++;
    setNumPens(_num_pens);
  };

  /**
   * @param {{pen:NeoSmartpen, mac:string, event:PenEvent}} e
   */
  const onPenDisonnected = (e) => {
    const pen = e.pen;
    const mac = pen.getMac();
    console.log(`Home: OnPenDisconnected, mac=${pen.getMac()}`);

    const index = _pens.findIndex(p => p.getMac() === mac);

    if (index > -1) {
      _pens.splice(index, 1);
      setPens([..._pens]);

      _num_pens--;
      setNumPens(_num_pens);
    }
  };

  /**
   * @param {*} event
   */
  const handleConnectPen = (event) => {
    let new_pen = new NeoSmartpen();

    if (new_pen.connect()) {
      new_pen.addEventListener(PenEventName.ON_CONNECTED, onPenConnected);
      new_pen.addEventListener(PenEventName.ON_DISCONNECTED, onPenDisonnected);

      _pens.push(new_pen);
    }
  };

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

      <div>
        <Canvas />
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
        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
          <Button variant="outlined" color="primary" onClick={(event) => handleConnectPen(event)} >
            <Box fontSize={14} fontWeight="fontWeightBold" >Connect</Box>
          </Button>
        </div>
        <div style={{ flex: 1 }}></div>

        <div style={{ fontSize: "20px", fontWeight: "bold" }}>
          Pen Connected: {num_pens}
        </div>

        <div style={{ flex: 8 }}>
        </div>
      </div>
      
      <nav id="colornav" className="navbar fixed-bottom navbar-light bg-transparent">
        <ColorButtons />
        <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
          <PageNumbering />
          <PrintButton />
          <FileLoad />
        </div>
        <CalibrationMenual />
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
                <ConnectButton/>
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
