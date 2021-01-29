import React, { useState, useRef, useEffect } from "react";
import { IconButton, makeStyles, createStyles, } from "@material-ui/core";
import { useSelector, shallowEqual } from "react-redux";
import { Theme } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import '../../styles/main.css'
import { theme } from "../../styles/theme";

import PUIController from '../../components/PUIController';
import { turnOnGlobalKeyShortCut } from "../GlobalFunctions";
import PersistentDrawerRight from "./Drawer/PersistentDrawerRight";
import ButtonLayer from "../Buttons/ButtonLayer";
import AutoLoadConfirmDialog from "../Dialog/AutoLoadConfirmDialog";
import { RootState } from "../../store/rootReducer";
import { updateDrawerWidth } from "../../store/reducers/ui";
import GridaDoc from "../GridaDoc";

import {
  NeoPdfDocument, NeoPdfManager,
  openFileBrowser2, g_hiddenFileInputBtnId, onFileInputChanged, onFileInputClicked
} from "../../nl-lib/common/neopdf";
import { IPageSOBP, IFileBrowserReturn, IGetNPageTransformType } from "../../nl-lib/common/structures";
import { MixedPageView } from "../../nl-lib/renderer";
import { nullNcode } from "../../nl-lib/common/constants";
import { PLAYSTATE, ZoomFitEnum } from "../../nl-lib/common/enums";
import { PenManager } from "../../nl-lib/neosmartpen";
import PageNumbering from "../../components/navbar/PageNumbering";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex"
    },

    hide: {
      display: 'none',
    },
  }),
);

