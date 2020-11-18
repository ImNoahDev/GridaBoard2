import React, { Component, useState } from "react";
import '../../styles/buttons.css';

export default class FullScreenButton extends React.Component {
  render() {
    return (
      <button id="btn_fullscreen" type="button" className="btn btn-neo btn-neo-vertical" title="Fullscreen">
          <div className="c2">
              <img src={ require("../../icons/icon_fullscreen_n.png") } className="normal-image"></img>
              <img src={ require("../../icons/icon_fullscreen_p.png") } className="hover-image"></img>
          </div>
      </button>
      );
  }
}