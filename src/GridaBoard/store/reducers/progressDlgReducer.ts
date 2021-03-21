import { store } from "../../client/Root";
//[Define Action Types
const ActionGroup = "PRGS_DLG";

const UrlActionType = Object.freeze({
  SHOW: `${ActionGroup}.SHOW`,
  HIDE: `${ActionGroup}.HIDE`,
  SET: `${ActionGroup}.SET`,
  GET: `${ActionGroup}.GET`,
});
//]


const initialState = {
  show: false,
  title: "",
  progress: 0,
};

//[Reducer
export default (state = initialState, action) => {
  // console.log(action);

  switch (action.type) {
    case UrlActionType.SHOW: {
      return {
        ...state,
        title: action.title,
        show: true,
      };
    }

    case UrlActionType.HIDE: {
      return {
        ...state,
        show: false,
      };
    }

    case UrlActionType.SET: {
      return {
        ...state,
        progress: action.progress,
      };
    }

    default: {
      return state;
    }
  }
};
//]
