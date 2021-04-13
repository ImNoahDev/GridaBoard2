import React, { useEffect, useState } from "react";
import { Button, Popover } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import { saveGrida } from "../Save/SaveGrida";
// import LoadGrida from "../Load/LoadGrida";
import ConvertFileLoad from "../Load/ConvertFileLoad";
import GridaDoc from "../GridaDoc";
import { PDFDocument } from 'pdf-lib';
import ConnectButton from "../components/buttons/ConnectButton";
import GridaApp from "../GridaApp";
import ManualCalibration from "../components/navbar/ManualCalibration";
import { g_defaultPrintOption, PrintNcodedPdfButton } from "nl-lib/ncodepod";
import SavePdfDialog from "../Save/SavePdfDialog";
// import { FileBrowserButton } from "nl-lib/common/neopdf";
import { IFileBrowserReturn } from "nl-lib/common/structures";
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import { turnOnGlobalKeyShortCut } from "../GlobalFunctions";
import getText from "../language/language";
import { NCODE_CLASS6_NUM_DOTS } from "nl-lib/common/constants";
import { theme as myTheme } from "../styles/theme";

const useStyles = props => makeStyles((theme) => ({
    buttonStyle : {
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: "bold",
      fontSize: "14px",
      textAlign: "right",
      letterSpacing: "0.25px",
      marginRight: "20px",
      marginTop: "4px",
      padding: 0,
      color: theme.palette.text.primary,
      "&:hover": {
        color: theme.palette.action.hover
      }
    },
    saveDropdownStyle : {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "8px",
      position: "absolute",
      background: theme.palette.grey[50],
      boxShadow: theme.shadows[1],
      borderRadius: "12px",
      zIndex: 10000
    },
    changeUrlTextStyle : {
      fontSize: "12px",
      lineHeight: "14px",
      margin: "8px",
      fontWeight:500,
      padding: 0
    },
    headerStyle : {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      height: "70px",
      background: theme.palette.primary.light,
      zoom: 1 / props.brZoom,
    },
    changeUrlStyle : {
      justifyContent: "center",
      background: theme.palette.primary.light,
      border: "1px solid #CFCFCF",
      boxSizing: "border-box",
      borderRadius: "4px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      padding: 0,
      marginRight: "8px"
    },
    imgStyle: {
      marginRight: "32px",
      borderRadius: "8px"
    }
  }));


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



  const activePageNo_store = useSelector((state: RootState) => state.activePage.activePageNo);

  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);


  const classes = useStyles({brZoom})();

  const [dropVisible, setDropVisible] = useState(true);
  let _dropDom = undefined as HTMLElement;

  console.log(`browser zoom level changed = ${brZoom}`);

  let disabled = true;
  if (activePageNo_store !== -1) {
    disabled = false;
  }

  function handleClickSave(visible:boolean = null) {
    if(visible !== null){
      setDropVisible(visible);
    }else if(visible !== dropVisible){
        setDropVisible(!dropVisible);
    }
  }
  useEffect(() => {
    if(!dropVisible){
      _dropDom.focus();
    }
  },[dropVisible]);


  function changeUrl() {
    location.href = 'https://gridaboard-v1-30576.web.app/';
  }
  function saveDropBlur(e){
    const  currentTarget  =  e.currentTarget ;
    // 이벤트 루프의 다음 틱에서 새로 포커스 된 요소를 확인합니다.
    setTimeout(() => {
      // 새 activeElement가 원래 컨테이너의 자식인지 확인
      if (!currentTarget.contains(document.activeElement)) {
        // 여기에서 콜백을 호출하거나 맞춤 로직을 추가 할 수 있습니다.
        handleClickSave(true);
      }
    }, 0);
  }

  return (
    <React.Fragment>
      <div id="header" className={`${classes.headerStyle}`}>
        <div style={{
          display: "inline-flex", flexDirection: "row",
          justifyContent: "flex-start", alignItems: "center", marginLeft: "24px"
        }}>
          <img src="grida_logo.png" className={classes.imgStyle}></img>
          <div>
            <Button className={`${classes.buttonStyle}`}  onClick={()=>handleClickSave()} disabled={disabled}>
              {getText("save_file")}
            </Button>
            <div ref={(e)=>{_dropDom=e}} tabIndex={-1} hidden={dropVisible} className={`${classes.saveDropdownStyle}`} onBlur={saveDropBlur} >
              <SavePdfDialog saveType="pdf"/>
              <SavePdfDialog saveType="grida"/>
            </div>
          </div>
          
          <div>
            <ConvertFileLoad className={`loadDropDown ${classes.buttonStyle}`}  handlePdfOpen={handlePdfOpen}/>
          </div>

          <PrintNcodedPdfButton
            className={` ${classes.buttonStyle}`}
            handkeTurnOnAppShortCutKey={turnOnGlobalKeyShortCut}
            
            url={pdfUrl} filename={pdfFilename} handlePdfUrl={makePdfUrl} disabled={disabled}>
          </PrintNcodedPdfButton>

          <ManualCalibration className={`${classes.buttonStyle}`} filename={pdfFilename} printOption={printOption} handlePdfUrl={makePdfUrl} />
        </div>

        <div style={{
          display: "inline-flex", flexDirection: "row",
          justifyContent: "flex-start", alignItems: "center", marginRight: "24px"
        }}>
          <ConnectButton className={`${classes.buttonStyle}`} onPenLinkChanged={e => onPenLinkChanged(e)} />

          <Button onClick={changeUrl} className={`${classes.buttonStyle} ${classes.changeUrlStyle}`}>
            <div>
              <span className={classes.changeUrlTextStyle}>{getText("go_to_old")}</span>
            </div>
          </Button>

          {/* <div>구글 이메일</div>
          <KeyboardArrowDownRoundedIcon /> */}
        </div>


      </div>
      <div id="white_block" style={{ height: "1px", background: "rgba(255,255,255,1)", zoom: 1 / brZoom }}></div>
    </React.Fragment>
  );
}

export default HeaderLayer;
