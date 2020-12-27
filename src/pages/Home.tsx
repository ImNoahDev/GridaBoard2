import React, { useState, useRef, useEffect } from "react";
import { PLAYSTATE, MixedPageView, NeoSmartpen } from "../neosmartpen";
import { IconButton, makeStyles, createStyles, } from "@material-ui/core";
import '../styles/main.css'
import PUIController from '../components/PUIController';
import { Theme } from '@material-ui/core';
import { useSelector } from "react-redux";
import { turnOnGlobalKeyShortCut } from "../GridaBoard/GlobalFunctions";
import PersistentDrawerRight, { g_drawerWidth } from "../GridaBoard/View/PersistentDrawerRight";
import MenuIcon from '@material-ui/icons/Menu';
import ButtonLayer from "./ButtonLayer";
import { g_hiddenFileInputBtnId, onFileInputChanged, onFileInputClicked, openFileBrowser2 } from "../NcodePrintLib/NeoPdf/FileBrowser";
import { theme } from "../styles/theme";
import { IAutoLoadDocDesc } from "../NcodePrintLib/SurfaceMapper/MappingStorage";
import AutoLoadConfirmDialog from "../GridaBoard/Dialog/AutoLoadConfirmDialog";
import { RootState } from "../store/rootReducer";

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
  const pageRef: React.RefObject<MixedPageView> = useRef();
  const [isRotate, setRotate] = useState();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerWidth, setDrawerWidth] = useState(g_drawerWidth);
  const [rightMargin, setRightMargin] = useState(0);
  const [pens, setPens] = useState([] as NeoSmartpen[]);

  const [autoLoadDoc, setAutoLoadDoc] = useState(undefined as IAutoLoadDocDesc);
  const [loadConfirmDlgOn, setLoadConfirmDlgOn] = useState(false);
  const [loadConfirmDlgStep, setLoadConfirmDlgStep] = useState(0);
  const [pdfUrl, setPdfUrl] = useState(undefined as string);
  const [pdfFilename, setPdfFilename] = useState(undefined as string);
  const [noMoreAutoLoad, setNoMoreAutoLoad] = useState(false);

  const [ pdfUrl_store, pdfFilename_store]  = useSelector((state: RootState) => {
    console.log(state.pdfInfo.pdfLocation);
    return [state.pdfInfo.pdfLocation.url, state.pdfInfo.pdfLocation.filename];
  });

  const pens_store = useSelector((state: RootState) => {
    // console.log(state.appConfig.pens);
    return state.appConfig.pens;
  });





  useEffect(() => {
    if (pdfUrl_store !== pdfUrl) setPdfUrl(pdfUrl_store);
    if (pdfFilename_store !== pdfFilename) setPdfFilename(pdfFilename_store);
    if (pens_store !== pens) setPens(pens_store);
  }, [pdfUrl_store, pdfFilename_store, pens_store]);

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };



  const onDrawerResize = (size) => {
    setDrawerWidth(size);
  }

  const onFileLoadNeeded = async (coupledDoc: IAutoLoadDocDesc) => {
    const url = coupledDoc.pdf.url;
    if (url.indexOf("blob:http") > -1) {
      setAutoLoadDoc(coupledDoc);
      setLoadConfirmDlgOn(true);
      setLoadConfirmDlgStep(1);
    }
    else {
      // 구글 드라이브에서 파일을 불러오자
    }

    return;

  }

  const onNoMoreAutoLoad = () => {
    setNoMoreAutoLoad(true);
  }

  const onCancelAutoLoad = () => {
    setLoadConfirmDlgOn(false);
  }

  const onLoadFile = async () => {
    setLoadConfirmDlgOn(false);
    const coupledDoc = autoLoadDoc;

    let url = coupledDoc.pdf.url;
    if (url.indexOf("blob:http") > -1) {
      console.log(`try to load file: ${coupledDoc.pdf.filename}`);

      // 여기서 펜 입력은 버퍼링해야 한다.
      const selectedFile = await openFileBrowser2();
      console.log(selectedFile.result);

      if (selectedFile.result === "success") {
        url = selectedFile.url;
        const filename = selectedFile.file.name;
        console.log(url);

        setPdfUrl(url);
        setPdfFilename(filename);
      }
    }
  }


  const classes = useStyles();
  console.log(g_drawerWidth);



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
      marginRight: g_drawerWidth,
    }
  }

  const aaa = (e) => {
    console.log(e);

  }

  return (
    <div className={classes.root}>
      {/* <CssBaseline /> */}
      <main style={mainStyle} onAnimationEnd={aaa} onAnimationEndCapture={aaa} onAnimationStart={aaa}>
        <div style={{ position: "absolute", top: 0, left: 0 }}>
          <nav id="uppernav" className="navbar navbar-light bg-transparent" style={{ float: "left", zIndex: 3 }}>
            <a id="grida_board" className="navbar-brand" href="#">Grida board
          <small id="neo_smartpen" className="text-muted">
                <span data-l10n-id="by_neosmart_pen"> by Neo smartpen </span>
              </small>
            </a>
          </nav>
        </div>

        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: drawerOpen ? g_drawerWidth : 0 }}>
          <ButtonLayer />
        </div>

        <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, right: drawerOpen ? g_drawerWidth : 0 }}>
          <MixedPageView
            pdfUrl={pdfUrl} filename={pdfFilename} pageNo={1} scale={1}
            playState={PLAYSTATE.live} pens={pens} ref={pageRef}
            rotation={0}
            onFileLoadNeeded={noMoreAutoLoad ? undefined : onFileLoadNeeded}
          />
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
        <PersistentDrawerRight open={drawerOpen} handleDrawerClose={handleDrawerClose} onDrawerResize={onDrawerResize} />
      </div>

      <AutoLoadConfirmDialog open={loadConfirmDlgOn} step={loadConfirmDlgStep}
        onOk={onLoadFile} onCancel={onCancelAutoLoad} onNoMore={onNoMoreAutoLoad} />


      {/* 파일 인풋을 위한 것 */}
      <input type="file" id={g_hiddenFileInputBtnId} onChange={onFileInputChanged} onClick={onFileInputClicked} style={{ display: "none" }} name="pdf" accept="application/pdf" />
      <input type="file" id={"pdf_file_append"} onChange={onFileInputChanged} onClick={onFileInputClicked} style={{ display: "none" }} name="pdf" accept="application/pdf" />
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
