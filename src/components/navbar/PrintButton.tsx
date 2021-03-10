import React, {useEffect} from 'react';
import '../../styles/main.css';
import GridaToolTip from '../../styles/GridaToolTip';
import { PrintNcodedPdfButton } from '../../nl-lib/ncodepod';
import { turnOnGlobalKeyShortCut } from '../../GridaBoard/GlobalFunctions';
import { Button } from '@material-ui/core';
import $ from "jquery";

type Props = {
  targetId: string,
  url: string,
  filename: string,
  handlePdfUrl?: any,
}

const buttonStyle = {
  // width: "53px",
  height: "1.6vh",
  left: "0.8vw",
  fontFamily: "Roboto",
  fontStyle: "normal",
  fontWeight: "normal",
  fontSize: "1.44vh",
  // lineHeight: "16px",
  textAlign: "right",
  letterSpacing: "0.25px",
  marginRight: "2vw"
} as React.CSSProperties;

const PrintButton = (props: Props) => {

  $('#print').hover(function() {
    $(this).css("color", "rgba(104,143,255,1)")
  },function() {
    $(this).css("color", "rgba(18,18,18,1)")
  })

  return (
    // <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
    <React.Fragment>
      <PrintNcodedPdfButton
        id="btn_print_pdf" type="button" className="btn btn-neo "
        handkeTurnOnAppShortCutKey={turnOnGlobalKeyShortCut}
        style={{ margin: 0, padding: 0, }}
        url={props.url} filename={props.filename} handlePdfUrl={props.handlePdfUrl}>
        <GridaToolTip open={true} placement="top" tip={{
          head: "Print",
          msg: "PDF파일을 프린트하는 버튼입니다.",
          tail: "단축키 Q로 선택가능합니다."
        }} title={undefined}>
          <Button id="print" style={buttonStyle}>
            프린트
          </Button>
        </GridaToolTip>
      </PrintNcodedPdfButton>
    </React.Fragment>
    // </div>
  )
}

export default PrintButton;
