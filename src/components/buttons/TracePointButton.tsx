import React, { Component, useState } from "react";
import '../../styles/buttons.css';

export default class TracePointButton extends React.Component {
  render() {
    return (
      <button id="btn_tracepoint" type="button" className="btn btn-neo btn-neo-vertical" title="Fullscreen">
          <div className="c2 checked">
              <img src={ require("../../icons/icon_point_d.png") } className="toggle-off normal-image"></img>
              <img src={ require("../../icons/icon_point_p.png") } className="toggle-off hover-image"></img>
              <img src={ require("../../icons/icon_point_n.png") } className="toggle-on normal-image"></img>
              <img src={ require("../../icons/icon_point_p.png") } className="toggle-on hover-image"></img>
          </div>
      </button>
      );
  }
}