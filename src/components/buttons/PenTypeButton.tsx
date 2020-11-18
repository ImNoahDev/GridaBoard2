import React, { Component, useState } from "react";
import '../../styles/buttons.css';

export default class PenTypeButton extends React.Component {
  render() {
    return (
      <React.Fragment>
            <button id="btn_brush" disabled type="button" title="Pen type"
                className="bind-popover btn btn-neo btn-neo-vertical" data-toggle="dropdown" aria-haspopup="true"
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
        </React.Fragment>
    );
  }
}