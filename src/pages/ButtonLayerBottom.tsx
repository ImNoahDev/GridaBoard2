import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ManualCalibration from "../components/navbar/ManualCalibration";
import PageNumbering from "../components/navbar/PageNumbering";
import PrintButton from "../components/navbar/PrintButton";
import GridaToolTip from "../styles/GridaToolTip";
import ColorButtons from "../components/navbar/ColorButtons";
import { RootState } from "../store/rootReducer";
import GridaDoc from "../GridaBoard/GridaDoc";
import { FileBrowserButton } from "../nl-lib/common/neopdf";
import { IFileBrowserReturn } from "../nl-lib/common/structures";
import { g_defaultPrintOption } from "../nl-lib/ncodepod/DefaultOption";



const localStyle = {
  position: "absolute",
  left: "0px", top: "0px",
  bottom: 0,
  flexDirection: "row-reverse",
  display: "flex",
  alignItems: "center",
  zIndex: 3,
} as React.CSSProperties;


const printBtnId = "printTestButton";
const printOption = g_defaultPrintOption;


const menuStyle = {
  width: '36px',
  height: '36px',
  padding: '4px'
}


function hideAndShowFnc() {
  const colorMenu = document.getElementById('color_bar');
  const leftMenu = document.getElementById('leftmenu');
  const navCenter = document.getElementById('navbar_center');
  const navEnd = document.getElementById('navbar_end');

  if (colorMenu.style.display === 'none' && navCenter.style.display === 'none'
    && navEnd.style.display === 'none' && leftMenu.style.display === 'none') {
    colorMenu.style.display = 'block';
    navCenter.style.display = 'block';
    navEnd.style.display = 'block';
    leftMenu.style.display = 'block';
  } else {
    colorMenu.style.display = 'none';
    navCenter.style.display = 'none';
    navEnd.style.display = 'none';
    leftMenu.style.display = 'none';
  }

}



interface Props {
  handlePdfOpen: (event: IFileBrowserReturn) => void,
}
/**
 *
 */
const ButtonLayerBottom = (props: Props) => {
  const { handlePdfOpen, ...rest } = props;

  // const [num_pens, setNumPens] = useState(0);
  // const [pens, setPens] = useState(new Array(0) as NeoSmartpen[]);

  const [pdfUrl, setPdfUrl] = useState(undefined as string);
  const [pdfFilename, setPdfFilename] = useState(undefined as string);

  const activePageNo = useSelector((state: RootState) => state.activePage.activePageNo);
  useEffect(() => {
    if (activePageNo >= 0) {
      const doc = GridaDoc.getInstance();
      const page = doc.getPageAt(activePageNo)
      setPdfUrl(doc.getPdfUrlAt(activePageNo));
      setPdfFilename(doc.getPdfFilenameAt(activePageNo));
    }
  }, [activePageNo]);


  // const [pdfUrl, pdfFilename] = useSelector((state: RootState) => {
  //   return [state.activePage.url, state.activePage.filename];
  // });


  return (
    <div style={localStyle}>
      <nav id="colornav" className="navbar fixed-bottom navbar-light bg-transparent">
        {/* <div className="d-inline-flex p-2 bd-highlight"> */}
        <div className="navbar-menu d-flex justify-content-start align-items-end neo_shadow ">
          <button id="btn_menu" type="button" className="btn btn-neo " onClick={hideAndShowFnc}>
            <GridaToolTip open={true} placement="top-end" tip={{
              head: "Hide And Show",
              msg: "전체 메뉴를 숨기고 보여줍니다.",
              tail: "키보드 버튼 1로 선택 가능합니다"
            }} title={undefined}>
              <div className="c2">
                <img style={menuStyle} src='../icons/all_menu.png' className="normal-image" alt=""></img>
                <img style={menuStyle} src='../icons/all_menu.png' className="hover-image" alt=""></img>
              </div>
            </GridaToolTip>
          </button>
          <div id="color_bar" className="color_bar neo_shadow float-left bottom_text color_bar">
            <ColorButtons />
          </div>
        </div>

        <div id="navbar_center">
          <div className="navbar-menu d-flex justify-content-center align-items-center neo_shadow">
            <PageNumbering />
            <PrintButton targetId={printBtnId} url={pdfUrl} filename={pdfFilename} />
            <FileBrowserButton handlePdfOpen={handlePdfOpen} />
          </div>
        </div>

        <div id="navbar_end">
          <div className="navbar-menu d-flex justify-content-end align-items-end neo_shadow">
            <ManualCalibration url={pdfUrl} filename={pdfFilename} printOption={printOption} />
          </div>
        </div>

        {/* </div> */}
      </nav>
    </div>
  );
}

export default ButtonLayerBottom;
