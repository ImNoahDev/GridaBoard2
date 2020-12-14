import thunk from 'redux-thunk';
import { applyMiddleware, compose, createStore } from 'redux';
import rootReducer from './rootReducer';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default () => {
  const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk))
  );
  return store;
};
