import React from "react";
import App from "../shared/App";
import configureStore from "../store/configureStore";
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


export const store = configureStore();

const Root = () => (
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <App theme={theme} />
    </MuiThemeProvider>
  </Provider>
);

export default Root;
