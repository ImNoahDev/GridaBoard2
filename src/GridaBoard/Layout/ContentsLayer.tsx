import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ManualCalibration from "../../components/navbar/ManualCalibration";
import PrintButton from "../../components/navbar/PrintButton";
import GridaToolTip from "../../styles/GridaToolTip";
import ColorButtons from "../../components/navbar/ColorButtons";
import { RootState } from "../../store/rootReducer";
import GridaDoc from "../GridaDoc";
import { FileBrowserButton, NeoPdfDocument } from "../../nl-lib/common/neopdf";
import { IFileBrowserReturn, IGetNPageTransformType, IPageSOBP } from "../../nl-lib/common/structures";
import { g_defaultPrintOption } from "../../nl-lib/ncodepod";

import { Button, ButtonGroup, createStyles, Fab, IconButton, makeStyles, Popover, SvgIcon, Theme } from "@material-ui/core";
import SavePdfDialog from "../Save/SavePdfDialog";
import {saveGrida} from "../Save/SaveGrida";
import LoadGrida from "../Load/LoadGrida";
import { PDFDocument } from 'pdf-lib';
import HelpIcon from '@material-ui/icons/Help';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import { MixedPageView } from "../../nl-lib/renderer";
import { PenManager } from "../../nl-lib/neosmartpen";
import { PLAYSTATE } from "../../nl-lib/common/enums";
import { nullNcode } from "../../nl-lib/common/constants";
import PageNumbering from "../../components/navbar/PageNumbering";
import RotateButton from "../../components/buttons/RotateButton";

const localStyle = {
  width: "90.625vw",
  height: "87.8vh",
  border: "1px solid black",
  // float: "left"
  // clear: "both",
  float: "left"
} as React.CSSProperties;

const rotateStyle = {
  float: "right",
  // display: "flex",
  // flexDirection: "row",
  // justifyContent: "center",
  // alignItems: "center",
  // padding: "16px",
  // position: "static",
  width: "56px",
  height: "56px",
  background: "rgba(255, 255, 255, 0.8)",
  boxShadow: "2px 0px 24px rgba(0, 0, 0, 0.15), inset 0px 2px 0px rgba(255, 255, 255, 0.15)",
  borderRadius: "40px",
  marginRight: "16px",
  marginTop: "16px"
} as React.CSSProperties;

const helpStyle = {
  // position: "absolute",
  float: "right",
  width: "56px",
  height: "56px",
  // background: "rgba(255, 255, 255, 0.8)",
  // boxShadow: "2px 0px 24px rgba(0, 0, 0, 0.15), inset 0px 2px 0px rgba(255, 255, 255, 0.15)",
  borderRadius: "40px",
  marginRight: "-3vw",
  marginTop: "80vh",
  // marginLeft: "10vw",
  // zIndex: 100
  // bottom: 0,
  // right: 0
} as React.CSSProperties;

const dropdownStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "8px",
  position: "relative",
  width: "240px",
  height: "176px",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
  borderRadius: "12px",
} as React.CSSProperties;

const dropContentsStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "4px 12px",
  position: "static",
  width: "224px",
  left: "calc(50% - 224px / 2)",
  top: "8px",
  marginTop: "8px"
  // bottom: "128px",
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

const useStyles = makeStyles({
  iconContainer: {
    "&:hover $icon": {
        color: 'red',
    }
  },
  icon: {
      color: 'black',
  },
});

