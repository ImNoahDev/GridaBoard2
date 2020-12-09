const SET_ROTATE = 'rotate/SET_ROTATE';

// 액션 생성 함수
export const setRotate = isRotate => ({ type: SET_ROTATE, isRotate });

// 초기 상태
const initialState = {
  isRotate: false,
};

// 리듀서 작성
export default function rotate(state = initialState, action) {
  switch (action.type) {
    case SET_ROTATE:
      return {
        ...state,
        isRotate: action.isRotate,
      };
    default:
      return state;
  }
}