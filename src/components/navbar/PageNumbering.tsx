import React from 'react';
import '../../styles/main.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';
import GridaToolTip from '../../styles/GridaToolTip';

class pageNumbering extends React.Component {
  render() {
    return (
      // <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
      <React.Fragment>
        <button id="btn_prevpage" type="button" className="btn btn-neo ">
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
        </button>
        <input type="text" className="form-control-plaintext form-control-sm neo-form-pdf-number"
          placeholder=".form-control-sm" readOnly
          defaultValue="Page:" />

        <input id="curr_page_num" type="text" className="form-control form-control-sm neo-form-pdf-number"
          placeholder=".form-control-sm"
          defaultValue=" " />

        <input id="page_count" type="text" className="form-control-plaintext form-control-sm neo-form-pdf-number"
          placeholder=".form-control-sm" readOnly
          defaultValue="/" />

        <button id="btn_nextpage" type="button" className="btn btn-neo ">
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
        </button>
      </React.Fragment>
    )
  }
}

export default pageNumbering;