import React from 'react';
import '../../styles/main.css';
import GridaToolTip from '../../styles/GridaToolTip';
import { PrintNcodedPdfButton } from '../../../nl-lib/ncodepod';
import { turnOnGlobalKeyShortCut } from '../../GlobalFunctions';
import { Button } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import $ from "jquery";

type Props = {
  targetId: string,
  url: string,
  filename: string,
  handlePdfUrl?: any,
}

const buttonStyle = {
  // width: "80px",
  // height: "16px",
  top: "2px",
  fontFamily: "Roboto",
  fontStyle: "normal",
  fontWeight: "normal",
  fontSize: "14px",
  textAlign: "right",
  letterSpacing: "0.25px",
  marginRight: "8px"
} as React.CSSProperties;

const PrintButton = (props: Props) => {

  $('#print').hover(function() {
    $(this).css("color", "rgba(104,143,255,1)")
  },function() {
    $(this).css("color", "rgba(18,18,18,1)")
  })

  const activePageNo_store = useSelector((state: RootState) => state.activePage.activePageNo);
  let disabled = true;
  if (activePageNo_store !== -1) {
    disabled = false;
  }

  return (
    <React.Fragment>
      <PrintNcodedPdfButton
        id="btn_print_pdf" type="button" className="btn btn-neo "
        handkeTurnOnAppShortCutKey={turnOnGlobalKeyShortCut}
        style={{ margin: 0, padding: 0, }}
        url={props.url} filename={props.filename} handlePdfUrl={props.handlePdfUrl} disabled={disabled}>
        {/* <GridaToolTip open={true} placement="top" tip={{
          head: "Print",
          msg: "PDF파일을 프린트하는 버튼입니다.",
          tail: "단축키 Q로 선택가능합니다."
        }} title={undefined}> */}
          <Button id="print" style={buttonStyle} disabled={disabled}>
            프린트
          </Button>
        {/* </GridaToolTip> */}
      </PrintNcodedPdfButton>
    </React.Fragment>
  )
}

export default PrintButton;
