import { g_defaultPrintOption } from "./../../NcodePrintLib/DefaultOption";
import { store } from "../../client/Root";
import { IPrintOption } from "../../NcodePrintLib";
import { NeoSmartpen } from "../../neosmartpen";
import GridaDoc from "../../GridaBoard/GridaDoc";
//[Define Action Types
const ActionGroup = "APP_CONFIG";

const ACTION_TYPE = Object.freeze({
  SET: `${ActionGroup}.SET`,
  SET_PRINTOPTION: `${ActionGroup}.SET_PRINTOPTION`,
  SET_PENS: `${ActionGroup}.SET_PENS`,
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

export const setPens = async (pens: NeoSmartpen[]) => {
  store.dispatch({
    type: ACTION_TYPE.SET_PENS,
    value: pens,
  })
}

//]


//[Reducer
const initialState = {
  printOption: g_defaultPrintOption,
  pens: [] as NeoSmartpen[],
  num_pens: 0,
  gridaDoc: GridaDoc.getInstance(),
};

export type IAppConfig = typeof initialState;

export default (state = initialState, action) => {
  // console.log(action);

  switch (action.type) {
    case ACTION_TYPE.SET_PENS: {
      return {
        ...state,
        pens: action.value,
      };

    }


    case ACTION_TYPE.SET_PRINTOPTION: {
      return {
        ...state,
        printOption: action.value,
      };
    }
    default: {
      return state;
    }
  }
};
//]
