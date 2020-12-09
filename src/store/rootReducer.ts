
import {combineReducers} from 'redux';

import authorizationReducer from './reducers/authorization';
import pointerTracer from './reducers/pointerTracer';
import rotate from './reducers/rotate';
import uiReducer from './reducers/ui';

const rootReducer = combineReducers({
  auth: authorizationReducer,
  ui: uiReducer,
  pointerTracer,
  rotate,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;