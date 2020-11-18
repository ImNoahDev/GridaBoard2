import React, { Component, useState } from "react";
import '../../styles/buttons.css';

export default class FitButton extends React.Component {
  render() {
    return (
    <React.Fragment>
      <div className="btn-group dropright" role="group">
          <button type="button" id="btn_fit" title="Fit" className="btn btn-neo btn-neo-vertical" data-toggle="dropdown"
              aria-haspopup="true" aria-expanded="false">
              <div className="c2">
                  <img src={ require("../../icons/icon_ratio_n.png") } className="normal-image"></img>
                  <img src={ require("../../icons/icon_ratio_p.png") } className="hover-image"></img>
              </div>
          </button>
          <div className="dropdown-menu p-0 border border-0 " aria-labelledby="btn_eraser">
              <a id="btn_fit_width" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={ require("../../icons/icon_fit_width_n.png") } className="normal-image"></img>
                      <img src={ require("../../icons/icon_fit_width_p.png") } className="hover-image"></img>
                      <span className="bg-dropmenu" data-l10n-id="page_scale_width">Fit to width</span>
                  </div>
              </a>
              <a id="btn_fit_height" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={ require("../../icons/icon_fit_height_n.png") } className="normal-image"></img>
                      <img src={ require("../../icons/icon_fit_height_p.png") } className="hover-image"></img>
                      <span className="bg-dropmenu" data-l10n-id="page_scale_fit">Fit to height</span>
                  </div>
              </a>
              <a id="btn_fit_canvas" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={ require("../../icons/icon_fit_canvas_n.png") } className="normal-image"></img>
                      <img src={ require("../../icons/icon_fit_canvas_p.png") } className="hover-image"></img>
                      <span className="bg-dropmenu" data-l10n-id="page_scale_auto">Fit to full page</span>
                  </div>
              </a>
              <a id="btn_fit_paper" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={ require("../../icons/icon_fit_paper_n.png") } className="normal-image"></img>
                      <img src={ require("../../icons/icon_fit_paper_p.png") } className="hover-image"></img>
                      <span className="bg-dropmenu" data-l10n-id="page_scale_actual">Fit to 100%</span>
                  </div>
              </a>
          </div>
      </div>
      </React.Fragment>
    );
  }
}