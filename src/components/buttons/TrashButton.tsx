import React, { Component, useState } from "react";
import '../../styles/buttons.css';

export default class TrashButton extends React.Component {
  render() {
    return (
      <button id="btn_trash" type="button" title="Clear" className="btn btn-neo btn-neo-dropdown">
        <div className="c2">
            <img src= { require("../../icons/icon_trash_n.png") } className="normal-image"></img>
            <img src= { require("../../icons/icon_trash_p.png") } className="hover-image"></img>
        </div>
     </button> 
      );
  }
}