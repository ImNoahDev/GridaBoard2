import React, { useEffect, useState } from "react";
import { Button, Popover, SvgIcon, makeStyles, ClickAwayListener } from "@material-ui/core";
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import { makeGridaBlob, saveGrida } from "../Save/SaveGrida";
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
import CustomBadge from "../components/CustomElement/CustomBadge";
import LogoSvg from "../logo.svg";
import TestButton from "../components/buttons/TestButton";
import PenLogWindow from "../debugging/PenLogWindow";
import { makeThumbnail, saveThumbnail, saveToDB, updateDB } from "../Save/SaveThumbnail";
import { store } from "../client/pages/GridaBoard";
import firebase from 'GridaBoard/util/firebase_config';

const useStyles = props => makeStyles((theme) => ({
  dropdownBtn : {
    width: "200px",
    height: "40px",
    padding: "4px 12px",
    display: "flex",
    justifyContent: "left",
    "&:hover" : {
      background : theme.custom.icon.blue[3],
      color: theme.palette.action.hover
    }
  },
  buttonStyle: {
    padding: 0,
    minWidth: "0px",
    minHeight: "0px"
  },
  calibration: {
    background: theme.custom.white[50],
    border: "1px solid #CFCFCF",
    boxSizing: "border-box",
    borderRadius: "4px",
    fontSize: "12px",
    fontFamily: "Roboto",
    padding: "8px",
    textTransform: 'none'
  },
  buttonFontStyle: {
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
  saveDropdownStyle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "8px",
    position: "absolute",
    background: theme.custom.icon.mono[4],
    boxShadow: theme.custom.shadows[0],
    borderRadius: "12px",
    zIndex: 10000,
    marginTop: "21px",
    marginLeft: "-1px"
  },
  headerStyle: {
    display: "flex",
    zIndex: 2,
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    height: "72px",
    zoom: 1 / props.brZoom,
    backdropFilter: "blur(4px)",
    "& > div": {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
      margin: "0 24px"
    },
    "& > div > div": {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    "& > div:first-child > div": {
      margin: "0 24px",
      padding: "10px"
    },
    "& > div:last-child > div": {
      marginLeft: "16px"
    },
    "& > div > div > div": {
      display: "flex",
      marginRight: "24px"
    },
    "& > div > div > div:last-child": {
      marginRight: "0px"
    }
  },
  headerLineV: {
    width: "1px",
    height: "15px",
    background: theme.custom.icon.mono[3]
  },
  changeUrlStyle: {
    justifyContent: "center",
    background: theme.custom.white[50],
    border: "1px solid #CFCFCF",
    boxSizing: "border-box",
    borderRadius: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    padding: "3px",
    "& > span": {
      fontSize: "12px",
      lineHeight: "14px",
      padding: "5px",
      fontWeight: 500
    }
  },
  imgStyle: {
    borderRadius: "8px"
  },
  badge: {
    background: theme.custom.icon.mono[1],
    color: theme.custom.icon.mono[4]
  }
}));


const printBtnId = "printTestButton";
const printOption = g_defaultPrintOption;

interface Props {
  handlePdfOpen: (event: IFileBrowserReturn) => void,
  handlePenLogWindow: () => void,
  hidden: boolean
}

const HeaderLayer = (props: Props) => {

  const { handlePdfOpen, ...rest } = props;

  const [pdfUrl, setPdfUrl] = useState(undefined as string);
  const [pdfFilename, setPdfFilename] = useState(undefined as string);


  const makePdfUrl = async () => {
    const doc = GridaDoc.getInstance();
    const docPages = doc.pages;
    let isPdfEdited = false;

    let pdfUrl, pdfDoc = undefined;

    for (const page of docPages) {
      if (page.pdf === undefined) {
        //ncode page일 경우
        isPdfEdited = true; //여긴 무조건 pdf를 새로 만들어야 하는 상황
        if (pdfDoc === undefined) {
          pdfDoc = await PDFDocument.create();
        }
        const pageWidth = page.pageOverview.sizePu.width;
        const pageHeight = page.pageOverview.sizePu.height;
        const pdfPage = await pdfDoc.addPage([pageWidth, pageHeight]);
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
          page.pdf.removedPage.forEach(el => {
            pdfDocSrc.removePage(el);
          });
          /******************* pdfDoc에서 remove를 할경우
           * pageCache에 값이 변하지 않아서 아래 getPages에서 기존의 개수가 그대로 나온다.
           * pageCache는 원래 직접접근 하면 안되는 privite 이지만, 강제로 value를 업데이트 해준다
           * 직접 접근 이외의 방법으로 업데이트가 가능하거나(현재 못찾음)
           * pdf-lib가 업데이트 되어 필요없다면 삭제 필요
           */
          (pdfDocSrc as any).pageCache.value = (pdfDocSrc as any).pageCache.populate();

          if (pdfDoc !== undefined) {
            //ncode 페이지가 미리 생성돼서 그 뒤에다 붙여야하는 경우
            isPdfEdited = true; //여기 들어오면 pdf가 여러개든지 pdf가 편집된 상황이다.

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

    if (!isPdfEdited) {
      //pdf가 편집되지 않았으면 새로운 createObjectURL 할 필요 없음
      return pdfUrl;
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
  const badgeInVisible = !useSelector((state: RootState) => state.ui.shotcut.show);

  const classes = useStyles({ brZoom })();

  const HeaderLine = () => {
    return (<div className={classes.headerLineV} />);
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
  function handleClickSaveAway() {
    setIsSaveOpen(false);
  }

  const handlePenLogWindow = () => {
    props.handlePenLogWindow();
  }

  const overwrite = async () => {
    //1. 썸네일 새로 만들기
    const imageBlob = await makeThumbnail();

    //2. grida 새로 만들기
    const gridaBlob = await makeGridaBlob();

    //3. thumbnail, last_modifed, grida 업데이트
    const docName = store.getState().docConfig.docName;
    const date = store.getState().docConfig.date;
    const userId = firebase.auth().currentUser.email;

    const gridaFileName = `${userId}_${docName}_${date}_.grida`;

    const storageRef = firebase.storage().ref();
    const gridaRef = storageRef.child(`grida/${gridaFileName}`);

    const gridaUploadTask = gridaRef.put(gridaBlob);
    await gridaUploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      function (snapshot) {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Grida Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      },
      function (error) {
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
  
          case 'storage/canceled':
            // User canceled the upload
            break;
  
          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      async function () {
        gridaUploadTask.snapshot.ref.getDownloadURL().then(async function (downloadURL) {
          const grida_path = downloadURL;
  
          const thumbFileName = `${userId}_${docName}_${date}_.png`;
          const pngRef = storageRef.child(`thumbnail/${thumbFileName}`);
  
          const thumbUploadTask = pngRef.put(imageBlob);
          await thumbUploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            function (snapshot) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Thumbnail Upload is ' + progress + '% done');
              switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  console.log('Upload is paused');
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  console.log('Upload is running');
                  break;
              }
            },
            function (error) {
              switch (error.code) {
                case 'storage/unauthorized':
                  // User doesn't have permission to access the object
                  break;
  
                case 'storage/canceled':
                  // User canceled the upload
                  break;
  
                case 'storage/unknown':
                  // Unknown error occurred, inspect error.serverResponse
                  break;
              }
            },
            async function () {
              thumbUploadTask.snapshot.ref.getDownloadURL().then(function (thumb_path) {
                updateDB(docName, thumb_path, grida_path);
              });
            }
          );
        });
      }
    );




  }

  const [debugOpen, setDebugOpen] = useState(false);

  return (
    <React.Fragment>
      <div id="header" className={`${classes.headerStyle}`}>
        <div >
          <img src={LogoSvg} className={classes.imgStyle}></img>
          <div>
            <ClickAwayListener onClickAway={handleClickSaveAway}>
              <div>
                <CustomBadge badgeContent={`S`}>
                  <Button className={`${classes.buttonStyle} ${classes.buttonFontStyle} saveButton`} onClick={handleClickSave} disabled={disabled}>
                    {getText("save_file")}
                  </Button>
                </CustomBadge>
                {isSaveOpen ? (
                  <div className={`${classes.saveDropdownStyle}`} >
                    <SavePdfDialog saveType="pdf" />
                    <SavePdfDialog saveType="grida" />
                    <SavePdfDialog saveType="saveAs" />
                    <Button className={`${classes.dropdownBtn}`} onClick={overwrite} >
                      저장하기(덮어쓰기)
                    </Button>
                  </div>
                ) : null}
              </div>
            </ClickAwayListener>
            <div>
              <CustomBadge badgeContent={`Ctrl-O`}>
                <ConvertFileLoad className={`loadDropDown ${classes.buttonStyle} ${classes.buttonFontStyle}`} handlePdfOpen={handlePdfOpen} />
              </CustomBadge>
            </div>
            <div>
              <CustomBadge badgeContent={`P`}>
                <PrintNcodedPdfButton id="printBtn"
                  className={` ${classes.buttonStyle}  ${classes.buttonFontStyle}`}
                  handkeTurnOnAppShortCutKey={turnOnGlobalKeyShortCut}

                  url={pdfUrl} filename={pdfFilename} handlePdfUrl={makePdfUrl} disabled={disabled} />
              </CustomBadge>
            </div>
          </div>
          <CalibrationButton className={`${classes.buttonStyle}  ${classes.calibration}`} filename={pdfFilename} handlePdfUrl={makePdfUrl} />

          <div>
            <TestButton className={`${classes.buttonStyle}`} onClick={(e) => handlePenLogWindow()} hidden={props.hidden}/>
          </div>
        </div>

        <div >

          <div>
            <ConnectButton className={`${classes.buttonStyle}`} onPenLinkChanged={e => onPenLinkChanged(e)} />
          </div>
          {/* <HeaderLine />
          
          <InformationBtn /> */}
          <HeaderLine />
          <div>
            <Button href="https://gridaboard-v1-30576.web.app/" className={`${classes.buttonStyle} ${classes.changeUrlStyle}`}>
              {getText("go_to_old")}
            </Button>
          </div>
          {/* <div>구글 이메일</div>
          <KeyboardArrowDownRoundedIcon /> */}
        </div>

    
      </div>
      <div style={{ height: "1px", background: "rgba(255,255,255,1)", zoom: 1 / brZoom }}>
     
      </div>
    </React.Fragment>
  );
}

export default HeaderLayer;
