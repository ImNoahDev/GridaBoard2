import { store } from "../../client/Root";
import { NeoPdfDocument } from "../../../nl-lib/common/neopdf";

//[Define Action Types
const ActionGroup = "ACTIVE_PDF";

const UrlActionType = Object.freeze({
  SET: `${ActionGroup}.SET`,
  GET: `${ActionGroup}.GET`,

  RENDER: `${ActionGroup}.RENDER`,
  // SET_DOC_NUMPAGES: `${ActionGroup}.SET_DOC_NUMPAGES`,
  // SET_DOC_ACTIVE_PAGE_NO: `${ActionGroup}.SET_DOC_ACTIVE_PAGE_NO`,
  // SET_DOC_ACTIVE_PDF: `${ActionGroup}.SET_DOC_ACTIVE_PDF`,
});
//]


export const setUrlAndFilename = async (url: string, filename: string) => {
  store.dispatch({
    type: UrlActionType.SET,
    value: { url, filename } as ActionValue,
  });
};

export const setDocNumPages = async (numPages: number) => {
  store.dispatch({
    type: UrlActionType.SET,
    value: { numDocPages: numPages } as ActionValue,
  });
}


export const setActivePageNo = async (pageNo: number) => {
  store.dispatch({
    type: UrlActionType.SET,
    value: { activePageNo: pageNo } as ActionValue,
  });
}

export const setActivePdf = async (pdf: NeoPdfDocument) => {
  const filename = pdf.filename;
  const url = pdf.url;

  store.dispatch({
    type: UrlActionType.SET,
    value: { url, filename, pdf } as ActionValue,
  });

}

export const forceToRenderPanes = async () => {
  store.dispatch({
    type: UrlActionType.RENDER,
    value: 1,
  });
}


const initialState = {
  pdf: undefined as NeoPdfDocument,
  url: undefined as string,
  filename: undefined as string,

  numDocPages: 0,
  activePageNo: -1,

  section: 0,
  owner: 0,
  book: 0,
  page: 0,

  renderCount: 0,
};

type ActionValue = {
  pdf?: NeoPdfDocument,
  url?: string,
  filename?: string,

  numDocPages?: number,
  activePageNo?: number,

  section?: number,
  owner?: number,
  book?: number,
  page?: number,

  renderCount?: number,
}
export type IActivePageState = typeof initialState;

//[Reducer
export default (state = initialState, action) => {
  // console.log(action);

  switch (action.type) {
    case UrlActionType.SET: {
      const value = action.value as typeof initialState;
      return {
        ...state,
        ...value
      };
    }

    case UrlActionType.RENDER: {
      const cnt = state.renderCount;
      return {
        ...state,
        renderCount: cnt + action.value,
      };
    }


    default: {
      return state;
    }
  }
};
//]
