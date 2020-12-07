import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';
import ThemeManager from "../../styles/ThemeManager";

const FullscreenTooltip = withStyles((theme: Theme) => ({
  tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 240,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
  },
}))(Tooltip);

export default class FullScreenButton extends React.Component {
  render() {
    return (
      <button id="btn_fullscreen" type="button" className="btn btn-neo btn-neo-vertical" title="Fullscreen"
      onClick = {() => ThemeManager.getInstance().toggleFullScreen()}>
          <FullscreenTooltip placement="left" title={
          <React.Fragment>
              <Typography color="inherit">Fullscreen</Typography>
              <em>{"전체 화면으로 표시합니다. "}</em>
              <br></br>
              <b>{"돌아가려면 [ESC]키를 눌러야 합니다."}</b>
          </React.Fragment>
              }>
          <div className="c2">
              <img src="../../icons/icon_fullscreen_n.png" className="normal-image"></img>
              <img src="../../icons/icon_fullscreen_p.png" className="hover-image"></img>
          </div>
        </FullscreenTooltip>
      </button>
      );
  }
}