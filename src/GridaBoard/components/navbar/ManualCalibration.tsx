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
  const { filename, printOption, cancelCallback, className, ...rest } = props;
  const classes = useStyle();

  let addedClassName = `${className} ${classes.textStyle}`
  return (
    <CalibrationButton {...props} className={addedClassName} cancelCallback={cancelCallback} style={{marginRight: "33px"}} handlePdfUrl={props.handlePdfUrl} />
  )
}

export default ManualCalibration;