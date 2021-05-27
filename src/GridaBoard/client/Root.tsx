import React, { useEffect, useState } from "react";
// import configureStore from "../store/configureStore";
import {BrowserRouter} from "react-router-dom";
import App from "./App"


// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// export const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

// export const store = configureStore();



const Root = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}



export default Root;
