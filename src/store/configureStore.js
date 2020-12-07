import thunk from 'redux-thunk';
import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import authorizationReducer from './reducers/authorization';
import uiReducer from './reducers/ui';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
  const store = createStore(
    combineReducers({
      auth: authorizationReducer,
      ui: uiReducer,

    }),
    composeEnhancers(applyMiddleware(thunk))
  );
  return store;
};
