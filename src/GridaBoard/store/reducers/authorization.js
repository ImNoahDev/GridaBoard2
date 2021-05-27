import {store} from "../../client/pages/GridaBoard";
import cookie from 'react-cookies';

// Define Action Types
const ActionGroup = 'Auth';

export const AuthorizationActionTypes = {
  LOGIN: `${ActionGroup}.LOGIN`,
  LOGOUT: `${ActionGroup}.LOGOUT`
};


// Action Methods
export const didLogin = (authToken) => {
  console.log("authToken : ", authToken);
  store.dispatch({
    type: AuthorizationActionTypes.LOGIN,
    authToken: authToken
  })
};

export const logout = () => {
  store.dispatch({
    type: AuthorizationActionTypes.LOGOUT,
    authToken: ""
  })
  cookie.remove("token");
};


// Reducer
export default (state={
  authToken: localStorage.getItem('idToken')
}, action) => {
  switch (action.type) {
    case AuthorizationActionTypes.LOGIN: {
      localStorage.setItem('idToken', action.authToken);
      return {
        ...state,
        authToken: action.authToken
      }
    }
    case AuthorizationActionTypes.LOGOUT: {
      localStorage.removeItem('idToken');
      state.authToken = null;
      return {};
    }
    default: {
      return state;
    }
  }
};
