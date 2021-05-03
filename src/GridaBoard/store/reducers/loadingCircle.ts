import { store } from "../../client/pages/GridaBoard";
const SET_VISIBLILITY = 'loading/SET_VISIBLILITY';

// 액션 생성 함수
export const setLoadingVisibility = (visible) => {
  store.dispatch({ 
    type: SET_VISIBLILITY, visible 
  });
};

// 초기 상태
const initialState = {
  visible: false,
};

// 리듀서 작성
export default function loadingVisible(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBLILITY:
      return {
        ...state,
        visible: action.visible,
      };
    default:
      return state;
  }
}