import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ManualCalibration from "../../components/navbar/ManualCalibration";
import PageNumbering from "../../components/navbar/PageNumbering";
import PrintButton from "../../components/navbar/PrintButton";
import GridaToolTip from "../../styles/GridaToolTip";
import ColorButtons from "../../components/navbar/ColorButtons";
import { RootState } from "../../store/rootReducer";
import GridaDoc from "../GridaDoc";
import { FileBrowserButton } from "../../nl-lib/common/neopdf";
import { IFileBrowserReturn } from "../../nl-lib/common/structures";
import { g_defaultPrintOption } from "../../nl-lib/ncodepod";

import { Button, ButtonGroup } from "@material-ui/core";

import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import SaveIcon from '@material-ui/icons/Save';
import { savePDF } from "../Save/SavePdf";



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
  padding: '4px',
}

const hideAndShowStyle = {
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'end',
  height: '36px',
  minWidth: '36px',
  outline: 'none',
  textDecoration: 'none'
}

const buttonStyle = {
  padding: "0px",
  margin: "0px",
  border: "0px",
  minWidth: "24px"
}

const centerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '36px',
  minWidth: '36px',
  outline: 'none',
  textDecoration: 'none'
}

const endStyle = {
  display: 'flex',
  justifyContent: 'end',
  alignItems: 'end',
  height: '36px',
  minWidth: '36px',
  outline: 'none',
  textDecoration: 'none'
}

const navStyle = {
  position: 'fixed',
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 1030
} as React.CSSProperties;


function hideAndShowFnc() {
  const colorMenu = document.getElementById('color_bar');
  const leftMenu = document.getElementById('leftmenu');
  const navPage = document.getElementById('navbar_page');
  const navCenter = document.getElementById('navbar_center');
  const navEnd = document.getElementById('navbar_end');

  if (colorMenu.style.display === 'none' && navCenter.style.display === 'none'
    && navEnd.style.display === 'none' && leftMenu.style.display) {
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
  // const [pens, setPens] = useState(new Array(0) as INeoSmartpen[]);

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
      <nav id="colornav" className="navRoot" style={navStyle}>
        {/* <div className="d-inline-flex p-2 bd-highlight"> */}
        <div className="navbar-menu d-flex justify-content-start align-items-end neo_shadow ">
          <Button id="btn_menu" type="button" className="btn btn-neo" style={buttonStyle} onClick={hideAndShowFnc}>
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
          </Button>
          <div id="color_bar" className="color_bar neo_shadow bottom_text" style={{float: "left"}}>
            <ColorButtons />
          </div>
        </div>

        {/* <div id="navbar_page">
          <div className="navbar-menu neo_shadow" style={centerStyle}>
            <PageNumbering />
          </div>
        </div> */}

        <div id="navbar_center" style={{marginLeft: "220px"}}>          
          <ButtonGroup className="navbar-menu neo_shadow" style={centerStyle}>   
            <PrintButton targetId={printBtnId} url={pdfUrl} filename={pdfFilename} />
            <FileBrowserButton handlePdfOpen={handlePdfOpen} />
            <button id="read_mapping_info" className="btn btn-neo" onClick={() => savePDF(pdfUrl, 'hello.pdf')}>
              <PictureAsPdfIcon />
            </button>
          </ButtonGroup>
        </div>

        <div id="navbar_end">
          <div className="navbar-menu neo_shadow" style={endStyle}>
            <ManualCalibration url={pdfUrl} filename={pdfFilename} printOption={printOption} />
          </div>
        </div>

        {/* </div> */}
      </nav>
    </div>
  );
}

export default ButtonLayerBottom;