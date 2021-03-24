import React, { useEffect, useState } from "react";
import { Button, Popover } from "@material-ui/core";
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import { saveGrida } from "../Save/SaveGrida";
import LoadGrida from "../Load/LoadGrida";
import PrintButton from "../components/navbar/PrintButton";
import GridaDoc from "../GridaDoc";
import { PDFDocument } from 'pdf-lib';
import ConnectButton from "../components/buttons/ConnectButton";
import GridaApp from "../GridaApp";
import ManualCalibration from "../components/navbar/ManualCalibration";
import { g_defaultPrintOption, PrintNcodedPdfButton } from "../../nl-lib/ncodepod";
import $ from "jquery";
import SavePdfDialog from "../Save/SavePdfDialog";
import { FileBrowserButton } from "../../nl-lib/common/neopdf";
import { IFileBrowserReturn } from "../../nl-lib/common/structures";
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import { turnOnGlobalKeyShortCut } from "../GlobalFunctions";


const imgStyle = {
  marginRight: "24px",
  borderRadius: "8px",
} as React.CSSProperties;

const aStyle = {
  width: "110px",
  height: "24px",
  left: "48px",
  fontFamily: "Roboto",
  fontStyle: "normal",
  fontWeight: "bold",
  fontSize: "18px",
  textAlign: "right",
  letterSpacing: "0.25px",
  textDecoration: "none",
  marginRight: "34px"
} as React.CSSProperties;

const buttonStyle = {
  // width: "80px",
  // height: "16px",
  fontFamily: "Roboto",
  fontStyle: "normal",
  fontWeight: "bold",
  fontSize: "14px",
  textAlign: "right",
  letterSpacing: "0.25px",
  marginRight: "8px",
  color: '#121212',
} as React.CSSProperties;

const printBtnId = "printTestButton";
const printOption = g_defaultPrintOption;

interface Props {
  handlePdfOpen: (event: IFileBrowserReturn) => void,
}

const HeaderLayer = (props: Props) => {

  const { handlePdfOpen, ...rest } = props;

  const [pdfUrl, setPdfUrl] = useState(undefined as string);
  const [pdfFilename, setPdfFilename] = useState(undefined as string);

  const makePdfUrl = async () => {
    const doc = GridaDoc.getInstance();
    const docPages = doc.pages;

    let pdfUrl, pdfDoc = undefined;

    for (const page of docPages) {
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
          const pdfDocSrc = await PDFDocument.load(existingPdfBytes);

          if (pdfDoc !== undefined) {
            //ncode 페이지가 미리 생성돼서 그 뒤에다 붙여야하는 경우
            const srcLen = pdfDocSrc.getPages().length;
            const totalPageArr = [];
            for (let i = 0; i < srcLen; i++) {
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

  const onPenLinkChanged = e => {
    const app = GridaApp.getInstance();
    app.onPenLinkChanged(e);
  }

  $('#save').hover(function () {
    $(this).css("color", "rgba(104,143,255,1)")
  }, function () {
    $(this).css("color", "rgba(18,18,18,1)")
  });

  $('#load').hover(function () {
    $(this).css("color", "rgba(104,143,255,1)")
  }, function () {
    $(this).css("color", "rgba(18,18,18,1)")
  });

  $(document).ready(function () {
    $('.save_drop_down').hover(
      function (event) {
        $(this).addClass('hover');
        $(this).css("color", "rgba(104,143,255,1)");
        $(this).css("background", "rgba(232,236,245,1)");
      },
      function () {
        $(this).removeClass('hover');
        $(this).css("color", "rgba(18,18,18,1)");
        $(this).css("background", "rgba(255,255,255,0.9)");
      }
    );
  });
  const activePageNo_store = useSelector((state: RootState) => state.activePage.activePageNo);

  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);

  const headerStyle = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    height: "70px",
    background: "rgba(255, 255, 255, 0.5)",
    zoom: 1 / brZoom,
  } as React.CSSProperties;

  const saveDropdownStyle = {
    display: "none",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "8px",
    position: "absolute",
    width: "220px",
    height: "90px",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
    borderRadius: "12px",
    zIndex: 10000,
  } as React.CSSProperties;

  const loadDropdownStyle = {
    display: "none",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "8px",
    position: "absolute",
    width: "220px",
    height: "90px",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
    borderRadius: "12px",
    zIndex: 10000,
  } as React.CSSProperties;


  console.log(`browser zoom level changed = ${brZoom}`);

  let disabled = true;
  if (activePageNo_store !== -1) {
    disabled = false;
  }

  function handleClickSave() {
    const save = document.getElementById("saveDrop");
    if (save.style.display == 'none') {
      save.style.display = 'block'
    } else {
      save.style.display = 'none'
    }
  }

  function handleClickLoad() {
    const load = document.getElementById("loadDrop");
    if (load.style.display == 'none') {
      load.style.display = 'block'
    } else {
      load.style.display = 'none'
    }
  }

  // alert($('#header').height());

  return (
    <React.Fragment>
      <div id="header" style={headerStyle}>
        <div style={{
          display: "inline-flex", flexDirection: "row",
          justifyContent: "flex-start", alignItems: "center", marginLeft: "24px"
        }}>
          <img src="grida_logo.png" style={imgStyle}></img>
          {/* <a id="grida_board" href="#" style={aStyle}>Grida board</a> */}
          <div>
            <Button id="save" className="saveDropDown" style={buttonStyle} onClick={handleClickSave} disabled={disabled}>
              저장하기
            </Button>
            <div id="saveDrop" className="saveDropDownContent" style={saveDropdownStyle}>
              <SavePdfDialog />
              <Button className="save_drop_down" style={{
                width: "200px", height: "40px", padding: "4px 12px",
              }} 
                onClick={() => saveGrida('hello.grida')}
                // onClick={() => alert('미구현된 기능입니다.')}
              >
                <span style={{marginLeft: "-40px"}}>데이터 저장(.grida)</span>
              </Button>
            </div>
          </div>
          
          <div>
            <Button id="load" className="loadDropDown" style={buttonStyle} onClick={handleClickLoad}>
              불러오기
            </Button>
            <div id="loadDrop" className="loadDropDownContent" style={loadDropdownStyle}>
              <FileBrowserButton handlePdfOpen={handlePdfOpen} />
              <LoadGrida />
            </div>
          </div>

          <PrintNcodedPdfButton
            id="btn_print_pdf" type="button" className="btn btn-neo "
            handkeTurnOnAppShortCutKey={turnOnGlobalKeyShortCut}
            style={{ margin: 0, padding: 0, }}
            url={pdfUrl} filename={pdfFilename} handlePdfUrl={makePdfUrl} disabled={disabled}>
          </PrintNcodedPdfButton>

          {/* <PrintButton targetId={printBtnId} url={pdfUrl} filename={pdfFilename} handlePdfUrl={makePdfUrl} /> */}
          <ManualCalibration filename={pdfFilename} printOption={printOption} handlePdfUrl={makePdfUrl} />
        </div>

        <div style={{
          display: "inline-flex", flexDirection: "row",
          justifyContent: "flex-start", alignItems: "center", marginRight: "24px"
        }}>
          <ConnectButton onPenLinkChanged={e => onPenLinkChanged(e)} />

          {/* <div>구글 이메일</div>
          <KeyboardArrowDownRoundedIcon /> */}
        </div>


      </div>
      <div id="white_block" style={{ height: "1px", background: "rgba(255,255,255,1)", zoom: 1 / brZoom }}></div>
    </React.Fragment>
  );
}

export default HeaderLayer;
