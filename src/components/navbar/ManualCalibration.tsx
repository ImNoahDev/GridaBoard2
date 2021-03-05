import React from 'react';
import '../../styles/main.css';
import { NeoImage } from '../CustomElement/NeoImage';
import GridaToolTip from '../../styles/GridaToolTip';
import { IPrintOption } from '../../nl-lib/common/structures';
import { CalibrationButton } from '../../nl-lib/ncodepod';
import { Button } from '@material-ui/core';


const style = {
  width: '36px',
  height: '36px',
  padding: '4px'
}

const mappingStyle = {
  display: "flex",
  position: "static",
  width: "7vw",
  height: "4vh",
  flexDirection: "row",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.5)",
  border: "1px solid #CFCFCF",
  boxSizing: "border-box",
  // boxShadow: "2px 0px 24px rgba(255,255,255,0.5)",
  borderRadius: "4px",
  // float: "left",
  fontSize: "1.4vh"
  // marginTop: "2px",
  // marginRight: "33px"
} as React.CSSProperties;

type Props = {
  url: string,
  filename: string,
  printOption: IPrintOption,
  cancelCallback?: (e) => void,
}

const ManualCalibration = (props: Props) => {
  const { url, filename, printOption, cancelCallback, ...rest } = props;

  return (
    <CalibrationButton {...props} cancelCallback={cancelCallback} style={{marginRight: "33px"}}>
      <GridaToolTip open={true} placement="left-end" tip={{
        head: "인쇄된 페이지 수동 등록",
        msg: "Ncode A4에 인쇄된 페이지를 프로그램에 수동 등록합니다.",
        tail: "단축키 Q로 선택가능합니다."
      }} title={undefined}>
        <Button style={mappingStyle}>nCode 맵핑</Button>
      </GridaToolTip>
    </CalibrationButton>
  )
}

export default ManualCalibration;