const Home = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [rightMargin, setRightMargin] = useState(0);
  // const [pens, setPens] = useState([] as INeoSmartpen[]);

  const [autoLoadOptions, setAutoLoadOptions] = useState(undefined as IGetNPageTransformType);
  const [loadConfirmDlgOn, setLoadConfirmDlgOn] = useState(false);
  const [loadConfirmDlgStep, setLoadConfirmDlgStep] = useState(0);
  // const [pdfUrl, setPdfUrl] = useState(undefined as string);
  // const [pdfFilename, setPdfFilename] = useState(undefined as string);
  const [noMoreAutoLoad, setNoMoreAutoLoad] = useState(false);

  const [activePageNo, setLocalActivePageNo] = useState(-1);
  const [pageWidth, setPageWidth] = useState(0);

  // const [pdfUrl, setPdfUrl] = useState(undefined as string);
  // const [pdfFilename, setPdfFilename] = useState(undefined as string);
  // const [pdfFingerprint, setPdfFingerprint] = useState(undefined as string);
  // const [pdf, setPdf] = useState(undefined as NeoPdfDocument);
  // const [pageInfos, setPageInfos] = useState([nullNcode()]);
  // const [basePageInfo, setBasePageInfo] = useState(nullNcode());

  const pdfUrl = undefined as string;
  const pdfFilename = undefined as string;
  let pdfFingerprint = undefined as string;
  let pdfPageNo = 1;
  let pdf = undefined as NeoPdfDocument;
  let pageInfos = [nullNcode()];

  let basePageInfo = nullNcode();
  const activePageNo_store = useSelector((state: RootState) => state.activePage.activePageNo);
  const rotationAngle = useSelector((state: RootState) => state.rotate.rotationAngle);
  useEffect(() => {
    if (activePageNo_store !== activePageNo) {
      setLocalActivePageNo(activePageNo_store);
    }
  }, [activePageNo_store])

  if (activePageNo >= 0) {
    const doc = GridaDoc.getInstance();
    const page = doc.getPageAt(activePageNo)
    pdf = page.pdf;

    // setPdfUrl(doc.getPdfUrlAt(activePageNo));
    // setPdfFilename(doc.getPdfFilenameAt(activePageNo));
    pdfFingerprint = doc.getPdfFingerprintAt(activePageNo);
    pdfPageNo = doc.getPdfPageNoAt(activePageNo);
    pageInfos = doc.getPageInfosAt(activePageNo);
    basePageInfo = doc.getBasePageInfoAt(activePageNo);
  }

  const drawerWidth = useSelector((state: RootState) => state.ui.drawer.width);
  const pens = useSelector((state: RootState) => state.appConfig.pens);
  const virtualPen = PenManager.getInstance().virtualPen;
  const setDrawerWidth = (width: number) => updateDrawerWidth({ width });

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const onDrawerResize = (size) => {
    setDrawerWidth(size);
  }

  const handlePageWidthNeeded = (width: number) => {
    setPageWidth(width);
  }


  /**
   * PDF 추가 로드 step 1) 페이지 변화 검출
   * @param pageInfo - 펜에서 들어온 페이지, PDF의 시작 페이지가 아닐수도 있다
   * @param found - 위의 pageInfo에 따라 발견된 mapping table 내의 item 정보 일부
   */
  const onNcodePageChanged = (pageInfo: IPageSOBP, found: IGetNPageTransformType) => {
    // const doc = GridaDoc.getInstance();
    // const result = doc.handleActivePageChanged(pageInfo, found);

    // if (!noMoreAutoLoad && result.needToLoadPdf) {
    //   handleFileLoadNeeded(found, result.pageInfo, result.basePageInfo);
    // }
  }

  /**
   * PDF 추가 로드 step 2) 다이얼로그 표시
   * @param found
   * @param pageInfo - found에 의해 결정된 PDF의 첫 페이지에 해당하는 pageInfo
   */
  const handleFileLoadNeeded = (found: IGetNPageTransformType, pageInfo: IPageSOBP, basePageInfo: IPageSOBP) => {
    const url = found.pdf.url;

    if (url.indexOf("blob:http") > -1) {
      setAutoLoadOptions({ ...found, pageInfo, basePageInfo });
      setLoadConfirmDlgStep(0);
      setLoadConfirmDlgOn(true);
    }
    else {
      // 구글 드라이브에서 파일을 불러오자
    }
    return;
  }

  /**
   * PDF 추가 로드 step 3) 다이얼로그 표시
   * @this autoLoadOption - IGetNPageTransformType.pageInfo에 PDF의 첫페이지가 들어 있다
   */
  const handleAppendFileOk = async () => {
    setLoadConfirmDlgOn(false);

    const url = autoLoadOptions.pdf.url;
    if (url.indexOf("blob:http") < 0)
      return { result: "fail", status: "not a local file, please load the file from google drive" }

    console.log(`try to load file: ${autoLoadOptions.pdf.filename}`);

    // 여기서 펜 입력은 버퍼링해야 한다.
    const selectedFile = await openFileBrowser2();
    console.log(selectedFile.result);

    if (selectedFile.result === "success") {
      const { url, file } = selectedFile;

      const doc = await NeoPdfManager.getInstance().getDocument({ url, filename: file.name, purpose: "test fingerprint" });
      if (doc.fingerprint === autoLoadOptions.pdf.fingerprint) {
        doc.destroy();
        handlePdfOpen({ result: "success", url, file }, autoLoadOptions.pageInfo, autoLoadOptions.basePageInfo);

        return { result: "success", status: "same fingerprint" }
      }
      else {
        doc.destroy();
        setLoadConfirmDlgStep(1);
        setLoadConfirmDlgOn(true);

        return { result: "fail", status: "same fingerprint" }
      }
      // setPdfUrl(url);
      // setPdfFilename(filename);
    }
    else if (selectedFile.result === "canceled") {
      setLoadConfirmDlgStep(1);
      setLoadConfirmDlgOn(true);
      return { result: "fail", status: "file open canceled" }
    }
  }

  /**
   * PDF 추가 로드 step 4) 다이얼로그에서 OK를 눌렀을 때
   * @param event
   * @param pageInfo - PDF의 시작 페이지
   */
  const handlePdfOpen = async (event: IFileBrowserReturn, pageInfo?: IPageSOBP, basePageInfo?: IPageSOBP) => {
    console.log(event.url)
    if (event.result === "success") {
      const doc = GridaDoc.getInstance();
      doc.openPdfFile({ url: event.url, filename: event.file.name }, pageInfo, basePageInfo);

    }
    else if (event.result === "canceled") {
      alert("file open cancelled");
    }
  };


  const handleNoMoreAutoLoad = () => {
    setNoMoreAutoLoad(true);
    setLoadConfirmDlgOn(false);
  }

  const handleCancelAutoLoad = () => {
    setLoadConfirmDlgOn(false);
  }


  const classes = useStyles();

  //https://css-tricks.com/controlling-css-animations-transitions-javascript/

  let mainStyle = {
    flexGrow: 1,
    // padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: 0,
  };

  if (drawerOpen) {
    mainStyle = {
      flexGrow: 1,
      // padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: drawerWidth,
    }
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

  console.log(`HOME: docPageNo:${activePageNo}, pdfUrl=${pdfUrl}, fingerPrint: ${pdfFingerprint}, pdfPageNo:${pdfPageNo}`);
  return (
    <div className={classes.root}>
      {/* <CssBaseline /> */}
      <main style={mainStyle}>
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <nav id="uppernav" className="navbar navbar-light bg-transparent" style={{ float: "left", zIndex: 3 }}>
            <a id="grida_board" className="navbar-brand" href="#">Grida board
          <small id="neo_smartpen" className="text-muted">
                <span data-l10n-id="by_neosmart_pen"> by Neo smartpen </span>
              </small>
            </a>
          </nav>
        </div>

        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: drawerOpen ? drawerWidth : 0 }}>
          <ButtonLayer handlePdfOpen={handlePdfOpen} />
        </div>

        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: drawerOpen ? drawerWidth : 0 }}>
          <MixedPageView
            pdf={pdf}
            pdfUrl={pdfUrl} filename={pdfFilename}
            pdfPageNo={pdfPageNo} pens={[...pens, virtualPen]} 
            playState={PLAYSTATE.live}
            rotation={rotationAngle}

            pageInfo={pageInfos[0]}
            basePageInfo={basePageInfo}

            parentName={"grida-main-home"}
            viewFit={ZoomFitEnum.FULL}
            autoPageChange={true}
            fromStorage={false}
            fitMargin={100}
            
            onNcodePageChanged={onNcodePageChanged}
            handlePageWidthNeeded = {(width) => handlePageWidthNeeded(width)}
          />
          <div id="navbar_page" style={pageNumberingStyle}>
            <div className="navbar-menu neo_shadow" style={{zIndex: 1000, height: "36px"}}>
              <PageNumbering />
            </div>
          </div>
        </div>
      </main >

      {/* Drawer 구현 */}
      <div id="drawer-icon"
        style={{ position: "absolute", right: 10, top: 0, zIndex: 4 }}
      >
        <IconButton
          style={{ position: "absolute", right: 10, top: 0, zIndex: 4 }}
          color="inherit"
          aria-label="open drawer"
          edge="end"
          onClick={handleDrawerOpen}
        // className={clsx(drawerOpen && classes.hide)}
        >
          <MenuIcon />
        </IconButton>
        <PersistentDrawerRight
          open={drawerOpen} handleDrawerClose={handleDrawerClose} onDrawerResize={onDrawerResize}
          noInfo
        />
      </div>

      <AutoLoadConfirmDialog open={loadConfirmDlgOn} step={loadConfirmDlgStep}
        onOk={handleAppendFileOk} onCancel={handleCancelAutoLoad} onNoMore={handleNoMoreAutoLoad} />


      {/* 파일 인풋을 위한 것 */}
      <input type="file" id={g_hiddenFileInputBtnId} onChange={onFileInputChanged} onClick={onFileInputClicked} style={{ display: "none" }} name="pdf" accept="application/pdf" />
      {/* <input type="file" id={"pdf_file_append"} onChange={onFileInputChanged} onClick={onFileInputClicked} style={{ display: "none" }} name="pdf" accept="application/pdf" /> */}
    </div >
  );
};


// const mapStateToProps = (state) => {
//   const ret = {
//     fil: state.pdfInfo.filename,
//   };
//   return ret;
// };

// const mapDispatchToProps = (dispatch) => ({
//   increment: () => dispatch(incrementAction()),
//   decrement: () => dispatch(decrementAction())
// });


// export default connect(mapStateToProps)(Home);



declare global {
  interface Window {
    _pui: any;
  }
}

(function (window) {
  const pui = new PUIController('./3_1013_1116_Grida.nproj');

  window._pui = [];
  window._pui.push(pui);
  console.log(window._pui);

  turnOnGlobalKeyShortCut(true);

})(window);


export default Home;
