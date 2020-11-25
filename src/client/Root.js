import React from "react";
import App from "../shared/App";
import thunk from 'redux-thunk';
import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import rootReducer from "../store/rootReducer";
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

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

const Root = () => (
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <App theme={theme} />
    </MuiThemeProvider>
  </Provider>
);

export default Root;
