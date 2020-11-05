import React from "react";
// import React, { Component } from 'react';
import PropTypes from "prop-types";
import { InkStorage, PenEventName } from "../..";

import PenBasedRenderWorker, { ZoomFitEnum } from "./StorageRenderWorker";
import { Paper } from "@material-ui/core";
import { NeoSmartpen, PenManager } from "../../index";

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}




/**
 * TO DO: 2020/11/05 
 *    1)  Pen에서 Event를 받아 실시간 rendering만 하는 component로 만들것
 * 
 */
class PenBasedRenderer extends React.Component {
}