import { store } from "../../client/pages/GridaBoard";

const ActionGroup = 'LIST';

export const LISTActionTypes = Object.freeze({
  SHOW_GROUP_DIALOG : `${ActionGroup}.SHOW_GROUP_DIALOG`,
  HIDE_GROUP_DIALOG: `${ActionGroup}.HIDE_GROUP_DIALOG`,
});
// 액션 생성 함수
export const showGroupDialog = (option : {type : string, selected ?: string}) => {
  store.dispatch({ 
    type: LISTActionTypes.SHOW_GROUP_DIALOG, 
    diaType : option.type,
    selected : option.selected || ""
  });
};
export const hideGroupDialog = (isChange: boolean) => {
  store.dispatch({ 
    type: LISTActionTypes.HIDE_GROUP_DIALOG,
    change : isChange
  });
};

// 초기 상태
const initialState = {
  groupDialog : {
    show : false,
    type : "",
    selected : "",
    change : false
  }
};

// 리듀서 작성
export default function loadingVisible(state = initialState, action) {
  switch (action.type) {
    case LISTActionTypes.SHOW_GROUP_DIALOG :
      return {
        ...state,
        groupDialog : {
          ...state.groupDialog,
          show : true,
          type : action.diaType as string,
          selected : action.selected as string,
        }
      };
    case LISTActionTypes.HIDE_GROUP_DIALOG : 
      return {
        ...state,
        groupDialog : {
          show : false,
          type : "",
          selected : "",
          change : action.change
        }
      };
    default:
      return state;
  }
}