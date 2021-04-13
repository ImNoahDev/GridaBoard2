import React from 'react';
import '../../styles/main.css';
import GridaToolTip from '../../styles/GridaToolTip';
import { IPrintOption } from '../../../nl-lib/common/structures';
import { CalibrationButton } from '../../../nl-lib/ncodepod';
import { Button, makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import getText from '../../language/language';

const useStyle = makeStyles(theme=>({
  textStyle : {
    fontSize: "12px",
    lineHeight: "14px",
    margin: "8px",
    padding: 0,
    fontWeight: 500,
  }
}))


type Props = {
  filename: string,
  printOption: IPrintOption,
  handlePdfUrl?: any,
  className?:string,
  cancelCallback?: (e) => void,
}

const ManualCalibration = (props: Props) => {
  const { filename, printOption, cancelCallback, ...rest } = props;
  const classes = useStyle();

  return (
    <CalibrationButton {...props} cancelCallback={cancelCallback} style={{marginRight: "33px"}} handlePdfUrl={props.handlePdfUrl}>
      {/* <GridaToolTip open={true} placement="left-end" tip={{
        head: "인쇄된 페이지 수동 등록",
        msg: "Ncode A4에 인쇄된 페이지를 프로그램에 수동 등록합니다.",
        tail: "단축키 Q로 선택가능합니다."
      }} title={undefined}> */}
        <div>
          <span className={classes.textStyle}>{getText("print_reg_pageNo")}</span>
        </div>
      {/* </GridaToolTip> */}
    </CalibrationButton>
  )
}

export default ManualCalibration;