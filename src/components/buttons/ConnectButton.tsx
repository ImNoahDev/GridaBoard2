import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';

const ConnectTooltip = withStyles((theme: Theme) => ({
  tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 240,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
  },
}))(Tooltip);

export default class ConnectButton extends React.Component {
  render() {
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
                }>
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
}