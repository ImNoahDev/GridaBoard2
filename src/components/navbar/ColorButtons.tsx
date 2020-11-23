import React from 'react';
import '../../styles/main.css';
import PenManager from "../../neosmartpen/pencomm/PenManager";
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';

const PenColorTooltip = withStyles((theme: Theme) => ({
    tooltip: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 240,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}))(Tooltip);

class penColor extends React.Component {
  manager: PenManager = PenManager.getInstance();
  render() {
    return (
        // <div className="color_bar neo_shadow float-left bottom_text color_bar">
        <React.Fragment>
          <div className="btn-group-vertical">
              <button id="pen_info_btn" type="button" disabled className="btn btn-neo" title="Status">
                  <div className="c2 disabled state_0">
                      <img src={require('../../icons/icon_pen_n.png')} className="state_0 normal-image" />
                      <img src={require('../../icons/icon_pen_p.png')} className="state_0 hover-image"></img>

                      <img src={require('../../icons/icon_highlight_n.png')} className="state_1 normal-image"></img>
                      <img src={require('../../icons/icon_highlight_p.png')} className="state_1 hover-image"></img>

                      <img src={require('../../icons/icon_eraser_n.png')} className="state_2 normal-image"></img>
                      <img src={require('../../icons/icon_eraser_p.png')} className="state_2 hover-image"></img>

                      <span id="thickness_num_bottom" className="thickness-badge badge badge-pill badge-secondary">2</span>
                  </div>
              </button>
          </div>
          <div className="btn-group">
              <button id="clr_1" type="button" className="btn btn-neo color_btn othercolors" title="color 1" 
               onClick={() => this.manager.setColor(1)}>
                  <PenColorTooltip placement="top" title={
                        <React.Fragment>
                            <Typography color="inherit">Pen Color [White]</Typography>
                            <em>{"표시되는 펜의 색상을 선택합니다"}</em>
                            <br></br>
                            <b>{"키보드 버튼 1로 선택 가능합니다"}</b>
                        </React.Fragment>
                    }>
                        <div className="color_icon color_1">
                        </div>
                    </PenColorTooltip>
              </button>

              <button id="clr_2" type="button" className="btn btn-neo color_btn" title="Pen color"
              onClick={() => this.manager.setColor(2)}>
                  <PenColorTooltip placement="top" title={
                        <React.Fragment>
                            <Typography color="inherit">Pen Color [Black]</Typography>
                            <em>{"표시되는 펜의 색상을 선택합니다"}</em>
                            <br></br>
                            <b>{"키보드 버튼 2로 선택 가능합니다"}</b>
                        </React.Fragment>
                    }>
                        <div className="color_icon color_2">
                        </div>
                    </PenColorTooltip>
              </button>
              <button id="clr_3" type="button" className="btn btn-neo color_btn othercolors" title="color 3"
              onClick={() => this.manager.setColor(3)}>
                  <PenColorTooltip placement="top" title={
                        <React.Fragment>
                            <Typography color="inherit">Pen Color [Nobel]</Typography>
                            <em>{"표시되는 펜의 색상을 선택합니다"}</em>
                            <br></br>
                            <b>{"키보드 버튼 3로 선택 가능합니다"}</b>
                        </React.Fragment>
                    }>
                        <div className="color_icon color_3">
                        </div>
                    </PenColorTooltip>
              </button>
              <button id="clr_4" type="button" className="btn btn-neo color_btn othercolors" title="color 4"
              onClick={() => this.manager.setColor(4)}>
                  <PenColorTooltip placement="top" title={
                        <React.Fragment>
                            <Typography color="inherit">Pen Color [Gorse]</Typography>
                            <em>{"표시되는 펜의 색상을 선택합니다"}</em>
                            <br></br>
                            <b>{"키보드 버튼 4로 선택 가능합니다"}</b>
                        </React.Fragment>
                    }>
                        <div className="color_icon color_4">
                        </div>
                    </PenColorTooltip>
              </button>
              <button id="clr_5" type="button" className="btn btn-neo  color_btn othercolors" title="color 5"
              onClick={() => this.manager.setColor(5)}>
                  <PenColorTooltip placement="top" title={
                        <React.Fragment>
                            <Typography color="inherit">Pen Color [Lightning Yellow]</Typography>
                            <em>{"표시되는 펜의 색상을 선택합니다"}</em>
                            <br></br>
                            <b>{"키보드 버튼 5로 선택 가능합니다"}</b>
                        </React.Fragment>
                    }>
                        <div className="color_icon color_5">
                        </div>
                    </PenColorTooltip>
              </button>
              <button id="clr_6" type="button" className="btn btn-neo  color_btn othercolors" title="color 6"
              onClick={() => this.manager.setColor(6)}>
                  <PenColorTooltip placement="top" title={
                        <React.Fragment>
                            <Typography color="inherit">Pen Color [Red Damask]</Typography>
                            <em>{"표시되는 펜의 색상을 선택합니다"}</em>
                            <br></br>
                            <b>{"키보드 버튼 6로 선택 가능합니다"}</b>
                        </React.Fragment>
                    }>
                        <div className="color_icon color_6">
                        </div>
                    </PenColorTooltip>
              </button>
              <button id="clr_7" type="button" className="btn btn-neo  color_btn othercolors" title="color 7"
              onClick={() => this.manager.setColor(7)}>
                  <PenColorTooltip placement="top" title={
                        <React.Fragment>
                            <Typography color="inherit">Pen Color [Bright Turquoise]</Typography>
                            <em>{"표시되는 펜의 색상을 선택합니다"}</em>
                            <br></br>
                            <b>{"키보드 버튼 7로 선택 가능합니다"}</b>
                        </React.Fragment>
                    }>
                        <div className="color_icon color_7">
                        </div>
                    </PenColorTooltip>
              </button>
              <button id="clr_8" type="button" className="btn btn-neo  color_btn othercolors" title="color 8"
              onClick={() => this.manager.setColor(8)}>
                  <PenColorTooltip placement="top" title={
                        <React.Fragment>
                            <Typography color="inherit">Pen Color [Niagara]</Typography>
                            <em>{"표시되는 펜의 색상을 선택합니다"}</em>
                            <br></br>
                            <b>{"키보드 버튼 8로 선택 가능합니다"}</b>
                        </React.Fragment>
                    }>
                        <div className="color_icon color_8">
                        </div>
                    </PenColorTooltip>
              </button>
              <button id="clr_9" type="button" className="btn btn-neo  color_btn othercolors" title="color 9"
              onClick={() => this.manager.setColor(9)}>
                  <PenColorTooltip placement="top" title={
                        <React.Fragment>
                            <Typography color="inherit">Pen Color [Cerise Red]</Typography>
                            <em>{"표시되는 펜의 색상을 선택합니다"}</em>
                            <br></br>
                            <b>{"키보드 버튼 9로 선택 가능합니다"}</b>
                        </React.Fragment>
                    }>
                        <div className="color_icon color_9">
                        </div>
                    </PenColorTooltip>
              </button>
              <button id="clr_0" type="button" className="btn btn-neo color_btn othercolors" title="color 0"
              onClick={() => this.manager.setColor(0)}>
                  <PenColorTooltip placement="top" title={
                        <React.Fragment>
                            <Typography color="inherit">Pen Color [Purple Heart]</Typography>
                            <em>{"표시되는 펜의 색상을 선택합니다"}</em>
                            <br></br>
                            <b>{"키보드 버튼 0로 선택 가능합니다"}</b>
                        </React.Fragment>
                    }>
                        <div className="color_icon color_0">
                        </div>
                    </PenColorTooltip>
              </button>
          </div>
      {/* </div> */}
      </React.Fragment>
    )
  }
}

export default penColor;