import React from 'react';
import '../../styles/main.css';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';
// import { PrintPdfButton } from '../../NcodePrintLib';
import { g_debugFilename, g_debugURL } from '../../NcodePrintLib/DefaultOption';
import PrintNcodedPdfButton from '../../NcodePrintLib/NcodePrint/PrintNcodedPdfButton';
import GridaToolTip from '../../styles/GridaToolTip';

type Props = {
  targetId: string,
  url: string,
  filename: string,
}


const PrintButton = (props: Props) => {
  const startPrint = () => {
    const elem = document.getElementById(props.targetId);
    if (elem && document.createEvent) {
      const evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
    }
  }

  const url = g_debugURL;
  const filename = g_debugFilename;

  return (
    // <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
    <React.Fragment>
      <PrintNcodedPdfButton id="btn_print_pdf" type="button" className="btn btn-neo "
        style={{ margin: 0, padding: 0, }}
        url={props.url} filename={props.filename}>

        <GridaToolTip open={true} placement="top" tip={{
            head: "Print",
            msg: "PDF파일을 프린트하는 버튼입니다.",
            tail: "단축키 Q로 선택가능합니다."
          }} title={undefined}>
          <div className="c2">
            <img src='../../icons/icon_print_n.png' className="normal-image"></img>
            <img src='../../icons/icon_print_p.png' className="hover-image"></img>
          </div>
        </GridaToolTip>
      </PrintNcodedPdfButton>
    </React.Fragment>
    // </div>
  )
}

export default PrintButton;
