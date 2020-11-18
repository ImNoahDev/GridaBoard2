import React, { Component, useState } from "react";
import '../../styles/buttons.css';

export default class RotateButton extends React.Component {
  render() {
    return (
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
      );
  }
}