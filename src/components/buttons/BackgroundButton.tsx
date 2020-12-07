import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import ThemeManager from "../../styles/ThemeManager";

import icon_background_n from "../../icons/icon_background_n.png";
import icon_background_p from "../../icons/icon_background_p.png";
import icon_bg_gd01_n from "../../icons/icon_bg_gd01_n.png";
import icon_bg_gd01_p from "../../icons/icon_bg_gd01_p.png";
import icon_bg_gd02_n from "../../icons/icon_bg_gd02_n.png";
import icon_bg_gd02_p from "../../icons/icon_bg_gd02_p.png";

import icon_bg_wh_n from "../../icons/icon_bg_wh_n.png";
import icon_bg_wh_p from "../../icons/icon_bg_wh_p.png";
import icon_bg_bk_n from "../../icons/icon_bg_bk_n.png";
import icon_bg_bk_p from "../../icons/icon_bg_bk_p.png";


const themeManager: ThemeManager = ThemeManager.getInstance();

export default class BackgroundButton extends React.Component {
  render() {
    return (
        <div className="btn-group dropright" role="group">
          <button type="button" id="btn_background" title="Backgrounds" className="btn btn-neo btn-neo-vertical"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <div className="c2">
                  <img src={icon_background_n} className="normal-image"></img>
                  <img src={icon_background_p} className="hover-image"></img>
              </div>
          </button>

          <div className="dropdown-menu p-0 border border-0 " aria-labelledby="btn_background">
            <a className="dropdown-item" href="#">

              <a id="btn_bg_gd" className="dropdown-item" href="javascript:void(0)"
              onClick={() => themeManager.setT1()}>
                  <div className="c2">
                      <img src={icon_bg_gd01_n} className="normal-image"></img>
                      <img src={icon_bg_gd01_p} className="hover-image"></img>
                      <span className="bg-dropmenu">Gurodong</span>
                  </div>
              </a>

              <a id="btn_bg_avan" className="dropdown-item" href="javascript:void(0)"
              onClick={() => themeManager.setT2()}>
                  <div className="c2">
                      <img src={icon_bg_gd02_n} className="normal-image"></img>
                      <img src={icon_bg_gd02_p} className="hover-image"></img>
                      <span className="bg-dropmenu">Aubergine</span>
                  </div>
              </a>

              <a id="btn_bg_white" className="dropdown-item" href="javascript:void(0)"
              onClick={() => themeManager.setT4()}>
                  <div className="c2">
                      <img src={icon_bg_wh_n} className="normal-image"></img>
                      <img src={icon_bg_wh_p} className="hover-image"></img>
                      <span className="bg-dropmenu">White</span>
                  </div>
              </a>

              <a id="btn_bg_black" className="dropdown-item" href="javascript:void(0)" 
              onClick={() => themeManager.setT5()}>
                  <div className="c2">
                      <img src={icon_bg_bk_n} className="normal-image"></img>
                      <img src={icon_bg_bk_p} className="hover-image"></img>
                      <span className="bg-dropmenu">Black</span>
                  </div>
              </a>
            </a>  
          </div> 
        </div>
      );
  }
}