import React, { useState } from "react";
import { Button, SvgIcon } from "@material-ui/core";
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import { saveGrida } from "../Save/SaveGrida";
import LoadGrida from "../Load/LoadGrida";
import PrintButton from "../../components/navbar/PrintButton";
import GridaDoc from "../GridaDoc";
import { PDFDocument } from 'pdf-lib';
import ConnectButton from "../../components/buttons/ConnectButton";
import GridaApp from "../GridaApp";
import ManualCalibration from "../../components/navbar/ManualCalibration";
import { g_defaultPrintOption } from "../../nl-lib/ncodepod";
import $ from "jquery";

const headerStyle = {
  position: "static",
  display: "block",
  flexDirection: "row-reverse",
  alignItems: "center",
  height: "7vh",
  lineHeight: "7vh",
  // border: "1px solid black",
  margin: 0,
  background: "rgba(255, 255, 255, 0.5)",
} as React.CSSProperties;

const imgStyle = {
  float: "left",
  verticalAlign: "middle",
  // width: "4.3vw",
  // height: "6.3vh",
  marginTop: "14px",
  marginLeft: "10px",
  marginRight: "10px",
  borderRadius: "8px",
} as React.CSSProperties;

const aStyle = {
  // width: "4.9vw",
  height: "2.1vh",
  left: "4.2vw",
  // top: ""
  fontFamily: "Roboto",
  fontStyle: "normal",
  fontWeight: "bold",
  fontSize: "1.85vh",
  // lineHeight: "21px",
  textAlign: "right",
  letterSpacing: "0.25px",
  textDecoration: "none",
  marginRight: "2.5vw"
} as React.CSSProperties;

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

const printBtnId = "printTestButton";
const printOption = g_defaultPrintOption;

const HeaderLayer = () => {

  const [pdfUrl, setPdfUrl] = useState(undefined as string);
  const [pdfFilename, setPdfFilename] = useState(undefined as string);

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

  const onPenLinkChanged = e => {
    const app = GridaApp.getInstance();
    app.onPenLinkChanged(e);
    // const pen = e.pen;
    // if (e.event.event === 'on_connected') {
    //   pens.push(pen);
    //   setPens([...pens]);
    // }
    // else if (e.event.event === 'on_disconnected') {
    //   const mac = pen.getMac();
    //   console.log(`Home: OnPenDisconnected, mac=${pen.getMac()}`);
    //   const index = pens.findIndex(p => p.getMac() === mac);
    //   if (index > -1) {
    //     const newPens = pens.splice(index, 1);
    //     setPens([...newPens]);
    //   }
    // }
  }

  $('#save').hover(function() {
    $(this).css("color", "rgba(104,143,255,1)")
  },function() {
    $(this).css("color", "rgba(18,18,18,1)")
  });

  return (
    <React.Fragment>
      <div id="header" style={headerStyle}>
        <img src="image 5.png" style={imgStyle}></img>
        <a id="grida_board" href="#" style={aStyle}>Grida board</a>
        <Button id="save" style={buttonStyle} onClick={() => saveGrida('hello.grida')}>
          저장하기
        </Button>
        <LoadGrida />
        <PrintButton targetId={printBtnId} url={pdfUrl} filename={pdfFilename} handlePdfUrl={makePdfUrl}/>
        <ManualCalibration filename={pdfFilename} printOption={printOption}/>
        <KeyboardArrowDownRoundedIcon style={{float: "right", marginTop: "25px", marginRight: "31px"}}/>
        <p style={{float: "right"}}>구글 이메일</p>
        <ConnectButton onPenLinkChanged={e => onPenLinkChanged(e)} />
      </div>
      <div style={{height: "1px", background: "rgba(255,255,255,1)"}}></div>
    </React.Fragment>
  );
}

export default HeaderLayer;
