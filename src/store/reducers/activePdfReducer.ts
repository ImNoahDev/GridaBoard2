import { store } from "../../client/Root";
//[Define Action Types
const ActionGroup = "ACTIVE_PDF";

const UrlActionType = Object.freeze({
  SET: `${ActionGroup}.SET`,
  GET: `${ActionGroup}.GET`,
});
//]

const initialState = {
  filename: undefined,
  url: undefined,
};


export const setUrlAndFilename = async (url, filename) => {
  store.dispatch({
    type: UrlActionType.SET,
    url: url,
    filename: filename,
  });
};

//[Reducer
export default (state = initialState, action) => {
  // console.log(action);

  switch (action.type) {
    case UrlActionType.SET: {
      return {
        ...state,
        url: action.url,
        filename: action.filename,
      };
    }

    default: {
      return state;
    }
  }
};
//]
