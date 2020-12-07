import React, { Component, useState } from "react";
import '../../styles/buttons.css';

import icon_zoom_n from "../../icons/icon_zoom_n.png";
import icon_zoom_p from "../../icons/icon_zoom_p.png";
export default class ZoomButton extends React.Component {
  render() {
    return (
      <button id="btn_zoom" type="button" disabled className="btn btn-neo has-badge" title="Zoom" data-container="body"
          data-toggle="popover" data-placement="left" data-trigger="focus" data-html="true"
          data-target="#my-popover-content">
          <div className="c2 disabled">
              <img src={ icon_zoom_n } className="normal-image"></img>
              <img src={ icon_zoom_p } className="hover-image"></img>
          </div>
          <span id="zoom-ratio" className="zoom-badge badge badge-pill badge-info">100%</span>
      </button>
      );
  }
}