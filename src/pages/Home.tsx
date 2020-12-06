import React, { useState } from "react";
import { PLAYSTATE, MixedPageView } from "../neosmartpen";
import { Button, Box } from "@material-ui/core";

import {
  //PenEvent,
  NeoSmartpen, NoteserverClient, PenEventName
} from "../neosmartpen";
import { FileBrowserButton } from "../NcodePrintLib";

const PDF_URL = "./2020학년도 서울대학교 수시모집 일반전형 면접 및 구술고사 문항.pdf";



const getNoteInfo = (event) => {
  // let url = "http://nbs.neolab.net/v1/notebooks/attributes?device=android";
  let note_info = new NoteserverClient();
  note_info.getNoteInfo({});
};



let _pens = new Array(0);
let tempPens = new Array(0);
let _num_pens = 0;

const Home = () => {
  // const useForceUpdate = () => useState()[1];
  // const forceUpdate = useForceUpdate();

  // const classes = useStyles();
  const [num_pens, setNumPens] = useState(0);
  const [pens, setPens] = useState(new Array(0));
  const [pdfUrl, setUrl] = useState(PDF_URL);


  /**
   * @param {{pen:NeoSmartpen, mac:string, event:PenEvent}} e
   */
  const onPenConnected = (e) => {
    const pen = e.pen;
    console.log(`Home: onPenConnected, mac=${pen.getMac()}`);
    _pens.push(pen);

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

      tempPens.push(new_pen);
    }
  };

  // 이 함수에서 pdf를 연다
  const onFileOpen = (event) => {
    console.log(event.url)
    setUrl(event.url);
  };

  return (
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
          <FileBrowserButton variant="contained" color="primary" callback={onFileOpen}>
            <Box fontSize={14} fontWeight="fontWeightBold" >PDF열기</Box>
          </FileBrowserButton>
        </div>


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

      <MixedPageView pdfUrl={pdfUrl} pageNo={1} scale={1} playState={PLAYSTATE.live} pens={pens} />
    </div >
  );
};

export default Home;
