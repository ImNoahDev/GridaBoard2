import { store } from "../../client/Root";
//[Define Action Types
const ActionGroup = "ACTIVE_PDF";

const UrlActionType = Object.freeze({
  SET: `${ActionGroup}.SET`,
  GET: `${ActionGroup}.GET`,
});
//]

const initialState = {
  pdfLocation: {
    filename: "A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf",
    url: "./A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf"
  },
};


export const setUrlAndFilename = async (url, filename) => {
  store.dispatch({
    type: UrlActionType.SET,
    pdfLocation: { url, filename },
  });
};

//[Reducer
export default (state = initialState, action) => {
  // console.log(action);

  switch (action.type) {
    case UrlActionType.SET: {
      return {
        ...state,
        pdfLocation: action.pdfLocation,
      };
    }

    default: {
      return state;
    }
  }
};
//]
