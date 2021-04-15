import React, { useEffect, useState } from "react";
import { Button, Popover, SvgIcon} from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import { saveGrida } from "../Save/SaveGrida";
// import LoadGrida from "../Load/LoadGrida";
import ConvertFileLoad from "../Load/ConvertFileLoad";
import GridaDoc from "../GridaDoc";
import { PDFDocument } from 'pdf-lib';
import ConnectButton from "../components/buttons/ConnectButton";
import GridaApp from "../GridaApp";
// import ManualCalibration from "../components/navbar/ManualCalibration";
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
import { CalibrationButton } from 'nl-lib/ncodepod';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

const useStyles = props => makeStyles((theme) => ({
    buttonStyle : {
      padding: 0,
      minWidth: "0px",
      minHeight: "0px"
    },
    calibration : {
      background: theme.custom.white[3],
      border: "1px solid #CFCFCF",
      boxSizing: "border-box",
      borderRadius: "4px",
      fontSize: "12px",
      fontFamily: "Roboto",
      padding : "8px",
      textTransform: 'none'
    },
    buttonFontStyle : {
      minWidth: "0px",
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: 600,
      lineHeight: "16.41px",
      fontSize: "14px",
      textAlign: "right",
      letterSpacing: "0.25px",
      color: theme.palette.text.primary,
      "&:hover": {
        color: theme.palette.action.hover,
        fontWeight: 700
      }
    },
    saveDropdownStyle : {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "8px",
      position: "absolute",
      background: theme.custom.icon.mono[4],
      boxShadow: theme.custom.shadows[1],
      borderRadius: "12px",
      zIndex: 10000,
      marginTop: "21px",
      marginLeft: "-1px"
    },
    headerStyle : {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      height: "72px",
      background: theme.custom.white[3],
      zoom: 1 / props.brZoom,
      backdropFilter: "blur(4px)",
      "& > div":{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        margin: "0 24px"
      },
      "& > div > div" : {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
      } ,
      "& > div:first-child > div" : {
        margin: "0 24px",
        padding: "10px"
      } ,
      "& > div:last-child > div" : {
        marginLeft: "16px"
      } ,
      "& > div > div > div" : {
        display:"flex",
        marginRight : "24px"
      },
      "& > div > div > div:last-child" : {
        marginRight : "0px"
      }
    },
    headerLineV : {
      width: "1px",
      height: "15px",
      background: theme.custom.icon.mono[3]
    },
    changeUrlStyle : {
      justifyContent: "center",
      background: theme.custom.white[3],
      border: "1px solid #CFCFCF",
      boxSizing: "border-box",
      borderRadius: "4px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      padding: 0,
      "& > span": {
        fontSize: "12px",
        lineHeight: "14px",
        padding: "5px",
        fontWeight:500
      }
    },
    imgStyle: {
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

  const HeaderLine = ()=>{
    return (<div className={classes.headerLineV} />);
  }
  const InformationBtn = ()=>{
    return (
      <div>
        <Button className={`${classes.buttonStyle} `}>
          <SvgIcon>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10 10-4.477 10-10zM4 12a8 8 0 1116 0 8 8 0 01-16 0zm9-5a1 1 0 11-2 0 1 1 0 012 0zm-1 11a1 1 0 001-1v-6a1 1 0 10-2 0v6a1 1 0 001 1z"
            />
          </SvgIcon>
      </Button>
      </div>
      );
  }


  console.log(`browser zoom level changed = ${brZoom}`);

  let disabled = true;
  if (activePageNo_store !== -1) {
    disabled = false;
  }


  const [isSaveOpen, setIsSaveOpen] = useState(false);

  function handleClickSave() {
    setIsSaveOpen((prev) => !prev);
  }
  function handleClickSaveAway(){
    setIsSaveOpen(false);
  }

  
  function changeUrl() {
    location.href = 'https://gridaboard-v1-30576.web.app/';
  }

  return (
    <React.Fragment>
      <div id="header" className={`${classes.headerStyle}`}>
        <div >
          <img src="grida_logo.png" className={classes.imgStyle}></img>
          <div>
            <ClickAwayListener onClickAway={handleClickSaveAway}>
              <div>
                  <Button className={`${classes.buttonStyle} ${classes.buttonFontStyle}`}  onClick={handleClickSave} disabled={disabled}>
                    {getText("save_file")}
                  </Button>
                  {isSaveOpen ? (
                    <div className={`${classes.saveDropdownStyle}`} >
                      <SavePdfDialog saveType="pdf"/> 
                      <SavePdfDialog saveType="grida"/>
                    </div>
                  ) : null}
              </div>
            </ClickAwayListener>
            <div>
              <ConvertFileLoad className={`loadDropDown ${classes.buttonStyle} ${classes.buttonFontStyle}`}  handlePdfOpen={handlePdfOpen}/>
            </div>
            <div>
              <PrintNcodedPdfButton
              className={` ${classes.buttonStyle}  ${classes.buttonFontStyle}`}
              handkeTurnOnAppShortCutKey={turnOnGlobalKeyShortCut}
              
              url={pdfUrl} filename={pdfFilename} handlePdfUrl={makePdfUrl} disabled={disabled} />
            </div>
          </div>
          <CalibrationButton className={`${classes.buttonStyle}  ${classes.calibration}`} filename={pdfFilename} printOption={printOption}  handlePdfUrl={makePdfUrl} />
        </div>

        <div >

          <div>
            <ConnectButton className={`${classes.buttonStyle}`} onPenLinkChanged={e => onPenLinkChanged(e)} />
          </div>
          <HeaderLine />
          
          <InformationBtn />

          <HeaderLine />
          <div>
            <Button onClick={changeUrl} className={`${classes.buttonStyle} ${classes.changeUrlStyle}`}>
              {getText("go_to_old")}
            </Button>
          </div>
          {/* <div>구글 이메일</div>
          <KeyboardArrowDownRoundedIcon /> */}
        </div>


      </div>
      <div id="white_block" style={{ height: "1px", background: "rgba(255,255,255,1)", zoom: 1 / brZoom }}></div>
    </React.Fragment>
  );
}

export default HeaderLayer;
