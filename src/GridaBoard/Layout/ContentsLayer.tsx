import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GridaToolTip from "../../styles/GridaToolTip";
import { RootState } from "../../store/rootReducer";
import GridaDoc from "../GridaDoc";
import { FileBrowserButton, NeoPdfDocument } from "../../nl-lib/common/neopdf";
import { IFileBrowserReturn, IGetNPageTransformType, IPageSOBP } from "../../nl-lib/common/structures";

import { IconButton, Popover } from "@material-ui/core";
import { PDFDocument } from 'pdf-lib';
import HelpIcon from '@material-ui/icons/Help';;
import { nullNcode } from "../../nl-lib/common/constants";
import RotateButton from "../../components/buttons/RotateButton";
import { MixedPageView } from "../../nl-lib/renderer";
import { PLAYSTATE } from "../../nl-lib/common/enums";
import { PenManager } from "../../nl-lib/neosmartpen";
import PageNumbering from "../../components/navbar/PageNumbering";

const localStyle = {
  // width: "90.625vw",
  // height: "87.8vh",
  // float: "left",
  // zIndex: 1100,
  // display: "flex",
  // flexDirection: "column",
  // justifyContent: "space-between",
  // alignItems: "center",
  display: "flex",
  flex: 1,
  overflow: "auto",
  flexDirection: "column",
  // position: "absolute"
} as React.CSSProperties;

const helpStyle = {
  // float: "right",
  width: "56px",
  height: "56px",
  borderRadius: "40px",
  // marginRight: "-3vw",
  // marginTop: "80vh",
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
} as React.CSSProperties;

const pageNumberingStyle = {
  // position: "absolute",
  // bottom: 0,
  // flexDirection: "row-reverse",
  // display: "flex",
  // alignItems: "center",
  // justifyContent: "center",
  // width: pageWidth,
  width: "191px",
  height: "46px",
  // left: "calc(50% - 191px / 2)",
  // top: "calc(50% - 46px / 2)",
  background: "rgba(255,255,255,0.25)",
  boxShadow: "rgba(156,156,156,0.48)",
  borderRadius: "100px",
  // zIndex: 1500
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
const ContentsLayer = (props: Props) => {
  const { handlePdfOpen, ...rest } = props;

  const [pageWidth, setPageWidth] = useState(0);

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

  const pdfUrl = undefined as string;
  const pdfFilename = undefined as string;
  let pdf = undefined as NeoPdfDocument;
  let pdfPageNo = 1;
  let rotation = 0;
  let pageInfos = [nullNcode()];
  let basePageInfo = nullNcode();
  let pdfFingerprint = undefined as string;

  const viewFit_store = useSelector((state: RootState) => state.viewFitReducer.viewFit);

  useEffect(() => {
    if (rotationTrigger !== toggleRotation) {
      setToggleRotation(rotationTrigger);
    }
  }, [rotationTrigger])

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

  const {renderCountNo_store} = useSelector((state: RootState) =>({
    renderCountNo_store: state.activePage.renderCount,
  }));

  const pens = useSelector((state: RootState) => state.appConfig.pens);
  const virtualPen = PenManager.getInstance().virtualPen;
  
  const handlePageWidthNeeded = (width: number) => {
    setPageWidth(width);
  }

  const onNcodePageChanged = (pageInfo: IPageSOBP, found: IGetNPageTransformType) => {
    // const doc = GridaDoc.getInstance();
    // const result = doc.handleActivePageChanged(pageInfo, found);

    // if (!noMoreAutoLoad && result.needToLoadPdf) {
    //   handleFileLoadNeeded(found, result.pageInfo, result.basePageInfo);
    // }
  }

  return (
    <div style={localStyle}>
      <div id="rotate-box" style={{
        
      }}>
        <RotateButton />
      </div>
      {/* <main> */}
        <div id="mixed-viewer-layer" style={{ 
          position: "relative",
          // top: -130
          height: '100%',
          // top: -50
        }}>
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
        </div>
      {/* </main > */}
      {/* <div>
        <div style={pageNumberingStyle}>
          <PageNumbering />
        </div>
        <GridaToolTip open={true} placement="top-end" tip={{
          head: "Helper",
          msg: "도움말 기능들을 보여줍니다.",
          tail: "키보드 버튼 ?로 선택 가능합니다"
        }} title={undefined}>
            <IconButton id="help_btn" style={helpStyle} onClick={handleClick} aria-describedby={id}>
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
      </div> */}
    </div>
  );
}

export default ContentsLayer;