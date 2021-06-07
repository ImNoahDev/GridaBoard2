import { store } from "../../client/pages/GridaBoard";

const ActionGroup = 'LIST';

export const LISTActionTypes = Object.freeze({
  SHOW_GROUP_DIALOG : `${ActionGroup}.SHOW_GROUP_DIALOG`,
  HIDE_GROUP_DIALOG: `${ActionGroup}.HIDE_GROUP_DIALOG`,
  SHOW_DROP_DOWN : `${ActionGroup}.SHOW_DROP_DOWN`,
  HIDE_DROP_DOWN : `${ActionGroup}.HIDE_DROP_DOWN`,
  CHANGE_GROUP : `${ActionGroup}.CHANGE_GROUP`,
  SHOW_ALERT : `${ActionGroup}.SHOW_ALERT`,
  HIDE_ALERT : `${ActionGroup}.HIDE_ALERT`,
});
// 액션 생성 함수
export const showGroupDialog = (option : {type : string, selected ?: any}) => {
  store.dispatch({ 
    type: LISTActionTypes.SHOW_GROUP_DIALOG, 
    diaType : option.type,
    selected : option.selected || null
  });
};
export const hideGroupDialog = () => {
  store.dispatch({ 
    type: LISTActionTypes.HIDE_GROUP_DIALOG
  });
};
export const showDropDown = (option : {type : string, event, selected:any}) => {
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
export const changeGroup = (isChange: boolean) => {
  store.dispatch({ 
    type: LISTActionTypes.CHANGE_GROUP,
    change : isChange
  });
};
export const showAlert = (option : {type : string, selected ?: any, sub ?:any}) => {
  store.dispatch({ 
    type: LISTActionTypes.SHOW_ALERT,
    diaType : option.type,
    selected : option.selected || null,
    sub : option.sub || null
  });
};
export const hideAlert = () => {
  store.dispatch({ 
    type: LISTActionTypes.HIDE_ALERT
  });
};



// 초기 상태
const initialState = {
  isChange : {
    group : false
  },
  dialog : {
    show : false,
    type : "",
    selected : null,
    sub : null
  },
  dropDown : {
    show : false,
    type : "",
    event : null,
    openType : "vert",
    selected : null
  }
};

// 리듀서 작성
export default function listReducer(state = initialState, action) {
  switch (action.type) {
    case LISTActionTypes.SHOW_GROUP_DIALOG :
      return {
        ...state,
        dialog : {
          ...state.dialog,
          show : true,
          type : action.diaType as string,
          selected : action.selected,
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
          selected : null
        }
      };
    case LISTActionTypes.CHANGE_GROUP : 
      return {
        ...state,
        isChange : {
          ...state.isChange,
          group : action.change
        }
      }
    case LISTActionTypes.SHOW_ALERT : 
      return {
        ...state,
        dialog : {
          ...state.dialog,
          show : true,
          type : action.diaType as string,
          selected : action.selected,
          sub : action.sub
        }
      }
    case LISTActionTypes.HIDE_GROUP_DIALOG : 
    case LISTActionTypes.HIDE_ALERT : 
      return {
        ...state,
        dialog : {
          ...state.dialog,
          show : false,
          type : "",
          selected : null,
          sub : null
        }
      }
    default:
      return state;
  }
}