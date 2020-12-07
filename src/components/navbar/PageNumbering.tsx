import React from 'react';
import '../../styles/main.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';

const PageTooltip = withStyles((theme: Theme) => ({
  tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 240,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
  },
}))(Tooltip);

class pageNumbering extends React.Component {
  render() {
    return (
      // <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
      <React.Fragment>
        <button id="btn_prevpage" type="button" className="btn btn-neo " title="Previous page">
          <PageTooltip placement="top" title={
            <React.Fragment>
                <Typography color="inherit">Pre Page</Typography>
                <em>{"현재 필기 중인 페이지를, 앞쪽 페이지로 이동시킵니다."}</em>
                <br></br>
                <b>{"키보드 버튼 Page Up으로 이동 가능합니다"}</b>
            </React.Fragment>
                }>
            <div className="c2">
              <img src='../../icons/icon_prev_n.png' className="normal-image"></img>
              <img src='../../icons/icon_prev_p.png' className="hover-image"></img>
            </div>
          </PageTooltip>
        </button>
        <input type="text" className="form-control-plaintext form-control-sm neo-form-pdf-number" placeholder=".form-control-sm"
            value="Page:" readOnly />
        <input id="curr_page_num" type="text" className="form-control form-control-sm neo-form-pdf-number"
            placeholder=".form-control-sm" value=" " />
        <input id="page_count" type="text" className="form-control-plaintext form-control-sm neo-form-pdf-number"
            placeholder=".form-control-sm" value="/" readOnly />
        <button id="btn_nextpage" type="button" className="btn btn-neo " title="Next page">
        <PageTooltip placement="top" title={
          <React.Fragment>
                <Typography color="inherit">Next Page</Typography>
                <em>{"현재 필기 중인 페이지를, 뒤쪽 페이지로 이동시킵니다."}</em>
                <br></br>
                <b>{"키보드 버튼 Page Down으로 이동 가능합니다"}</b>
            </React.Fragment>
                }>
            <div className="c2">
                <img src='../../icons/icon_next_n.png' className="normal-image"></img>
                <img src='../../icons/icon_next_p.png' className="hover-image"></img>
            </div>
          </PageTooltip>
        </button>
      </React.Fragment>
    )
  }
}

export default pageNumbering;