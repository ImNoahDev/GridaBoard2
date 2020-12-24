import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import ThemeManager from "../../styles/ThemeManager";
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';
import GridaToolTip from "../../styles/GridaToolTip";

const themeManager: ThemeManager = ThemeManager.getInstance();

export default class BackgroundButton extends React.Component {
  render() {
    return (
      <div className="btn-group dropright" role="group">
        <button type="button" id="btn_background" className="btn btn-neo btn-neo-vertical"
          data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <GridaToolTip open={true} placement="left" tip={{
              head: "Background",
              msg: "화면의 배경색을 선택합니다.",
              tail: "키보드 버튼 1로 선택 가능합니다"
            }} title={undefined}>
            <div className="c2">
              <img src="../../icons/icon_background_n.png" className="normal-image"></img>
              <img src="../../icons/icon_background_p.png" className="hover-image"></img>
            </div>
          </GridaToolTip>
        </button>

        <div className="dropdown-menu p-0 border border-0 " aria-labelledby="btn_background">
          {/* <a className="dropdown-item" href="#"> */}

          <a id="btn_bg_gd" className="dropdown-item" href="#" onClick={() => themeManager.setT1()}>
            <div className="c2">
              <img src="../../icons/icon_bg_gd01_n.png" className="normal-image"></img>
              <img src="../../icons/icon_bg_gd01_p.png" className="hover-image"></img>
              <span className="bg-dropmenu">Gurodong</span>
            </div>
          </a>

          <a id="btn_bg_avan" className="dropdown-item" href="#" onClick={() => themeManager.setT2()}>
            <div className="c2">
              <img src="../../icons/icon_bg_gd02_n.png" className="normal-image"></img>
              <img src="../../icons/icon_bg_gd02_p.png" className="hover-image"></img>
              <span className="bg-dropmenu">Aubergine</span>
            </div>
          </a>

          <a id="btn_bg_white" className="dropdown-item" href="#" onClick={() => themeManager.setT4()}>
            <div className="c2">
              <img src="../../icons/icon_bg_wh_n.png" className="normal-image"></img>
              <img src="../../icons/icon_bg_wh_p.png" className="hover-image"></img>
              <span className="bg-dropmenu">White</span>
            </div>
          </a>

          <a id="btn_bg_black" className="dropdown-item" href="#" onClick={() => themeManager.setT5()}>
            <div className="c2">
              <img src="../../icons/icon_bg_bk_n.png" className="normal-image"></img>
              <img src="../../icons/icon_bg_bk_p.png" className="hover-image"></img>
              <span className="bg-dropmenu">Black</span>
            </div>
          </a>
          {/* </a> */}
        </div>
      </div>
    );
  }
}