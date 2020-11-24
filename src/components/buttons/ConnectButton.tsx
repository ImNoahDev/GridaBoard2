import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';
import PenManager from '../../neosmartpen/pencomm/PenManager'
import {PenEventName,} from '../../neosmartpen';

const ConnectTooltip = withStyles((theme: Theme) => ({
  tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 240,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
  },
}))(Tooltip);

const ConnectButton = (props) => {

  /**
   * @param {{pen:NeoSmartpen, mac:string, event:PenEvent}} e
   */
  const onPenLinkChanged = e => {
    props.onPenLinkChanged(e);
  };

  const handleConnectPen = () => {
    const penManager = PenManager.getInstance();
    let new_pen = penManager.createPen();

    if (new_pen.connect()) {
      new_pen.addEventListener(PenEventName.ON_CONNECTED, onPenLinkChanged);
      new_pen.addEventListener(PenEventName.ON_DISCONNECTED, onPenLinkChanged);
    }
  };

  return (
    <div className="btn-group-vertical neo_shadow" style = {{ marginBottom: 10 }}>
      <button id="btn_connect" type="button" className="btn btn-neo btn-neo-vertical" title="Connect">
      <ConnectTooltip placement="left" title={
          <React.Fragment>
              <Typography color="inherit">Pen Connect</Typography>
              <em>{"블루투스를 통해 펜을 연결합니다. 블루투스 통신이 가능한 환경에서만 동작합니다."}</em>
              <br></br>
              <b>{"Shift + 1~7 각 펜의 내용을 감추기/보이기, P 모든 펜의 획을 감추기/보이기"}</b>
          </React.Fragment>
              } onClick={() => handleConnectPen()}>
          <div className="c2 ">
            <img src={require("../../icons/icon_smartpen_connected_p.png")} className="toggle-off hover-image"></img>
            <img src={require("../../icons/icon_smartpen_disconnected_n.png")} className="toggle-off normal-image"></img>
            <img src={require("../../icons/icon_smartpen_connected_n.png")} className="toggle-on normal-image"></img>
            <img src={require("../../icons/icon_smartpen_disconnected_p.png")} className="toggle-on hover-image"></img>

            <span id="pen_id" className="pen-badge badge badge-pill badge-light">0/0</span>
          </div>
        </ConnectTooltip>
      </button>
    </div>
  );
}

export default ConnectButton;