const btnStyles = makeStyles((theme: Theme) =>
createStyles({
  fab: {
    margin: theme.spacing(2),
  },
  absolute: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(3),
  },
}),
);


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
const ContentsLayer = (props: Props) => {
  const { handlePdfOpen, ...rest } = props;

  const [pdfUrl, setPdfUrl] = useState(undefined as string);
  const [pdfFilename, setPdfFilename] = useState(undefined as string);

  const classes = useStyles();
  const buttonClasses = btnStyles();
  const showForm = React.useState(false)

  // const activePageNo = useSelector((state: RootState) => state.activePage.activePageNo);
  const rotationTrigger = useSelector((state: RootState) => state.rotate.rotationTrigger);
  const {activePageNo_store} = useSelector((state: RootState) =>({
    activePageNo_store: state.activePage.activePageNo,
  }));
  useEffect(() => {
    if (activePageNo_store !== activePageNo) {
      setLocalActivePageNo(activePageNo_store);
    }
  }, [activePageNo_store])
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

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [toggleRotation, setToggleRotation] = useState(false);
  const [activePageNo, setLocalActivePageNo] = useState(-1);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  let pdf = undefined as NeoPdfDocument;
  let pdfPageNo = 1;
  let rotation = 0;
  let pageInfos = [nullNcode()];
  let basePageInfo = nullNcode();
  let pdfFingerprint = undefined as string;

  useEffect(() => {
    if (rotationTrigger !== toggleRotation) {
      setToggleRotation(rotationTrigger);
    }
  }, [rotationTrigger])

  

  const [drawerOpen, setDrawerOpen] = useState(true);
  const [pageWidth, setPageWidth] = useState(0);

  const drawerWidth = useSelector((state: RootState) => state.ui.drawer.width);
  const pens = useSelector((state: RootState) => state.appConfig.pens);
  const viewFit_store = useSelector((state: RootState) => state.viewFitReducer.viewFit);
  // const {activePageNo_store} = useSelector((state: RootState) =>({
  //   activePageNo_store: state.activePage.activePageNo,
  // }));
  const {renderCountNo_store} = useSelector((state: RootState) =>({
    renderCountNo_store: state.activePage.renderCount,
  }));
  const virtualPen = PenManager.getInstance().virtualPen;

  const onNcodePageChanged = (pageInfo: IPageSOBP, found: IGetNPageTransformType) => {
    // const doc = GridaDoc.getInstance();
    // const result = doc.handleActivePageChanged(pageInfo, found);

    // if (!noMoreAutoLoad && result.needToLoadPdf) {
    //   handleFileLoadNeeded(found, result.pageInfo, result.basePageInfo);
    // }
  }

  const handlePageWidthNeeded = (width: number) => {
    setPageWidth(width);
  }

  useEffect(() => {
    if (activePageNo_store !== activePageNo) {
      setLocalActivePageNo(activePageNo_store);
    }
  }, [activePageNo_store])

  if (activePageNo_store >= 0) {
    const doc = GridaDoc.getInstance();
    const page = doc.getPageAt(activePageNo_store)
    if (page._pdfPage !== undefined) {
      rotation = page._pdfPage.viewport.rotation;
    } else {
      rotation = page.pageOverview.rotation;
    }
    pdf = page.pdf;

    // setPdfUrl(doc.getPdfUrlAt(activePageNo));
    // setPdfFilename(doc.getPdfFilenameAt(activePageNo));
    pdfFingerprint = doc.getPdfFingerprintAt(activePageNo_store);
    pdfPageNo = doc.getPdfPageNoAt(activePageNo_store);
    pageInfos = doc.getPageInfosAt(activePageNo_store);
    basePageInfo = doc.getBasePageInfoAt(activePageNo_store);
  }

  const pageNumberingStyle = {
    position: "absolute",
    bottom: 8,
    flexDirection: "row-reverse",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: pageWidth,
  } as React.CSSProperties;

  return (
    <div style={localStyle}>
      <RotateButton />
      {/* <main>
        <div style={{ position: "static", top: 0, left: 0, bottom: 0, right: drawerOpen ? drawerWidth : 0 }}>
          <MixedPageView
            pdf={pdf}
            pdfUrl={pdfUrl} filename={pdfFilename}
            pdfPageNo={pdfPageNo} pens={[...pens, virtualPen]} 
            playState={PLAYSTATE.live}
            rotation={rotation}
            isMainView={true}

            pageInfo={pageInfos[0]}
            basePageInfo={basePageInfo}

            parentName={"grida-main-home"}
            viewFit={viewFit_store}
            autoPageChange={true}
            fromStorage={false}
            fitMargin={100}
            
            activePageNo={activePageNo_store}
            onNcodePageChanged={onNcodePageChanged}
            handlePageWidthNeeded = {(width) => handlePageWidthNeeded(width)}

            renderCountNo={renderCountNo_store}

            noInfo = {true}
          />
            <PageNumbering />
        </div>
      </main> */}

      <GridaToolTip open={true} placement="top-end" tip={{
        head: "Helper",
        msg: "도움말 기능들을 보여줍니다.",
        tail: "키보드 버튼 ?로 선택 가능합니다"
      }} title={undefined}>
          <IconButton id="help_btn" style={helpStyle} onClick={handleClick} aria-describedby={id}>
            {/* {!showForm
              ? <HelpIcon className={classes.icon} color="primary" fontSize="large"/>
              : <HelpIcon className={classes.icon} color="primary" fontSize="large"/>
            } */}
            <HelpIcon style={{width: "40px", height: "40px"}}/>
          </IconButton>
      </GridaToolTip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <div style={dropdownStyle}>
          <div style={dropContentsStyle}>
            <a>고객센터</a>
          </div>
          <div style={dropContentsStyle}>
            <a>단축키 안내</a>
          </div>
          <div style={dropContentsStyle}>
            <a>튜토리얼</a>
          </div>
          <div style={dropContentsStyle}>
            <a>FAQ</a>
          </div>
        </div>
      </Popover>
        
      {/* <nav id="colornav" className="navRoot" style={navStyle}>
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
            <button id="read_mapping_info" className="btn btn-neo" style={{marginLeft: "-10px"}} onClick={() => saveGrida('hello.grida')}>
              <GridaToolTip open={true} placement="top-end" tip={{
                head: "Grida Save",
                msg: ".grida 파일을 로컬에 저장합니다.",
                tail: "키보드 버튼 ?로 선택 가능합니다"
              }} title={undefined}>
                <IconButton className={classes.iconContainer} style={{width: 36, height: 36}}>
                  {!showForm
                    ? <SaveAltIcon className={classes.icon}/>
                    : <SaveAltIcon className={classes.icon}/>
                  }
                </IconButton>   
              </GridaToolTip>
            </button>
            <LoadGrida />
          </ButtonGroup>
        </div>

        <div id="navbar_end">
          <div className="navbar-menu neo_shadow" style={endStyle}>
            <ManualCalibration filename={pdfFilename} printOption={printOption} handlePdfUrl={makePdfUrl}/>
          </div>
        </div>

        <GridaToolTip open={true} placement="top-end" tip={{
          head: "Helper",
          msg: "도움말 기능들을 보여줍니다.",
          tail: "키보드 버튼 ?로 선택 가능합니다"
        }} title={undefined}>
            <IconButton className={classes.iconContainer} style={{width: 36, height: 36, marginLeft: "-50px"}} onClick={handleClick} aria-describedby={id}>
              {!showForm
                ? <HelpIcon className={classes.icon} color="primary" fontSize="large"/>
                : <HelpIcon className={classes.icon} color="primary" fontSize="large"/>
              }
            </IconButton>
        </GridaToolTip>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
        >
          <div>
            <a>고객센터</a>
          </div>
          <div className="dropdown-divider"></div>
          <div>
            <a>단축키 안내</a>
          </div>
          <div className="dropdown-divider"></div>
          <div>
            <a>튜토리얼</a>
          </div>
          <div className="dropdown-divider"></div>
          <div>
            <a>FAQ</a>
          </div>
        </Popover>
      </nav> */}
    </div>
  );
}

export default ContentsLayer;