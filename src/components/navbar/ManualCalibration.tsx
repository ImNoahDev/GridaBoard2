import React from 'react';
import '../../styles/main.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';
import CalibrationButton from '../dialogs/CalibrationDialog';
import { IPrintOption } from '../../NcodePrintLib';
import { NeoImage } from '../CustomElement/NeoImage';
import GridaToolTip from '../../styles/GridaToolTip';


const style = {
  width: '36px',
  height: '36px',
  padding: '4px'
}
type Props = {
  url: string,
  filename: string,
  printOption: IPrintOption,
  cancelCallback: (e) => void,
}

const ManualCalibration = (props: Props) => {
  const { ...rest } = props;

  return (
    <CalibrationButton {...rest} id="btn_start_calibration" type="button" className="btn btn-neo" >
      <GridaToolTip placement="left-end" title={
        <React.Fragment>
          <Typography color="inherit">인쇄된 페이지 수동 등록</Typography>
          <em>{"Ncode A4에 인쇄된 페이지를 프로그램에 수동 등록합니다."}</em>
          <br></br>
          <b>{"단축키 Q로 선택가능합니다."}</b>
        </React.Fragment>
      }>
        <div><NeoImage style={style} src='../../icons/icon_calibration_n.png' /></div>
        {/* <div className="c2">
          <img style={style} src='../../icons/icon_calibration_n.png' className="normal-image"></img>
          <img style={style} src='../../icons/icon_calibration_p.png' className="hover-image"></img>
        </div> */}
      </GridaToolTip>
    </CalibrationButton>
  )
}

export default ManualCalibration;