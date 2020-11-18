import React, { Component, useState } from "react";
import '../../styles/buttons.css';

export default class MenuWide extends React.Component {
  render() {
    return (

    <div className="d-flex flex-column justify-content-between" style = {{zIndex: 1030}}>
      {/* 펜 연결 */}
      <div className="btn-group-vertical neo_shadow" style = {{ marginBottom: 10 }}>
        <button id="btn_connect" type="button" className="btn btn-neo btn-neo-vertical" title="Connect">
          <div className="c2 ">
            <img src={require("../../icons/icon_smartpen_connected_p.png")} className="toggle-off hover-image"></img>
            <img src={require("../../icons/icon_smartpen_disconnected_n.png")} className="toggle-off normal-image"></img>
            <img src={require("../../icons/icon_smartpen_connected_n.png")} className="toggle-on normal-image"></img>
            <img src={require("../../icons/icon_smartpen_disconnected_p.png")} className="toggle-on hover-image"></img>

            <span id="pen_id" className="pen-badge badge badge-pill badge-light">0/0</span>
          </div>
        </button>
      </div>

      <div className="btn-group-vertical neo_shadow" style = {{ marginBottom: 10 }}>
        <div className="btn-group dropright" role="group">
            {/* 펜/형광펜 버튼 */}
            <button id="btn_brush" disabled type="button" title="Pen type"
                class="bind-popover btn btn-neo btn-neo-vertical" data-toggle="dropdown" aria-haspopup="true"
                aria-expanded="false">

                <div className="c2 disabled state_0">
                    <img src={require("../../icons/icon_pen_n.png")} className="state_0 normal-image"></img>
                    <img src={require("../../icons/icon_pen_p.png")} className="state_0 hover-image"></img>

                    <img src={require("../../icons/icon_highlight_n.png")} className="state_1 normal-image"></img>
                    <img src={require("../../icons/icon_highlight_p.png")} className="state_1 hover-image"></img>

                    <img src={require("../../icons/icon_eraser_n.png")} className="state_2 normal-image"></img>
                    <img src={require("../../icons/icon_eraser_p.png")} className="state_2 hover-image"></img>

                    <span id="thickness_num" className="thickness-badge badge badge-pill badge-secondary">2</span>
                </div>

            </button>
            <div className="dropdown-menu dropdown-menu-right p-0 border border-0" aria-labelledby="btn_brush">
                {/* 펜/형광펜 */}
                <div className="btn-group">
                    <button id="btn_pen" type="button" className="btn btn-neo btn-neo-dropdown">
                        <div className="c2">
                            <img src = { require("../../icons/icon_pen_n.png") } className="normal-image"></img>
                            <img src = { require("../../icons/icon_pen_p.png") } className="hover-image"></img>
                        </div>
                    </button>
                    <button id="btn_marker" type="button" className="btn btn-neo btn-neo-dropdown">
                        <div className="c2">
                            <img src= { require("../../icons/icon_highlight_n.png") } className="normal-image"></img>
                            <img src= { require("../../icons/icon_highlight_p.png") } className="hover-image"></img>
                        </div>
                    </button>
                    <button id="btn_eraser" type="button" className="btn btn-neo btn-neo-dropdown">
                        <div className="c2">
                            <img src = { require("../../icons/icon_eraser_n.png") } className="normal-image"></img>
                            <img src = { require("../../icons/icon_eraser_p.png") } className="hover-image"></img>
                        </div>
                    </button>
                </div>

                {/* 선 굵기 */}
                <div className="dropdown-divider"></div>
                <div className="btn-group">
                    <button id="btn_thick_1" type="button" className="btn btn-neo btn-neo-dropdown">
                        <div className="c2">
                            <img src = { require("../../icons/icon_thickness_01_n.png") } className="normal-image"></img>
                            <img src = { require("../../icons/icon_thickness_01_p.png") } className="hover-image"></img>
                        </div>
                    </button>
                    <button id="btn_thick_2" type="button" className="btn btn-neo btn-neo-dropdown">
                        <div className="c2">
                            <img src = { require("../../icons/icon_thickness_02_n.png") } className="normal-image"></img>
                            <img src = { require("../../icons/icon_thickness_02_p.png") } className="hover-image"></img>
                        </div>
                    </button>
                    <button id="btn_thick_3" type="button" className="btn btn-neo btn-neo-dropdown">
                        <div className="c2">
                            <img src = { require("../../icons/icon_thickness_03_n.png") } className="normal-image"></img>
                            <img src = { require("../../icons/icon_thickness_03_p.png") } className="hover-image"></img>
                        </div>
                    </button>
                    <button id="btn_thick_4" type="button" className="btn btn-neo btn-neo-dropdown">
                        <div className="c2">
                            <img src = { require("../../icons/icon_thickness_04_n.png") } className="normal-image"></img>
                            <img src = { require("../../icons/icon_thickness_04_p.png") } className="hover-image"></img>
                        </div>
                    </button>
                    <button id="btn_thick_5" type="button" className="btn btn-neo btn-neo-dropdown">
                        <div className="c2">
                            <img src = { require("../../icons/icon_thickness_05_n.png") } className="normal-image"></img>
                            <img src = { require("../../icons/icon_thickness_05_p.png") } className="hover-image"></img>
                        </div>
                    </button>
                </div>
            </div>
        </div>
        
        {/* Undo/redo 버튼 */}
        <button id="btn_trash" type="button" title="Clear" className="btn btn-neo btn-neo-dropdown">
          <div className="c2">
              <img src= { require("../../icons/icon_trash_n.png") } className="normal-image"></img>
              <img src= { require("../../icons/icon_trash_p.png") } className="hover-image"></img>
          </div>
        </button> 

        {/* 회전선택 */}
        <div className="btn-group dropright" role="group">
          <button type="button" id="btn_rotate" title="Rotate" className="btn btn-neo btn-neo-vertical">
            <div className="c2">
              <img src= { require('../../icons/icon_portrait_n.png') } className="toggle-off normal-image"></img>
              <img src= { require("../../icons/icon_portrait_p.png") } className="toggle-off hover-image"></img>
              <img src= { require("../../icons/icon_landscape_n.png") } className="toggle-on normal-image"></img>
              <img src= { require("../../icons/icon_landscape_p.png") } className="toggle-on hover-image"></img>
            </div>
          </button>
        </div>

        {/* 배경 선택 */}
        <div class="btn-group dropright" role="group">
          <button type="button" id="btn_background" title="Backgrounds" className="btn btn-neo btn-neo-vertical"
              data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <div class="c2">
                  <img src={require("../../icons/icon_background_n.png")} className="normal-image"></img>
                  <img src={require("../../icons/icon_background_p.png")} className="hover-image"></img>
              </div>
          </button>

          <div className="dropdown-menu p-0 border border-0 " aria-labelledby="btn_background">
            <a className="dropdown-item" href="#">

              <a id="btn_bg_gd" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={require("../../icons/icon_bg_gd01_n.png")} className="normal-image"></img>
                      <img src={require("../../icons/icon_bg_gd01_p.png")} className="hover-image"></img>
                      <span className="bg-dropmenu">Gurodong</span>
                  </div>
              </a>

              <a id="btn_bg_avan" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={require("../../icons/icon_bg_gd02_n.png")} className="normal-image"></img>
                      <img src={require("../../icons/icon_bg_gd02_p.png")} className="hover-image"></img>
                      <span className="bg-dropmenu">Aubergine</span>
                  </div>
              </a>

              <a id="btn_bg_white" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={require("../../icons/icon_bg_wh_n.png")} className="normal-image"></img>
                      <img src={require("../../icons/icon_bg_wh_p.png")} className="hover-image"></img>
                      <span className="bg-dropmenu">White</span>
                  </div>
              </a>

              <a id="btn_bg_black" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={require("../../icons/icon_bg_bk_n.png")} className="normal-image"></img>
                      <img src={require("../../icons/icon_bg_bk_p.png")} className="hover-image"></img>
                      <span className="bg-dropmenu">Black</span>
                  </div>
              </a>
            </a>  
          </div> 
        </div>
      </div>

      <div class="btn-group-vertical neo_shadow" style = {{ marginBottom: 10 }}>

      {/* 화면 맞추기 선택 */}
      <div class="btn-group dropright" role="group">
          <button type="button" id="btn_fit" title="Fit" class="btn btn-neo btn-neo-vertical" data-toggle="dropdown"
              aria-haspopup="true" aria-expanded="false">
              <div class="c2">
                  <img src={ require("../../icons/icon_ratio_n.png") } className="normal-image"></img>
                  <img src={ require("../../icons/icon_ratio_p.png") } className="hover-image"></img>
              </div>
          </button>
          <div class="dropdown-menu p-0 border border-0 " aria-labelledby="btn_eraser">
              <a id="btn_fit_width" class="dropdown-item" href="javascript:void(0)">
                  <div class="c2">
                      <img src={ require("../../icons/icon_fit_width_n.png") } className="normal-image"></img>
                      <img src={ require("../../icons/icon_fit_width_p.png") } className="hover-image"></img>
                      <span class="bg-dropmenu" data-l10n-id="page_scale_width">Fit to width</span>
                  </div>
              </a>
              <a id="btn_fit_height" class="dropdown-item" href="javascript:void(0)">
                  <div class="c2">
                      <img src={ require("../../icons/icon_fit_height_n.png") } className="normal-image"></img>
                      <img src={ require("../../icons/icon_fit_height_p.png") } className="hover-image"></img>
                      <span class="bg-dropmenu" data-l10n-id="page_scale_fit">Fit to height</span>
                  </div>
              </a>
              <a id="btn_fit_canvas" class="dropdown-item" href="javascript:void(0)">
                  <div class="c2">
                      <img src={ require("../../icons/icon_fit_canvas_n.png") } className="normal-image"></img>
                      <img src={ require("../../icons/icon_fit_canvas_p.png") } className="hover-image"></img>
                      <span class="bg-dropmenu" data-l10n-id="page_scale_auto">Fit to full page</span>
                  </div>
              </a>
              <a id="btn_fit_paper" class="dropdown-item" href="javascript:void(0)">
                  <div class="c2">
                      <img src={ require("../../icons/icon_fit_paper_n.png") } className="normal-image"></img>
                      <img src={ require("../../icons/icon_fit_paper_p.png") } className="hover-image"></img>
                      <span class="bg-dropmenu" data-l10n-id="page_scale_actual">Fit to 100%</span>
                  </div>
              </a>
          </div>
      </div>


      {/* 확대선택 */}
      <button id="btn_zoom" type="button" disabled class="btn btn-neo has-badge" title="Zoom" data-container="body"
          data-toggle="popover" data-placement="left" data-trigger="focus" data-html="true"
          data-target="#my-popover-content">
          <div class="c2 disabled">
              <img src={ require("../../icons/icon_zoom_n.png") } className="normal-image"></img>
              <img src={ require("../../icons/icon_zoom_p.png") } className="hover-image"></img>
          </div>
          <span id="zoom-ratio" class="zoom-badge badge badge-pill badge-info">100%</span>
      </button>

      {/* 전체 화면 */}
      <button id="btn_fullscreen" type="button" class="btn btn-neo btn-neo-vertical" title="Fullscreen">
          <div class="c2">
              <img src={ require("../../icons/icon_fullscreen_n.png") } className="normal-image"></img>
              <img src={ require("../../icons/icon_fullscreen_p.png") } className="hover-image"></img>
          </div>
      </button>
      </div>

      <div class="btn-group-vertical neo_shadow" style = {{ marginBottom: 10 }}>
      {/* 커서 보이기 */}
      <button id="btn_tracepoint" type="button" class="btn btn-neo btn-neo-vertical" title="Fullscreen">
          <div class="c2 checked">
              <img src={ require("../../icons/icon_point_d.png") } className="toggle-off normal-image"></img>
              <img src={ require("../../icons/icon_point_p.png") } className="toggle-off hover-image"></img>
              <img src={ require("../../icons/icon_point_n.png") } className="toggle-on normal-image"></img>
              <img src={ require("../../icons/icon_point_p.png") } className="toggle-on hover-image"></img>
          </div>
      </button>
      </div>

    </div>
    );
  }
}

