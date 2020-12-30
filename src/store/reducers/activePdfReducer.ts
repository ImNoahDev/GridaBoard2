import { store } from "../../client/Root";
import GridaDoc from "../../GridaBoard/GridaDoc";
import NeoPdfDocument from "../../NcodePrintLib/NeoPdf/NeoPdfDocument";
//[Define Action Types
const ActionGroup = "ACTIVE_PDF";

const UrlActionType = Object.freeze({
  SET: `${ActionGroup}.SET`,
  GET: `${ActionGroup}.GET`,

  SET_DOC_NUMPAGES: `${ActionGroup}.SET_DOC_NUMPAGES`,
  SET_DOC_ACTIVE_PAGE_NO: `${ActionGroup}.SET_DOC_ACTIVE_PAGE_NO`,
  SET_DOC_ACTIVE_PDF: `${ActionGroup}.SET_DOC_ACTIVE_PDF`,
});
//]


export const setUrlAndFilename = async (url: string, filename: string) => {
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


export const setActivePageNo = async (pageNo: number) => {
  store.dispatch({
    type: UrlActionType.SET_DOC_ACTIVE_PAGE_NO,
    value: pageNo,
  });
}

export const setActivePdf = async (pdf: NeoPdfDocument) => {
  const filename = pdf.filename;
  const url = pdf.url;

  store.dispatch({
    type: UrlActionType.SET_DOC_ACTIVE_PDF,
    value: { url, filename, pdf }
  });

}




const initialState = {
  activePdf: {
    filename: undefined as string,
    url: undefined as string,
    pdf: undefined as NeoPdfDocument,
    // filename: "___1page.pdf",
    // url: "./___1page.pdf"
    // filename: "A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf",
    // url: "./A4_Pirates-of-the-Caribbean-Hes-a-Pirate-Klaus-Badelt.pdf"
  },

  numDocPages: 0,
  activePageNo: 0,
};
export type PdfInfoType = typeof initialState;

//[Reducer
export default (state = initialState, action) => {
  // console.log(action);

  switch (action.type) {
    case UrlActionType.SET: {
      return {
        ...state,
        activePdf: {
          ...state.activePdf,
          ...action.value
        }
      };
    }

    case UrlActionType.SET_DOC_NUMPAGES: {
      return {
        ...state,
        numDocPages: action.value,
      };
    }

    case UrlActionType.SET_DOC_ACTIVE_PAGE_NO: {
      return {
        ...state,
        activePageNo: action.value,
      };
    }


    case UrlActionType.SET_DOC_ACTIVE_PDF: {
      return {
        ...state,
        activePdf: { ...action.value }
      };
    }

    default: {
      return state;
    }
  }
};
//]
