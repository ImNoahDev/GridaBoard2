import { store } from "../../client/pages/GridaBoard";

const ActionGroup = 'LIST';

export const LISTActionTypes = Object.freeze({
  SHOW_GROUP_DIALOG : `${ActionGroup}.SHOW_GROUP_DIALOG`,
  HIDE_GROUP_DIALOG: `${ActionGroup}.HIDE_GROUP_DIALOG`,
  SHOW_DROP_DOWN : `${ActionGroup}.SHOW_DROP_DOWN`,
  HIDE_DROP_DOWN : `${ActionGroup}.HIDE_DROP_DOWN`,
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
export const showDropDown = (option : {type : string, event, selected:string}) => {
  store.dispatch({ 
    type: LISTActionTypes.SHOW_DROP_DOWN,
    ddType : option.type,
    event : option.event,
    selected : option.selected
  });
};
export const hideDropDown = () => {
  store.dispatch({ 
    type: LISTActionTypes.HIDE_DROP_DOWN
  });
};



// 초기 상태
const initialState = {
  groupDialog : {
    show : false,
    type : "",
    selected : "",
    change : false
  },
  dropDown : {
    show : false,
    type : "",
    event : null,
    openType : "vert",
    selected : ""
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
    case LISTActionTypes.SHOW_DROP_DOWN : 
      return {
        ...state,
        dropDown : {
          ...state.dropDown,
          show : true,
          type : action.ddType,
          event : action.event,
          selected : action.selected
        }
      };
    case LISTActionTypes.HIDE_DROP_DOWN : 
      return {
        ...state,
        dropDown : {
          show : false,
          type : "",
          event : null,
          openType : "vert",
          selected : ""
        }
      };
    default:
      return state;
  }
}