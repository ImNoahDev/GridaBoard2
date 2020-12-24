import { Box, Button } from "@material-ui/core";
import React, { useState } from "react";
import { NeoImage } from "../components/CustomElement/NeoImage";
import { g_defaultPrintOption, PrintOptionDialog, PrintPdfButton } from "../NcodePrintLib";
import ClearLocalMappingButton from "../NcodePrintLib/Buttons/ClearLocalMappingButton";
import CalibrationButton from "../NcodePrintLib/NcodePrint/Dialogs/CalibrationDialog";
import OptionDialogButton from "../NcodePrintLib/NcodePrint/Dialogs/OptionDialog";
import PrintNcodedPdfButton from "../NcodePrintLib/NcodePrint/PrintNcodedPdfButton";
import { NeoSmartpen, NoteserverClient } from "../neosmartpen";
import { useSelector } from "react-redux";
import Upload from "../components/navbar/Upload";
import GoogleBtn from "../components/GoogleBtn";
import { savePDF } from "../NcodePrintLib/Save/SavePdf";

const buttonDivStyle = {
  position: "absolute",
  display: "flex",
  flexDirection: "row-reverse",
  alignItems: "center",
  left: "0px", top: "0px",
  width: "100%", height: "40px",
  zIndex: 99999,
} as React.CSSProperties;


const printBtnId = "printTestButton";
const printOption = g_defaultPrintOption;

const getNoteInfo = (event) => {
  // let url = "http://nbs.neolab.net/v1/notebooks/attributes?device=android";
  const note_info = new NoteserverClient();
  note_info.getNoteInfo({});
};



/**
 * 
 */
const ButtonLayer_forTest = () => {
  const [num_pens, setNumPens] = useState(0);

  const pdfUrl = useSelector((state) => {
    console.log(state.pdfInfo);
    return state.pdfInfo.url;
  });

  const pdfFilename = useSelector((state) => {
    console.log(state.pdfInfo);
    return state.pdfInfo.filename;
  });

  return (
    <div id={"button_div"} style={buttonDivStyle}>

      <div style={{ flex: 1 }}> </div>

      {/* 공책 정보 가져오기 테스트 버튼 */}
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        <Button variant="outlined" color="primary" onClick={(event) => getNoteInfo(event)} >
          <Box fontSize={14} fontWeight="fontWeightBold" >공책 정보 받아오기(현재 실패)</Box>
        </Button>
      </div>
      <div style={{ flex: 1 }}> </div>

      {/* 이미지 버튼 테스트 */}
      <NeoImage src="./icons/icon_trash_n.png" />

      {/* 인쇄 테스트 버튼 */}
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        <PrintPdfButton variant="contained" color="primary"
          id={printBtnId}
          url={pdfUrl}
          filename={pdfFilename}
          printOption={printOption}
          reportProgress={undefined} printOptionCallback={undefined}>
          <Box fontSize={14} fontWeight="fontWeightBold" >인쇄 시험 (인쇄 옵션 창을 띄울것)</Box>
        </PrintPdfButton>
      </div>
      <div style={{ flex: 1 }}> </div>


      {/* High-speed 인쇄 테스트 버튼 */}
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        <PrintNcodedPdfButton variant="contained" color="primary"
          id={printBtnId}
          url={pdfUrl}
          filename={pdfFilename}
          // printOption={printOption}
          reportProgress={undefined} printOptionCallback={undefined}>
          <Box fontSize={14} fontWeight="fontWeightBold" >Ncode PDF</Box>
        </PrintNcodedPdfButton>
      </div>
      <div style={{ flex: 1 }}> </div>


      {/* 칼리브레이션 */}
      <CalibrationButton url={pdfUrl} filename={pdfFilename} printOption={printOption} cancelCallback={undefined}>
        <Box fontSize={14} fontWeight="fontWeightBold" >Calibration</Box>
      </CalibrationButton>


      {/* 매핑 정보 지우기 버튼 */}
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        <ClearLocalMappingButton variant="contained" color="primary" >
          <Box fontSize={14} fontWeight="fontWeightBold" >매핑정보 지우기</Box>
        </ClearLocalMappingButton>
      </div>
      <div style={{ flex: 1 }}> </div>

      {/* [신] 인쇄 옵션 다이얼로그 테스트 버튼 */}
      <div style={{ fontSize: "14px" }}>
        <OptionDialogButton printOption={printOption} >
          <Box fontSize={14} fontWeight="fontWeightBold" >신규, 인쇄옵션</Box>
        </OptionDialogButton>
      </div>


      {/* 인쇄 옵션 다이얼로그 테스트 버튼 */}
      <div style={{ fontSize: "14px" }}>
        <PrintOptionDialog />
      </div>

      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        Pen Connected: {num_pens}
      </div>
      <div style={{ flex: 1 }}> </div>

      {/* 구글 업로드 테스트 버튼 */}
      <Upload />
      <div style={{ flex: 1 }}> </div>
      <button id="read_mapping_info" onClick={() => savePDF(pdfUrl, 'hello.pdf')}>
        Save PDF on Local
          </button>
      <GoogleBtn />
      <div style={{ flex: 11 }}> </div>
    </div>
  );
}

export default ButtonLayer_forTest;
