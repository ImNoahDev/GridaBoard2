/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";

import '../../styles/buttons.css';
import { IconButton, SvgIcon } from '@material-ui/core';
import GridaToolTip from "../../styles/GridaToolTip";
import { useSelector } from "react-redux";
import { RootState } from "../../store/rootReducer";
import PenManager from "../../../nl-lib/neosmartpen/PenManager";
import { PenEventName } from "../../../nl-lib/common/enums";
import { INeoSmartpen } from "../../../nl-lib/common/neopen";
import $ from "jquery";

const numPenStyle = {
  position: "absolute",
  width: "16px",
  height: "16px",
  left: "22px",
  top: "4px",
  background: "rgba(88,98,125,1)",
  borderRadius: "50px",
} as React.CSSProperties;

const numPenCountStyle = {
    position: "absolute",
    // width: "7px",
    // height: "13px",
    left: "4px",
    top: "2px",
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: "normal",
    fontSize: "8px",
    lineHeight: "13px",
    // display: "flex",
    // alignItems: "center",
    // textAlign: "right",
    // letterSpacing: "0.25px",
    color: "rgba(255,255,255,1)"
} as React.CSSProperties;

type Props = {
  onPenLinkChanged: (e) => void;
}
const ConnectButton = (props: Props) => {
  let connectDisplayProp: string = "block";
  let connectedDisplayProp: string= "none";

  const [numPens, setNumPens] = useState(0);
  const numPens_store = useSelector((state: RootState) => state.appConfig.num_pens);

  useEffect(() => {
    setNumPens(numPens_store);
  }, [numPens_store]);

  const onPenLinkChanged = e => {
    props.onPenLinkChanged(e);
  };

  const handleConnectPen = () => {
    const penManager = PenManager.getInstance();
    const new_pen: INeoSmartpen = penManager.createPen();

    if (new_pen.connect()) {
      new_pen.addEventListener(PenEventName.ON_CONNECTED, onPenLinkChanged);
      new_pen.addEventListener(PenEventName.ON_DISCONNECTED, onPenLinkChanged);
    }
  };

  if (numPens_store > 0) {
    connectDisplayProp = "none";
    connectedDisplayProp = "block";
  } else {
    connectDisplayProp = "block";
    connectedDisplayProp = "none";
  }
  
  $('#btn_connect').hover(function() {
    $(this).css("color", "rgba(104,143,255,1)")
  },function() {
    $(this).css("color", "rgba(18,18,18,1)")
  });

  $('#btn_connected').hover(function() {
    $(this).css("color", "rgba(104,143,255,1)")
  },function() {
    $(this).css("color", "rgba(18,18,18,1)")
  });

  return (
    <React.Fragment>
      <IconButton id="btn_connect" style={{display: connectDisplayProp, padding: "8px"}}
        onClick={() => handleConnectPen()}>
        {/* <GridaToolTip open={true} placement="left" tip={{
          head: "Pen Connect",
          msg: "블루투스를 통해 펜을 연결합니다. 블루투스 통신이 가능한 환경에서만 동작합니다.",
          tail: "Shift + 1~7 각 펜의 내용을 감추기/보이기, P 모든 펜의 획을 감추기/보이기"
        }} title={undefined}> */}
          <SvgIcon>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.997 19.488A10.978 10.978 0 0022 11c0-.99-.13-1.949-.376-2.861a5.518 5.518 0 01-1.754 1.326c.085.499.13 1.012.13 1.535a8.975 8.975 0 01-2.84 6.561 3.18 3.18 0 00-3.09-2.435 2.268 2.268 0 01-2.268-2.268v-1.647a2.312 2.312 0 00-1.837-2.262V7.677l-1.118-3.08a.302.302 0 00-.285-.197.3.3 0 00-.284.197L7.18 7.677v1.299a2.147 2.147 0 00-1.58 2.07v7.155a9 9 0 016.935-16.07A5.518 5.518 0 0113.861.375l-.112-.03A11.02 11.02 0 0011 0C4.925 0 0 4.925 0 11a10.996 10.996 0 0011 11 10.952 10.952 0 006.997-2.512zM7.6 19.336A8.974 8.974 0 0011 20a8.96 8.96 0 004.248-1.064v-.632c0-.65-.528-1.178-1.178-1.178a4.268 4.268 0 01-4.268-4.268v-1.647a.31.31 0 00-.31-.311H7.745a.146.146 0 00-.146.146v8.29z"
            />
              <path
                d="M17.5 0a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2.077a.346.346 0 00-.346.346v1.73h-1.73l-.024.002a.346.346 0 00.023.691h1.731V6.6a.346.346 0 00.692-.023V4.846H19.6a.346.346 0 00-.023-.692h-1.73v-1.73l-.002-.024a.346.346 0 00-.345-.323z"
              />
          </SvgIcon>
        {/* </GridaToolTip> */}
      </IconButton>
      <IconButton id="btn_connected" style={{display: connectedDisplayProp, padding: "8px"}}
        onClick={() => handleConnectPen()}>
        {/* <GridaToolTip open={true} placement="left" tip={{
          head: "Pen Connect",
          msg: "블루투스를 통해 펜을 연결합니다. 블루투스 통신이 가능한 환경에서만 동작합니다.",
          tail: "Shift + 1~7 각 펜의 내용을 감추기/보이기, P 모든 펜의 획을 감추기/보이기"
        }} title={undefined}> */}
          <SvgIcon>
            <path
              style={{background: "rgba(88,98,125,1)"}}
              fillRule="evenodd"
              clipRule="evenodd"
              d="M18.997 20.488A10.978 10.978 0 0023 12c0-6.075-4.925-11-11-11S1 5.925 1 12a10.996 10.996 0 0011 11 10.968 10.968 0 006.997-2.512zm-2.749-.552A8.96 8.96 0 0112 21a8.974 8.974 0 01-3.4-.664v-8.29c0-.08.065-.146.146-.146h1.745c.172 0 .311.14.311.31v1.648a4.268 4.268 0 004.268 4.268c.65 0 1.178.527 1.178 1.178v.632zm1.913-1.375a3.18 3.18 0 00-3.091-2.435 2.268 2.268 0 01-2.268-2.268v-1.647a2.312 2.312 0 00-1.837-2.262V8.677l-1.118-3.08a.302.302 0 00-.285-.197.3.3 0 00-.284.197L8.18 8.677v1.299a2.147 2.147 0 00-1.58 2.07v7.155a9 9 0 1111.56-.64z"
            />
          </SvgIcon>
        {/* </GridaToolTip> */}
        <div style={numPenStyle}>
          <span id="pen_id" style={numPenCountStyle}>{numPens}</span>
        </div>

      </IconButton>
    </React.Fragment>
  );
}

export default ConnectButton;