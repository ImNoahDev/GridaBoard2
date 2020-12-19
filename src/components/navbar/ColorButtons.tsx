import React from 'react';
import '../../styles/main.css';
import PenManager from "../../neosmartpen/pencomm/PenManager";
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';
import GridaToolTip from '../../styles/GridaToolTip';

const manager: PenManager = PenManager.getInstance();

const ColorButtons = () => {

  return (
    // <div className="color_bar neo_shadow float-left bottom_text color_bar">
    <React.Fragment>
      <div className="btn-group">
        <button id="clr_1" type="button" className="btn btn-neo color_btn othercolors"
          onClick={() => manager.setColor(1)}>
          <GridaToolTip placement="top" title={
            <React.Fragment>
              <Typography color="inherit">Pen Color [RED]</Typography>
              <em>{"표시되는 펜의 색상을 선택합니다"}</em>
              <br></br>
              <b>{"키보드 버튼 1로 선택 가능합니다"}</b>
            </React.Fragment>
          }>
            <div className="color_icon color_1">
            </div>
          </GridaToolTip>
        </button>

        <button id="clr_2" type="button" className="btn btn-neo color_btn"
          onClick={() => manager.setColor(2)}>
          <GridaToolTip placement="top" title={
            <React.Fragment>
              <Typography color="inherit">Pen Color [YELLOW]</Typography>
              <em>{"표시되는 펜의 색상을 선택합니다"}</em>
              <br></br>
              <b>{"키보드 버튼 2로 선택 가능합니다"}</b>
            </React.Fragment>
          }>
            <div className="color_icon color_2">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_3" type="button" className="btn btn-neo color_btn othercolors"
          onClick={() => manager.setColor(3)}>
          <GridaToolTip placement="top" title={
            <React.Fragment>
              <Typography color="inherit">Pen Color [NAVY]</Typography>
              <em>{"표시되는 펜의 색상을 선택합니다"}</em>
              <br></br>
              <b>{"키보드 버튼 3로 선택 가능합니다"}</b>
            </React.Fragment>
          }>
            <div className="color_icon color_3">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_4" type="button" className="btn btn-neo color_btn othercolors"
          onClick={() => manager.setColor(4)}>
          <GridaToolTip placement="top" title={
            <React.Fragment>
              <Typography color="inherit">Pen Color [BLACK]</Typography>
              <em>{"표시되는 펜의 색상을 선택합니다"}</em>
              <br></br>
              <b>{"키보드 버튼 4로 선택 가능합니다"}</b>
            </React.Fragment>
          }>
            <div className="color_icon color_4">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_5" type="button" className="btn btn-neo  color_btn othercolors"
          onClick={() => manager.setColor(5)}>
          <GridaToolTip placement="top" title={
            <React.Fragment>
              <Typography color="inherit">Pen Color [LIGHT_GRAY]</Typography>
              <em>{"표시되는 펜의 색상을 선택합니다"}</em>
              <br></br>
              <b>{"키보드 버튼 5로 선택 가능합니다"}</b>
            </React.Fragment>
          }>
            <div className="color_icon color_5">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_6" type="button" className="btn btn-neo  color_btn othercolors"
          onClick={() => manager.setColor(6)}>
          <GridaToolTip placement="top" title={
            <React.Fragment>
              <Typography color="inherit">Pen Color [ORANGE]</Typography>
              <em>{"표시되는 펜의 색상을 선택합니다"}</em>
              <br></br>
              <b>{"키보드 버튼 6로 선택 가능합니다"}</b>
            </React.Fragment>
          }>
            <div className="color_icon color_6">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_7" type="button" className="btn btn-neo  color_btn othercolors"
          onClick={() => manager.setColor(7)}>
          <GridaToolTip placement="top" title={
            <React.Fragment>
              <Typography color="inherit">Pen Color [GREEN]</Typography>
              <em>{"표시되는 펜의 색상을 선택합니다"}</em>
              <br></br>
              <b>{"키보드 버튼 7로 선택 가능합니다"}</b>
            </React.Fragment>
          }>
            <div className="color_icon color_7">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_8" type="button" className="btn btn-neo  color_btn othercolors"
          onClick={() => manager.setColor(8)}>
          <GridaToolTip placement="top" title={
            <React.Fragment>
              <Typography color="inherit">Pen Color [BLUE]</Typography>
              <em>{"표시되는 펜의 색상을 선택합니다"}</em>
              <br></br>
              <b>{"키보드 버튼 8로 선택 가능합니다"}</b>
            </React.Fragment>
          }>
            <div className="color_icon color_8">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_9" type="button" className="btn btn-neo  color_btn othercolors"
          onClick={() => manager.setColor(9)}>
          <GridaToolTip placement="top" title={
            <React.Fragment>
              <Typography color="inherit">Pen Color [PURPLE]</Typography>
              <em>{"표시되는 펜의 색상을 선택합니다"}</em>
              <br></br>
              <b>{"키보드 버튼 9로 선택 가능합니다"}</b>
            </React.Fragment>
          }>
            <div className="color_icon color_9">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_0" type="button" className="btn btn-neo color_btn othercolors"
          onClick={() => manager.setColor(0)}>
          <GridaToolTip placement="top" title={
            <React.Fragment>
              <Typography color="inherit">Pen Color [DARK_GRAY]</Typography>
              <em>{"표시되는 펜의 색상을 선택합니다"}</em>
              <br></br>
              <b>{"키보드 버튼 0로 선택 가능합니다"}</b>
            </React.Fragment>
          }>
            <div className="color_icon color_0">
            </div>
          </GridaToolTip>
        </button>
      </div>
      {/* </div> */}
    </React.Fragment>
  );
}
export default ColorButtons;