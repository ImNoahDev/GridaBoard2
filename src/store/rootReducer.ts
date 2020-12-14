
import { combineReducers } from 'redux';
import activePdfReducer from "./reducers/activePdfReducer"

import authorizationReducer from './reducers/authorization';
import pointerTracer from './reducers/pointerTracer';
import rotate from './reducers/rotate';
import uiReducer from './reducers/ui';


type ICombinedRecuders = {
  auth: typeof authorizationReducer,
  ui: typeof uiReducer,

  pointerTracer: typeof pointerTracer,
  rotate: typeof rotate,
  pdfInfo: typeof activePdfReducer,
};


const rootReducer = combineReducers({
  auth: authorizationReducer,
  ui: uiReducer,
  pointerTracer,
  rotate,
  pdfInfo: activePdfReducer,
} as ICombinedRecuders);

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;