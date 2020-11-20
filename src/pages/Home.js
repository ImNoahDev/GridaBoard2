import React, { useState } from "react";
// import { makeStyles } from '@material-ui/core/styles';
import { PenBasedRenderer, PLAYSTATE } from "../neosmartpen";
// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@material-ui/core";
import { Button, Box } from "@material-ui/core";
import NeoPdfViewer from "../neosmartpen/pdf/NeoPdfViewer";

import {
  //PenEvent,
  NeoSmartpen, NoteserverClient, PenEventName
} from "../neosmartpen";



const getNoteInfo = (event) => {
  // let url = "http://nbs.neolab.net/v1/notebooks/attributes?device=android";
  let note_info = new NoteserverClient();
  note_info.getNoteInfo({});
};



let _pens = new Array(0);
let _num_pens = 0;

const Home = () => {
  // const useForceUpdate = () => useState()[1];
  // const forceUpdate = useForceUpdate();

  // const classes = useStyles();
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

    <div id={"home_div"} style={{
      position: "absolute",
      left: "0px", top: "0px",
      flexDirection: "row-reverse", display: "flex",
      width: "100%", height: "100%",
      alignItems: "center",
      zIndex: 1,
    }}>

      <div id={"button_div"}  style={{
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

        <div style={{ flex: 8 }}>
        </div>
      </div>


      {/* <div style={{position:"relative"}}>
        <div style={tempStyle}>
          <NeoPdfViewer url={"./mixed_output.pdf"} />
        </div>
        <div style={tempStyle}>
          <StorageRenderer scale={1} pageId={"0.0.0.0"} playState={PLAYSTATE.live} width={800} height={400} />
        </div>
      </div>  */}


      <div id={"mixed_view"} style={{
        // position: "absolute",
        left: "0px", top: "0px",
        flexDirection: "row-reverse", display: "flex",
        width: "100%", height: "100%",
        alignItems: "center",
        zIndex: 1,
      }}>
        <div id={"pdf_layer"} style={tempStyle}>
          <NeoPdfViewer url={"./mixed_output.pdf"} />
        </div>
        <div id={"ink_layer"} style={tempStyle}>
          <PenBasedRenderer scale={1} pageId={"0.0.0.0"} playState={PLAYSTATE.live} pens={pens} />
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
