import { store } from "../../client/pages/GridaBoard";

//[Define Action Types
const ActionGroup = "ACTIVE_PEN";

const UrlActionType = Object.freeze({
  SET: `${ActionGroup}.SET`,
  GET: `${ActionGroup}.GET`,

  RENDER: `${ActionGroup}.RENDER`,
});
//]

export const forceToRenderNav = async () => {
  store.dispatch({
    type: UrlActionType.RENDER,
    value: 1,
  });
}


const initialState = {
  renderCount: 0,
};

type ActionValue = {
  renderCount?: number,
}

export type IActivePageState = typeof initialState;

//[Reducer
export default (state = initialState, action) => {
  // console.log(action);

  switch (action.type) {
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
