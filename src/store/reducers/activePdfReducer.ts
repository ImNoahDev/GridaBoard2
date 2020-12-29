import { store } from "../../client/Root";
import GridaDoc from "../../GridaBoard/GridaDoc";
//[Define Action Types
const ActionGroup = "ACTIVE_PDF";

const UrlActionType = Object.freeze({
  SET: `${ActionGroup}.SET`,
  GET: `${ActionGroup}.GET`,

  SET_DOC_NUMPAGES: `${ActionGroup}.SET_DOC_NUMPAGES`,
});
//]

const initialState = {
  pdfLocation: {

    // filename: "___1page.pdf",
    // url: "./___1page.pdf"
    filename: "A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf",
    url: "./A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf"
  },

  numDocPages: 0,
  gridaDoc: undefined,
};

export const setUrlAndFilename = async (url, filename) => {
  store.dispatch({
    type: UrlActionType.SET,
    value: { url, filename },
  });
};

export const setDocNumPages = async (numPages: number) => {
  store.dispatch({
    type: UrlActionType.SET_DOC_NUMPAGES,
    value: numPages,
  });
}



//[Reducer
export default (state = initialState, action) => {
  // console.log(action);

  switch (action.type) {
    case UrlActionType.SET: {
      return {
        ...state,
        pdfLocation: action.value,
      };
    }

    case UrlActionType.SET_DOC_NUMPAGES: {
      return {
        ...state,
        numDocPages: action.value,
      };
    }

    default: {
      return state;
    }
  }
};
//]
