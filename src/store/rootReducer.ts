
import { combineReducers } from 'redux';
import activePageReducer from "./reducers/activePageReducer"

import authorizationReducer from './reducers/authorization';
import pointerTracer from './reducers/pointerTracer';
import rotate from './reducers/rotate';
import viewFitReducer from './reducers/viewFitReducer';
import uiReducer from './reducers/ui';
import progressDlgReducer from "./reducers/progressDlgReducer";
import calibrationReducer from "./reducers/calibrationReducer";
import appConfigReducer from './reducers/appConfigReducer';


const rootReducer = combineReducers({
  progress: progressDlgReducer,

  calibration: calibrationReducer,
  appConfig: appConfigReducer,

  auth: authorizationReducer,
  ui: uiReducer,
  pointerTracer,
  rotate,
  viewFitReducer,
  activePage: activePageReducer,

});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
