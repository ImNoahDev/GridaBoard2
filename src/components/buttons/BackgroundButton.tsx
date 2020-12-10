import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import ThemeManager from "../../styles/ThemeManager";
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';

const themeManager: ThemeManager = ThemeManager.getInstance();

const BackgroundTooltip = withStyles((theme: Theme) => ({
    tooltip: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 240,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}))(Tooltip);

export default class BackgroundButton extends React.Component {
  render() {
    return (
        <div className="btn-group dropright" role="group">
          <button type="button" id="btn_background" className="btn btn-neo btn-neo-vertical"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <BackgroundTooltip placement="left" title={
                <React.Fragment>
                    <Typography color="inherit">Background</Typography>
                    <em>{"화면의 배경색을 선택합니다."}</em>
                    <br></br>
                    <b>{"키보드 버튼 1로 선택 가능합니다"}</b>
                </React.Fragment>
            }>
                <div className="c2">
                  <img src="../../icons/icon_background_n.png" className="normal-image"></img>
                  <img src="../../icons/icon_background_p.png" className="hover-image"></img>
                </div>
            </BackgroundTooltip>
          </button>

          <div className="dropdown-menu p-0 border border-0 " aria-labelledby="btn_background">
            <a className="dropdown-item" href="#">

              <a id="btn_bg_gd" className="dropdown-item" href="javascript:void(0)"
              onClick={() => themeManager.setT1()}>
                  <div className="c2">
                      <img src="../../icons/icon_bg_gd01_n.png" className="normal-image"></img>
                      <img src="../../icons/icon_bg_gd01_p.png" className="hover-image"></img>
                      <span className="bg-dropmenu">Gurodong</span>
                  </div>
              </a>

              <a id="btn_bg_avan" className="dropdown-item" href="javascript:void(0)"
              onClick={() => themeManager.setT2()}>
                  <div className="c2">
                      <img src="../../icons/icon_bg_gd02_n.png" className="normal-image"></img>
                      <img src="../../icons/icon_bg_gd02_p.png" className="hover-image"></img>
                      <span className="bg-dropmenu">Aubergine</span>
                  </div>
              </a>

              <a id="btn_bg_white" className="dropdown-item" href="javascript:void(0)"
              onClick={() => themeManager.setT4()}>
                  <div className="c2">
                      <img src="../../icons/icon_bg_wh_n.png" className="normal-image"></img>
                      <img src="../../icons/icon_bg_wh_p.png" className="hover-image"></img>
                      <span className="bg-dropmenu">White</span>
                  </div>
              </a>

              <a id="btn_bg_black" className="dropdown-item" href="javascript:void(0)" 
              onClick={() => themeManager.setT5()}>
                  <div className="c2">
                      <img src="../../icons/icon_bg_bk_n.png" className="normal-image"></img>
                      <img src="../../icons/icon_bg_bk_p.png" className="hover-image"></img>
                      <span className="bg-dropmenu">Black</span>
                  </div>
              </a>
            </a>  
          </div> 
        </div>
      );
  }
}