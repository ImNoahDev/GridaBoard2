import React from 'react';
import '../../styles/main.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';

const PrintTooltip = withStyles((theme: Theme) => ({
  tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 240,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
  },
}))(Tooltip);

class printFunction extends React.Component {
  render() {
    return (
      // <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
      <React.Fragment>
        <button id="btn_print_pdf" type="button" disabled className="btn btn-neo ">
          <PrintTooltip placement="top" title={
            <React.Fragment>
                <Typography color="inherit">Print</Typography>
                <em>{"PDF파일을 프린트하는 버튼입니다."}</em>
                <br></br>
                <b>{"단축키 Q로 선택가능합니다."}</b>
            </React.Fragment>
                }>
            <div className="c2 disabled">
                <img src='../../icons/icon_print_n.png' className="normal-image"></img>
                <img src='../../icons/icon_print_p.png' className="hover-image"></img>
            </div>
          </PrintTooltip>
        </button>
        </React.Fragment>
      // </div>
    )
  }
}

export default printFunction;