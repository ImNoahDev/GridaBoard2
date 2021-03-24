import React from 'react';
import '../../styles/main.css';
import GridaToolTip from '../../styles/GridaToolTip';
import { IPrintOption } from '../../../nl-lib/common/structures';
import { CalibrationButton } from '../../../nl-lib/ncodepod';
import { Button } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';

const mappingStyle = {
  // display: "flex",
  // width: "140px",
  // height: "30px",
  justifyContent: "center",
  background: "rgba(255, 255, 255, 0.5)",
  border: "1px solid #CFCFCF",
  boxSizing: "border-box",
  borderRadius: "4px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
} as React.CSSProperties;

const mappingTextStyle = {
  // width: "80px",
  // height: "14px",
  fontSize: "12px",
  lineHeight: "14px",
  color: '#666666',
  // marginLeft: "-40px"
  // margin: "8px"
} as React.CSSProperties;

type Props = {
  filename: string,
  printOption: IPrintOption,
  handlePdfUrl?: any,
  cancelCallback?: (e) => void,
}

const ManualCalibration = (props: Props) => {
  const { filename, printOption, cancelCallback, ...rest } = props;

  const activePageNo_store = useSelector((state: RootState) => state.activePage.activePageNo);
  let disabled = true;
  if (activePageNo_store !== -1) {
    disabled = false;
  }

  return (
    <CalibrationButton {...props} cancelCallback={cancelCallback} style={{marginRight: "33px"}} handlePdfUrl={props.handlePdfUrl}>
      {/* <GridaToolTip open={true} placement="left-end" tip={{
        head: "인쇄된 페이지 수동 등록",
        msg: "Ncode A4에 인쇄된 페이지를 프로그램에 수동 등록합니다.",
        tail: "단축키 Q로 선택가능합니다."
      }} title={undefined}> */}
        <div>
          <Button style={mappingStyle} disabled={disabled}>
            <span style={mappingTextStyle}>인쇄 페이지 순서 등록</span>
          </Button>
        </div>
      {/* </GridaToolTip> */}
    </CalibrationButton>
  )
}

export default ManualCalibration;