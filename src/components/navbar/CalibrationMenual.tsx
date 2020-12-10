import React from 'react';
import '../../styles/main.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';

const CalibrationMenualTooltip = withStyles((theme: Theme) => ({
  tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 240,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
  },
}))(Tooltip);

const style = {
  width: '36px',
  height: '36px',
  padding: '4px'
}

class ManualCalibration extends React.Component {
  render() {
    return (
          <button id="btn_start_calibration" disabled type="button" className="btn btn-neo">
            <CalibrationMenualTooltip placement="left-end" title={
              <React.Fragment>
                  <Typography color="inherit">Calibration Menual</Typography>
                  <em>{"화면 페이지를 지정해주는 설명서 버튼입니다."}</em>
                  <br></br>
                  <b>{"단축키 Q로 선택가능합니다."}</b>
              </React.Fragment>
                  }>
              <div className="c2 disabled">
                <img style={style} src='../../icons/icon_calibration_n.png' className="normal-image"></img>
                <img style={style} src='../../icons/icon_calibration_p.png' className="hover-image"></img>
              </div>
            </CalibrationMenualTooltip>
          </button>
    )
  }
}

export default ManualCalibration;