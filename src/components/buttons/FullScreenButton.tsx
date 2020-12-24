import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';
import ThemeManager from "../../styles/ThemeManager";
import { NeoImage } from "../CustomElement/NeoImage";
import GridaToolTip from "../../styles/GridaToolTip";

export default class FullScreenButton extends React.Component {
  render() {
    return (
      <button id="btn_fullscreen" type="button" className="btn btn-neo btn-neo-vertical"
        onClick={() => ThemeManager.getInstance().toggleFullScreen()}>
        <GridaToolTip open={true} placement="left" tip={{
            head: "Fullscreen",
            msg: "전체 화면으로 표시합니다. ",
            tail: "돌아가려면 [ESC]키를 눌러야 합니다."
          }} title={undefined}>
          <div><NeoImage src="../../icons/icon_fullscreen_n.png" /></div>
          {/* <div className="c2">
              <img src="../../icons/icon_fullscreen_n.png" className="normal-image"></img>
              <img src="../../icons/icon_fullscreen_p.png" className="hover-image"></img>
          </div> */}
        </GridaToolTip>
      </button>
    );
  }
}