import React from "react";
import App from "../shared/App";
import { Provider } from "react-redux";
import { theme } from "../styles/theme";
import {
  // Backdrop,
  // Button,
  // CircularProgress,
  // Dialog,
  // DialogActions,
  // DialogContent,
  // DialogContentText,
  // DialogTitle,
  // Fade,
  // IconButton,
  MuiThemeProvider,
  // Snackbar,
} from "@material-ui/core";

import configureStore from "../store/configureStore";


// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

export const store = configureStore();

// export const store = configureStore();

const Root = () => (
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <App theme={theme} />
    </MuiThemeProvider>
  </Provider>
);

export default Root;
