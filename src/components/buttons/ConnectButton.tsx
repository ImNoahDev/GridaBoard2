import React, { Component, useState } from "react";
import '../../styles/buttons.css';

export default class ConnectButton extends React.Component {
  render() {
    return (
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
      );
  }
}