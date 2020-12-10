import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';

const RotateTooltip = withStyles((theme: Theme) => ({
  tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 240,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
  },
}))(Tooltip);

export default class RotateButton extends React.Component {
  render() {
    return (
      <div className="btn-group dropright" role="group">
      <button type="button" id="btn_rotate" className="btn btn-neo btn-neo-vertical">
        <RotateTooltip placement="left" title={
            <React.Fragment>
                <Typography color="inherit">Rotate</Typography>
                <em>{"종이 또는 스마트 플레이트의 입력이 회전되어 반영될지 아닐지를 선택합니다."}</em>
                <br></br>
                <b>{"TAB 가로쓰기/세로쓰기 전환"}</b>
            </React.Fragment>
                }>
            <div className="c2">
              <img src="../../icons/icon_portrait_n.png" className="toggle-off normal-image"></img>
              <img src="../../icons/icon_portrait_p.png" className="toggle-off hover-image"></img>
              <img src="../../icons/icon_landscape_n.png" className="toggle-on normal-image"></img>
              <img src="../../icons/icon_landscape_p.png" className="toggle-on hover-image"></img>
            </div>
        </RotateTooltip>
      </button>
    </div>
      );
  }
}