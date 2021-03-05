import React, { useEffect, useState } from "react";
import { Avatar, Box, Button, IconButton, Paper, Popover, SvgIcon } from "@material-ui/core";
import { useSelector } from "react-redux";
import ReactJson from "react-json-view";

import { NeoImage } from "../../components/CustomElement/NeoImage";
import Upload from "../../components/navbar/Upload";
import GoogleBtn from "../../components/GoogleBtn";
import { RootState } from "../../store/rootReducer";
import GridaDoc from "../GridaDoc";

import { makeNPageIdStr } from "../../nl-lib/common/util";

import { g_defaultPrintOption } from "../../nl-lib/ncodepod";

import { MappingStorage } from "../../nl-lib/common/mapper";
import { NoteServerClient } from "../../nl-lib/common/noteserver";
import { CalibrationButton, OptionDialogButton, PrintNcodedPdfButton } from "../../nl-lib/ncodepod";


import ClearLocalMappingButton from "../../nl-lib/common/mapper/test/ClearLocalMappingButton";
import { turnOnGlobalKeyShortCut } from "../GlobalFunctions";
import { savePDF } from "../Save/SavePdf";
import { setActivePageNo } from "../../store/reducers/activePageReducer";
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import GridaToolTip from "../../styles/GridaToolTip";
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import ZoomButton from "../../components/buttons/ZoomButton";
import PenTypeButton from "../../components/buttons/PenTypeButton";
import ThicknessButton from "../../components/buttons/ThicknessButton";
import TracePointButton from "../../components/buttons/TracePointButton";
import ColorButtons from "../../components/navbar/ColorButtons";
import BackgroundButton from "../../components/buttons/BackgroundButton";
import FitButton from "../../components/buttons/FitButton";
import AddIcon from '@material-ui/icons/Add';


const navStyle = {
  position: "static",
  display: "block",
  flexDirection: "row-reverse",
  alignItems: "center",
  left: 0,
  top: 0,
  right: 50,
  height: "5.2vh",
  zIndex: 0,
  border: "1px solid black",
  width: "100%",
} as React.CSSProperties;

const penTypeStyle = {
  // marginTop: "11px",
  float: "left",
  marginLeft: "30px"
} as React.CSSProperties;

const colorStyle = {
  padding: "0px",
  margin: "0px",
  border: "0px",
  minWidth: "24px",
  marginTop: "6px",
  lineHeight: "36px",
  float: "left",
  marginLeft: "27px"
} as React.CSSProperties;

const thicknessStyle = {
  marginTop: "11px",
  float: "left",
  marginLeft: "34px"
} as React.CSSProperties;

const pointerStyle = {
  marginTop: "11px",
  float: "left",
  marginLeft: "34px"
} as React.CSSProperties;

const zoomStyle = {
  marginTop: "11px",
  float: "right"
} as React.CSSProperties;

const backgroundStyle = {
  marginTop: "11px",
  float: "right"
} as React.CSSProperties;

const printBtnId = "printTestButton";
const printOption = g_defaultPrintOption;

const getNoteInfo = (event) => {
  // let url = "http://nbs.neolab.net/v1/notebooks/attributes?device=android";
  const note_info = new NoteServerClient();
  // note_info.getNoteInfo({});
};



/**
 *
 */
