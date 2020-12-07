import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';

import icon_ratio_n from "../../icons/icon_ratio_n.png";
import icon_ratio_p from "../../icons/icon_ratio_p.png";
import icon_fit_width_n from "../../icons/icon_fit_width_n.png";
import icon_fit_width_p from "../../icons/icon_fit_width_p.png";
import icon_fit_height_n from "../../icons/icon_fit_height_n.png";
import icon_fit_height_p from "../../icons/icon_fit_height_p.png";
import icon_fit_canvas_n from "../../icons/icon_fit_canvas_n.png";
import icon_fit_canvas_p from "../../icons/icon_fit_canvas_p.png";
import icon_fit_paper_n from "../../icons/icon_fit_paper_n.png";
import icon_fit_paper_p from "../../icons/icon_fit_paper_p.png";

const FitTooltip = withStyles((theme: Theme) => ({
  tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 240,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
  },
}))(Tooltip);

export default class FitButton extends React.Component {
  render() {
    return (
    <React.Fragment>
      <div className="btn-group dropright" role="group">
          <button type="button" id="btn_fit" title="Fit" className="btn btn-neo btn-neo-vertical" data-toggle="dropdown"
              aria-haspopup="true" aria-expanded="false">
              <FitTooltip placement="left" title={
                <React.Fragment>
                    <Typography color="inherit">Fit</Typography>
                    <em>{"용지의 크기를 맞추는 여러 옵션 중 하나를 선택합니다."}</em>
                    <br></br>
                    <b>{"Z 폭 맞춤, X 높이 맞춤, C 전체 페이지, V 100%"}</b>
                </React.Fragment>
                    }>
                <div className="c2">
                  <img src={icon_ratio_n} className="normal-image"></img>
                  <img src={icon_ratio_p} className="hover-image"></img>
                </div>
            </FitTooltip>
          </button>
          <div className="dropdown-menu p-0 border border-0 " aria-labelledby="btn_eraser">
              <a id="btn_fit_width" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={icon_fit_width_n} className="normal-image"></img>
                      <img src={icon_fit_width_p} className="hover-image"></img>
                      <span className="bg-dropmenu" data-l10n-id="page_scale_width">Fit to width</span>
                  </div>
              </a>
              <a id="btn_fit_height" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={icon_fit_height_n} className="normal-image"></img>
                      <img src={icon_fit_height_p} className="hover-image"></img>
                      <span className="bg-dropmenu" data-l10n-id="page_scale_fit">Fit to height</span>
                  </div>
              </a>
              <a id="btn_fit_canvas" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={icon_fit_canvas_n} className="normal-image"></img>
                      <img src={icon_fit_canvas_p} className="hover-image"></img>
                      <span className="bg-dropmenu" data-l10n-id="page_scale_auto">Fit to full page</span>
                  </div>
              </a>
              <a id="btn_fit_paper" className="dropdown-item" href="javascript:void(0)">
                  <div className="c2">
                      <img src={icon_fit_paper_n} className="normal-image"></img>
                      <img src={icon_fit_paper_p} className="hover-image"></img>
                      <span className="bg-dropmenu" data-l10n-id="page_scale_actual">Fit to 100%</span>
                  </div>
              </a>
          </div>
      </div>
      </React.Fragment>
    );
  }
}