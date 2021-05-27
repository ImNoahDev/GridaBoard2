import { store } from "../../client/pages/GridaBoard";
import GridaDoc from "../../GridaDoc";
import { INeoSmartpen } from "nl-lib/common/neopen";

import { IPrintOption } from "nl-lib/common/structures";
import { g_defaultPrintOption } from "nl-lib/ncodepod";
import { NeoSmartpen } from "nl-lib/neosmartpen";
//[Define Action Types
const ActionGroup = "APP_CONFIG";

const ACTION_TYPE = Object.freeze({
  SET: `${ActionGroup}.SET`,
  SET_PRINTOPTION: `${ActionGroup}.SET_PRINTOPTION`,
  SET_PENS: `${ActionGroup}.SET_PENS`,
  SET_DOCS_NUM: `${ActionGroup}.SET_DOCS_NUM`,
  GET: `${ActionGroup}.GET`,
});
//]

//[Action Methods

export const setPrintOption = async (printOption: IPrintOption) => {
  store.dispatch({
    type: ACTION_TYPE.SET_PRINTOPTION,
    value: printOption,
  });
};

export const setPens = async (pens: INeoSmartpen[]) => {
  store.dispatch({
    type: ACTION_TYPE.SET_PENS,
    value: pens,
  })
}

export const setDocsNum = (docsNum: number) => ({
    type: ACTION_TYPE.SET_DOCS_NUM,
    value: docsNum,
})
//]


//[Reducer
const initialState = {
  printOption: g_defaultPrintOption,
  pens: [] as INeoSmartpen[],
  num_pens: 0,
  docsNum: 0,
};

export type IAppConfig = typeof initialState;

export default (state = initialState, action) => {
  // console.log(action);

  switch (action.type) {
    case ACTION_TYPE.SET_PENS: {
      return {
        ...state,
        pens: action.value,
        num_pens: action.value.length,
      };

    }
    case ACTION_TYPE.SET_PRINTOPTION: {
      return {
        ...state,
        printOption: action.value,
      };
    }
    case ACTION_TYPE.SET_DOCS_NUM: {
      return {
        ...state,
        docsNum: action.value,
        
      };

    }
    default: {
      return state;
    }
  }
};
//]


GridaDoc.getInstance();