const NavLayer = () => {
  const [num_pens, setNumPens] = useState(0);
  const [mapViewDetail, setMapViewDetail] = useState(0);
  const [docViewDetail, setDocViewDetail] = useState(0);

  let mapJson = {} as any;
  if (mapViewDetail) {
    const msi = MappingStorage.getInstance();
    const data = JSON.parse(JSON.stringify(msi._data));
    const arrDocMap = data.arrDocMap;

    arrDocMap.forEach(map => {
      if (mapViewDetail === 1) {
        const splitted = map.id.match(/^.+\/(.*)$/i);
        const pagesPerSheet = parseInt(splitted[1]);
        map["pagesPerSheet"] = pagesPerSheet;
        map["printPageInfo.sum"] = makeNPageIdStr(map.printPageInfo);
        map["basePageInfo.sum"] = makeNPageIdStr(map.basePageInfo);
        delete map.url;
        delete map.id;
        delete map.params;
        delete map.fingerprint;
        delete map.printPageInfo;
        delete map.basePageInfo;

      }
    });

    mapJson = data;
  }

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

  const addBlankPage = (event) => {
    const doc = GridaDoc.getInstance();
    const pageNo = doc.addBlankPage();
    setActivePageNo(pageNo);
  }

  const docJson = { pdf: [], pages: [] };
  const doc = GridaDoc.getInstance();

  for (let i = 0; i < doc._pdfd.length; i++) {
    const p = doc._pdfd[i];
    const obj = {
      pdf: p.pdf,
      filename: p.pdf.filename,
      fingerprint: p.fingerprint,
      pdfOpenInfo: p.pdfOpenInfo,
      startPageInDoc: p.startPageInDoc,       // starting from 0
      endPageInDoc: p.endPageInDoc,         // starting from 0
      pdfToNcodeMap: p.pdfToNcodeMap,
    };
    docJson.pdf.push(obj);
  }

  for (let i = 0; i < doc.numPages; i++) {
    const p = doc._pages[i];
    const { _pdfPageNo, _pageToNcodeMaps } = p;
    const pageInfo = _pageToNcodeMaps[0].pageInfo;
    const basePageInfo = _pageToNcodeMaps[0].basePageInfo;
    const obj = {
      _pdfPageNo,
      _pageToNcodeMaps,
      pageInfo: makeNPageIdStr(pageInfo),
      basePageInfo: makeNPageIdStr(basePageInfo),

    }
    docJson.pages.push(obj);
  }

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const zoom = useSelector((state: RootState) => state.zoomReducer.zoom);
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div id={"button_div"} style={navStyle}>

      <PenTypeButton />
      {/* 나중에 colorButton으로 연결해서 호출하기 */}
      <ColorButtons />
      {/* <Button id="clr_1" type="button" className="color_btn" style={colorStyle}
        // onClick={() => manager.setColor(1)}
        >
        <GridaToolTip open={true} placement="top" tip={{
            head: "RED",
            msg: "표시되는 펜의 색상을 선택합니다",
            tail: "키보드 버튼 1로 선택 가능합니다"
          }} title={undefined}>
          <div className="color_icon color_1">
          </div>
        </GridaToolTip>
      </Button> */}
      <KeyboardArrowDownRoundedIcon style={{float: "left", marginTop: "14px", marginLeft: "-5px"}}/>
      {/* 나중에 pentype thickness로 연결해서 호출하기 */}
      <ThicknessButton />
      <KeyboardArrowDownRoundedIcon style={{float: "left", marginTop: "14px", marginLeft: "-5px"}}/>
      {/* 나중에 pointer로 연결해서 호출하기 */}
      <TracePointButton />
      

      <KeyboardArrowDownRoundedIcon style={{float: "right", marginTop: "14px", marginLeft: "-5px", marginRight: "-30px"}}/>   
       {/* 나중에 fit과 zomm에 연결해서 호출하기 */}
      {/* <span id="zoom-ratio" style={zoomStyle}>{zoomPercent}%</span> */}
      <FitButton />

      <KeyboardArrowDownRoundedIcon style={{float: "right", marginTop: "14px", marginLeft: "-5px", marginRight: "31px"}}/>
      {/* 나중에 background에 연결해서 호출하기 */}
      <BackgroundButton />

      {/* <div style={{ flex: 1 }}> </div> */}

      {/* <IconButton onClick={handleClick} aria-describedby={id} style={{marginLeft: 1700}}>
        <Avatar style={{marginTop: 5}}>
          H
        </Avatar>
      </IconButton> */}
      {/* <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
        >
          <div>
            <a>User Name</a>
          </div>
          <div className="dropdown-divider"></div>
          <div>
            <a>개인정보처리방침</a>
          </div>
          <div className="dropdown-divider"></div>
          <div>
            <a>이용약관</a>
          </div>
          <div className="dropdown-divider"></div>
          <div>
            <a>기타 개인설정</a>
          </div>
          <div className="dropdown-divider"></div>
          <div>
            <a>로그아웃</a>
          </div>
        </Popover> */}

      {/* 매핑 정보 살펴보기 */}
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        <Button variant="contained" color="primary"
          onClick={(event) => setMapViewDetail((mapViewDetail + 1) % 3)} >
          <Box fontSize={14} fontWeight="fontWeightBold" >매핑 테이블</Box>
        </Button>
      </div>

      { mapViewDetail
        ? <Paper style={{ position: "absolute", top: 100, minWidth: 800, maxHeight: 800, overflow: 'auto' }}>
          <ReactJson src={mapJson}
            displayDataTypes={false}
            name={"MappingStorage._data"} collapsed={4} theme="monokai" />
        </Paper>
        : ""}

      <div style={{ flex: 1 }}> </div>
      {/* GridaDoc 내부 */}
      {/* <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        <Button variant="contained" color="primary"
          onClick={(event) => setDocViewDetail((docViewDetail + 1) % 2)} >
          <Box fontSize={14} fontWeight="fontWeightBold" >GridaDoc</Box>
        </Button>
      </div>

      { docViewDetail
        ? <Paper style={{ position: "absolute", top: 100, minWidth: 800, maxHeight: 800, overflow: 'auto' }}>
          <ReactJson src={docJson}
            displayDataTypes={false}
            name={"MappingStorage._data"} collapsed={3} theme="monokai" />
        </Paper>
        : ""}

      <div style={{ flex: 1 }}> </div> */}
      {/* 공책 정보 가져오기 테스트 버튼 */}
      {/* <div style={{ flex: 1 }}> </div> */}

      {/* 공책 정보 가져오기 테스트 버튼 */}
      {/* <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        <Button variant="outlined" color="primary" onClick={(event) => getNoteInfo(event)} >
          <Box fontSize={14} fontWeight="fontWeightBold" >공책 정보 받아오기(현재 실패)</Box>
        </Button>
      </div>
      <div style={{ flex: 1 }}> </div> */}

      {/* 이미지 버튼 테스트 */}
      {/* <NeoImage src="/icons/icon_trash_n.png" /> */}

      {/* 인쇄 테스트 버튼 */}
      {/* <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        <PrintPdfButton variant="contained" color="primary"
          id={printBtnId}
          url={pdfUrl}
          filename={pdfFilename}
          printOption={printOption}
          reportProgress={undefined} printOptionCallback={undefined}>
          <Box fontSize={14} fontWeight="fontWeightBold" >인쇄 시험 (인쇄 옵션 창을 띄울것)</Box>
        </PrintPdfButton>
      </div>
      <div style={{ flex: 1 }}> </div> */}


      {/* High-speed 인쇄 테스트 버튼 */}
      {/* <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        <PrintNcodedPdfButton variant="contained" color="primary"
          id={printBtnId}
          url={pdfUrl} filename={pdfFilename}
          handkeTurnOnAppShortCutKey={turnOnGlobalKeyShortCut}
          // printOption={printOption}
          reportProgress={undefined} printOptionCallback={undefined}>
          <Box fontSize={14} fontWeight="fontWeightBold" >Ncode PDF</Box>
        </PrintNcodedPdfButton>
      </div>
      <div style={{ flex: 1 }}> </div> */}


      {/* 칼리브레이션 */}
      {/* <CalibrationButton url={pdfUrl} filename={pdfFilename} printOption={printOption} cancelCallback={undefined}>
        <Box fontSize={14} fontWeight="fontWeightBold" >Calibration</Box>
      </CalibrationButton> */}


      {/* 매핑 정보 지우기 버튼 */}
      {/* <div style={{ fontSize: "20px", fontWeight: "bold" }}>
        <ClearLocalMappingButton variant="contained" color="secondary" >
          <Box fontSize={14} fontWeight="fontWeightBold" >매핑정보 지우기</Box>
        </ClearLocalMappingButton>
      </div>
      <div style={{ flex: 1 }}> </div> */}

      {/* [신] 인쇄 옵션 다이얼로그 테스트 버튼 */}
      {/* <div style={{ fontSize: "14px" }}>
        <OptionDialogButton
          printOption={printOption}
          handkeTurnOnAppShortCutKey={turnOnGlobalKeyShortCut}
        >

          <Box fontSize={14} fontWeight="fontWeightBold" >신규, 인쇄옵션</Box>
        </OptionDialogButton>
      </div>

      <div style={{ flex: 1 }}> </div> */}

      {/* 구글 업로드 테스트 버튼 */}
      {/* <Upload />
      <div style={{ flex: 1 }}> </div>
      <GoogleBtn />
      <div style={{ flex: 11 }}> </div> */}
    </div>
  );
}

export default NavLayer;
