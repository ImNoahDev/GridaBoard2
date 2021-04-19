import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { Backdrop, CircularProgress, IconButton, makeStyles, MuiThemeProvider, Snackbar } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import CloseIcon from "@material-ui/icons/Close";

// import App from "../shared/App";
import { theme as them } from "../styles/theme";
import * as neolabTheme from '../theme';
import configureStore from "../store/configureStore";
import { RootState } from '../store/rootReducer';

import GridaApp from "../GridaApp";
import { hideUIProgressBackdrop, reportBrowserZoomFactor, showUIProgressBackdrop } from "../store/reducers/ui";
import { fetchGzippedFile, getBrowserZoomFactor } from "nl-lib/common/util";
import { g_paperType, g_paperType_default } from "nl-lib/common/noteserver";
import Home from "../View/Home";
import LoadingCircle from "../Load/LoadingCircle";



// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

export const store = configureStore();

// export const store = configureStore();
const useStyle = makeStyles(theme=>{
  console.log(theme);
  return ({
    rootDiv:{
      width:"100vw",
      height:"100vh",
      background : theme.palette.background.default
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 5,
      color: theme.palette.primary.main,
    },
  })
}); 


const handleToastClose = (e) => {
  console.log(e);
}
const renderToastMessage = () => {
  let isAlertToast = false;
  const rootState = store.getState() as RootState;
  const toast = rootState.ui.toast;

  if (toast.toastType === "error" || toast.toastType === "warning" || toast.toastType === "info" || toast.toastType === "success") {
    isAlertToast = true;
  }
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      message={toast.message}
      open={toast.show}
      autoHideDuration={3000}
      onClose={handleToastClose}
      action={
        <React.Fragment>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleToastClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      }
    >
      {isAlertToast ? (
        <MuiAlert
          style={{
            color: them.palette.getContrastText(
              them.palette[toast.toastType].main
            ),
          }}
          onClose={handleToastClose}
          elevation={6}
          variant="filled"
          severity={toast.toastType}
        >
          {toast.message}
        </MuiAlert>
      ) : null}
    </Snackbar>
  );
}


const Root = () => {
  const [paperInfoInited, setPaperInfoInited] = useState(false);
  const [theme, settheme] = useState(neolabTheme.theme);
  const classes = useStyle();
  useEffect(() => {
    if (!paperInfoInited) {
      showUIProgressBackdrop();
      fetchGzippedFile("./nbs_v2.json.gz").then(async (nbs) => {
        if (nbs.length > 10) {
          g_paperType.definition = JSON.parse(nbs);
        }

        for (const key in g_paperType_default) {
          if (!Object.prototype.hasOwnProperty.call(g_paperType.definition, key)) {
            g_paperType.definition[key] = g_paperType_default[key];
          }
        }
        hideUIProgressBackdrop();
        setPaperInfoInited(true);
      }
      ).catch((e) => {
        g_paperType.definition = g_paperType_default;
        hideUIProgressBackdrop();
      });
    }
  }, [paperInfoInited]);


  const rootState = store.getState() as RootState;
  const shouldWait = rootState.ui.waiting.circular;

  return (
    <Provider store={store}>
        <LoadingCircle />
        <MuiThemeProvider theme={theme}>
          {/* {paperInfoInited ?
          <Home /> : <></>} */}
          <Home />

          <Backdrop className={classes.backdrop} open={shouldWait} >
            <CircularProgress color="inherit" />
          </Backdrop>


          {renderToastMessage()}
        </MuiThemeProvider>
    </Provider>
  );
}


// const onTest = (e) => {
//   console.log(e);
// }

// const onChange = (e) => {
//   console.log(e);
// }


// (function () {
//   const elem = document.getElementById("pdf_file_append") as HTMLInputElement;
//   elem.addEventListener("click", onTest);
//   elem.addEventListener("change", onChange);
// })();

(function () {
  window.visualViewport.addEventListener("resize", viewportHandler);

  const app = GridaApp.getInstance();
  app.start();
})();



function viewportHandler(event) {
  const brZoom = getBrowserZoomFactor();

  // console.warn(`window scale =${event.target.scale}  browser zoom=${brZoom}`);
  reportBrowserZoomFactor(brZoom);
  // // NOTE: This doesn't actually work at time of writing
  // if (event.target.scale > 3) {
  //   document.body.classList.remove("hide-text");
  // } else {
  //   document.body.classList.add("hide-text");
  // }
}



export default Root;
