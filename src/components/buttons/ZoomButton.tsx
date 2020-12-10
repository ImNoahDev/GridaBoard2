import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';

const PenTypeTooltip = withStyles((theme: Theme) => ({
  tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 240,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
  },
}))(Tooltip);

export default class ZoomButton extends React.Component {
  render() {
    return (
      <button id="btn_zoom" type="button" disabled className="btn btn-neo has-badge" data-container="body"
          data-toggle="popover" data-placement="left" data-trigger="focus" data-html="true"
          data-target="#my-popover-content">
          <PenTypeTooltip placement="left" title={
              <React.Fragment>
                  <Typography color="inherit">Zoom</Typography>
                  <em>{"화면을 키우고 줄이는 버튼입니다."}</em>
                  <br></br>
                  <b>{"단축키 Q로 선택가능합니다."}</b>
              </React.Fragment>
                  }>
              <div className="c2 disabled">
                <img src="../../icons/icon_zoom_n.png" className="normal-image"></img>
                <img src="../../icons/icon_zoom_p.png" className="hover-image"></img>
              </div>
          </PenTypeTooltip>
          <span id="zoom-ratio" className="zoom-badge badge badge-pill badge-info">100%</span>
      </button>
      );
  }
}