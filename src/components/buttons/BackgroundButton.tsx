import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import ThemeManager from "../../styles/ThemeManager";

const themeManager: ThemeManager = ThemeManager.getInstance();

export default class BackgroundButton extends React.Component {
  render() {
    return (
        <div className="btn-group dropright" role="group">
          <button type="button" id="btn_background" title="Backgrounds" className="btn btn-neo btn-neo-vertical"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <div className="c2">
                  <img src={require("../../icons/icon_background_n.png")} className="normal-image"></img>
                  <img src={require("../../icons/icon_background_p.png")} className="hover-image"></img>
              </div>
          </button>

          <div className="dropdown-menu p-0 border border-0 " aria-labelledby="btn_background">
            <a className="dropdown-item" href="#">

              <a id="btn_bg_gd" className="dropdown-item" href="javascript:void(0)"
              onClick={() => themeManager.setT1()}>
                  <div className="c2">
                      <img src={require("../../icons/icon_bg_gd01_n.png")} className="normal-image"></img>
                      <img src={require("../../icons/icon_bg_gd01_p.png")} className="hover-image"></img>
                      <span className="bg-dropmenu">Gurodong</span>
                  </div>
              </a>

              <a id="btn_bg_avan" className="dropdown-item" href="javascript:void(0)"
              onClick={() => themeManager.setT2()}>
                  <div className="c2">
                      <img src={require("../../icons/icon_bg_gd02_n.png")} className="normal-image"></img>
                      <img src={require("../../icons/icon_bg_gd02_p.png")} className="hover-image"></img>
                      <span className="bg-dropmenu">Aubergine</span>
                  </div>
              </a>

              <a id="btn_bg_white" className="dropdown-item" href="javascript:void(0)"
              onClick={() => themeManager.setT4()}>
                  <div className="c2">
                      <img src={require("../../icons/icon_bg_wh_n.png")} className="normal-image"></img>
                      <img src={require("../../icons/icon_bg_wh_p.png")} className="hover-image"></img>
                      <span className="bg-dropmenu">White</span>
                  </div>
              </a>

              <a id="btn_bg_black" className="dropdown-item" href="javascript:void(0)" 
              onClick={() => themeManager.setT5()}>
                  <div className="c2">
                      <img src={require("../../icons/icon_bg_bk_n.png")} className="normal-image"></img>
                      <img src={require("../../icons/icon_bg_bk_p.png")} className="hover-image"></img>
                      <span className="bg-dropmenu">Black</span>
                  </div>
              </a>
            </a>  
          </div> 
        </div>
      );
  }
}