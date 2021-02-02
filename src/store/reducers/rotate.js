import { store } from "../../client/Root";
const SET_ROTATION_TRRIGER = 'rotate/SET_ROTATION_TRIGGER';

// 액션 생성 함수
export const setRotationTrigger = (rotationTrigger) => {
  store.dispatch({ 
    type: SET_ROTATION_TRRIGER, rotationTrigger 
  });
};

// 초기 상태
const initialState = {
  rotationTrigger: false,
};

// 리듀서 작성
export default function rotate(state = initialState, action) {
  switch (action.type) {
    case SET_ROTATION_TRRIGER:
      return {
        ...state,
        rotationTrigger: action.rotationTrigger,
      };
    default:
      return state;
  }
}