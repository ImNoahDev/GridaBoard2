import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ManualCalibration from "../../components/navbar/ManualCalibration";
import PrintButton from "../../components/navbar/PrintButton";
import GridaToolTip from "../../styles/GridaToolTip";
import ColorButtons from "../../components/navbar/ColorButtons";
import { RootState } from "../../store/rootReducer";
import GridaDoc from "../GridaDoc";
import { FileBrowserButton } from "../../nl-lib/common/neopdf";
import { IFileBrowserReturn } from "../../nl-lib/common/structures";
import { g_defaultPrintOption } from "../../nl-lib/ncodepod";

import { Button, ButtonGroup } from "@material-ui/core";
import SavePdfDialog from "../Save/SavePdfDialog";
import {saveGrida} from "../Save/SaveGrida";
import LoadGrida from "../Load/LoadGrida";
import { PDFDocument } from 'pdf-lib';


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
  //pdf file name을 설정하는건 사용자가 지정한 gridaboard 이름이어야 함. 미지정시에는 '그리다보드1'
  //store에 따로 가지고 있어야 한다

  // const [pdfUrl, pdfFilename] = useSelector((state: RootState) => {
  //   return [state.activePage.url, state.activePage.filename];
  // });
  
  const makePdfUrl = async () => {
    const doc = GridaDoc.getInstance();
    const docPages = doc.pages;

    let pdfUrl, pdfDoc = undefined;

    for (const page of docPages)
    {
      if (page.pdf === undefined) {
        //ncode page일 경우
        if (pdfDoc === undefined) {
          pdfDoc = await PDFDocument.create();
        }
  
        const pdfPage = await pdfDoc.addPage();
        if (page._rotation === 90 || page._rotation === 270) {
          const tmpWidth = pdfPage.getWidth();
          pdfPage.setWidth(pdfPage.getHeight());
          pdfPage.setHeight(tmpWidth);
        }
      } 
      else {
        //pdf인 경우 
        if (pdfUrl !== page.pdf.url) { 
          pdfUrl = page.pdf.url;
          const existingPdfBytes = await fetch(page.pdf.url).then(res => res.arrayBuffer());
          let pdfDocSrc = await PDFDocument.load(existingPdfBytes);
  
          if (pdfDoc !== undefined) {
            //ncode 페이지가 미리 생성돼서 그 뒤에다 붙여야하는 경우
            const srcLen = pdfDocSrc.getPages().length;
            let totalPageArr = [];
            for (let i = 0; i<srcLen; i++) {
              totalPageArr.push(i);
            }
  
            const copiedPages = await pdfDoc.copyPages(pdfDocSrc, totalPageArr);
  
            for (const copiedPage of copiedPages) {
              await pdfDoc.addPage(copiedPage);
            }
          } else {
            pdfDoc = pdfDocSrc;
          }
        } else {
          continue;
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    const url = await URL.createObjectURL(blob);
    return url;
  }

  return (
    <div style={localStyle}>
      <nav id="colornav" className="navRoot" style={navStyle}>
        <div className="navbar-menu d-flex justify-content-start align-items-end neo_shadow ">
          <Button id="btn_menu" type="button" className="btn btn-neo" style={buttonStyle} onClick={hideAndShowFnc}>
            <GridaToolTip open={true} placement="top-end" tip={{
              head: "Hide And Show",
              msg: "전체 메뉴를 숨기고 보여줍니다.",
              tail: "키보드 버튼 1로 선택 가능합니다"
            }} title={undefined}>
              <div className="c2">
                <img style={menuStyle} src='./icons/all_menu.png' className="normal-image" alt=""></img>
                <img style={menuStyle} src='./icons/all_menu.png' className="hover-image" alt=""></img>
              </div>
            </GridaToolTip>
          </Button>
          <div id="color_bar" className="color_bar neo_shadow bottom_text" style={{float: "left"}}>
            <ColorButtons />
          </div>
        </div>

        <div id="navbar_center" style={{marginLeft: "220px"}}>          
          <ButtonGroup className="navbar-menu neo_shadow" style={centerStyle}>   
            <PrintButton targetId={printBtnId} url={pdfUrl} filename={pdfFilename} handlePdfUrl={makePdfUrl}/>
            <FileBrowserButton handlePdfOpen={handlePdfOpen} />
            <button id="read_mapping_info" className="btn btn-neo" style={{marginLeft: "-5px"}}>
              <SavePdfDialog />
            </button>
            <button onClick={() => saveGrida('hello.grida')}>
              그리다 저장
            </button>
            <LoadGrida />
          </ButtonGroup>
        </div>

        <div id="navbar_end">
          <div className="navbar-menu neo_shadow" style={endStyle}>
            <ManualCalibration url={pdfUrl} filename={pdfFilename} printOption={printOption} />
          </div>
        </div>
      </nav>
    </div>
  );
}

export default ButtonLayerBottom;