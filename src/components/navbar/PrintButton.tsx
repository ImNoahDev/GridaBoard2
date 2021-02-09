import React, {useEffect} from 'react';
import '../../styles/main.css';
import GridaToolTip from '../../styles/GridaToolTip';
import { PrintNcodedPdfButton } from '../../nl-lib/ncodepod';
import { turnOnGlobalKeyShortCut } from '../../GridaBoard/GlobalFunctions';

type Props = {
  targetId: string,
  url: string,
  filename: string,
  handlePdfUrl?: any,
}

const PrintButton = (props: Props) => {
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
          <div className="c2">
            <img src='/icons/icon_print_n.png' className="normal-image"></img>
            <img src='/icons/icon_print_p.png' className="hover-image"></img>
          </div>
        </GridaToolTip>
      </PrintNcodedPdfButton>
    </React.Fragment>
    // </div>
  )
}

export default PrintButton;
