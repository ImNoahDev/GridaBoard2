import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';
import GridaToolTip from "../../styles/GridaToolTip";


export default class RotateButton extends React.Component {
  render() {
    return (
      <div className="btn-group dropright" role="group">
        <button type="button" id="btn_rotate" className="btn btn-neo btn-neo-vertical">
          <GridaToolTip open={true} placement="left" tip={{
              head: "Rotate",
              msg: "종이 또는 스마트 플레이트의 입력이 회전되어 반영될지 아닐지를 선택합니다.",
              tail: "TAB 가로쓰기/세로쓰기 전환"
            }} title={undefined}>
            <div className="c2">
              <img src="../../icons/icon_portrait_n.png" className="toggle-off normal-image"></img>
              <img src="../../icons/icon_portrait_p.png" className="toggle-off hover-image"></img>
              <img src="../../icons/icon_landscape_n.png" className="toggle-on normal-image"></img>
              <img src="../../icons/icon_landscape_p.png" className="toggle-on hover-image"></img>
            </div>
          </GridaToolTip>
        </button>
      </div>
    );
  }
}