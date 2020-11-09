import React, { useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { StorageRenderer, PenBasedRenderer } from "../neosmartpen";
import { PLAYSTATE } from "../neosmartpen/renderer/pageviewer/StorageRenderer";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@material-ui/core";
import { Button, Box } from "@material-ui/core";

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

      _pens.push( new_pen );
    }
  };

  return (
    <div>
      <hr />
      <h1> Pen Connected: {num_pens}</h1>
      {/* Connect a pen */}
      <Button variant="outlined" color="primary" onClick={(event) => handleConnectPen(event)} >
        <Box fontSize={16} fontWeight="fontWeightBold" >Connect</Box>
      </Button>

      <TableContainer component={Paper}>
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
      </TableContainer>


    </div>
  );
};

export default Home;
