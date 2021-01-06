import React from 'react';
import '../../styles/main.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { InputBase, Theme, Typography, withStyles } from '@material-ui/core';
import GridaToolTip from '../../styles/GridaToolTip';
import Button from '@material-ui/core/Button';

class PageNumbering extends React.Component {

  inputStyle = {
    padding: "0px",
    margin: "0px",
    border: "0px",
    minWidth: "24px",
    fontSize: "14px"
  }

  buttonStyle = {
    minWidth: "36px",
    padding: "0px"
  }
  render() {
    return (
      // <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
      <React.Fragment>
        <Button id="btn_prevpage" type="button" className="btn btn-neo" style={this.buttonStyle}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pre Page",
              msg: "현재 필기 중인 페이지를, 앞쪽 페이지로 이동시킵니다.",
              tail: "키보드 버튼 Page Up으로 이동 가능합니다"
            }} title={undefined}>
            <div className="c2">
              <img src='../../icons/icon_prev_n.png' className="normal-image"></img>
              <img src='../../icons/icon_prev_p.png' className="hover-image"></img>
            </div>
          </GridaToolTip>
        </Button>
        <InputBase type="text" className="neo-form-pdf-number" style={this.inputStyle}
          placeholder=".form-control-sm" readOnly
          defaultValue="Page:" />

        <InputBase id="curr_page_num" type="text" className="neo-form-pdf-number" style={this.inputStyle}
          placeholder=".form-control-sm"
          defaultValue=" " />

        <InputBase id="page_count" type="text" className="neo-form-pdf-number" style={this.inputStyle}
          placeholder=".form-control-sm" readOnly
          defaultValue="/" />

        <Button id="btn_nextpage" type="button" className="btn btn-neo" style={this.buttonStyle}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Next Page",
              msg: "현재 필기 중인 페이지를, 뒤쪽 페이지로 이동시킵니다.",
              tail: "키보드 버튼 Page Down으로 이동 가능합니다"
            }} title={undefined}>
            <div className="c2">
              <img src='../../icons/icon_next_n.png' className="normal-image"></img>
              <img src='../../icons/icon_next_p.png' className="hover-image"></img>
            </div>
          </GridaToolTip>
        </Button>
      </React.Fragment>
    )
  }
}

export default PageNumbering;