const SET_ROTATE = 'rotate/SET_ROTATE';

// 액션 생성 함수
export const setRotationAngle = rotationAngle => ({ type: SET_ROTATE, rotationAngle });

// 초기 상태
const initialState = {
  rotationAngle: 0,
};

// 리듀서 작성
export default function rotate(state = initialState, action) {
  switch (action.type) {
    case SET_ROTATE:
      return {
        ...state,
        rotationAngle: action.rotationAngle,
      };
    default:
      return state;
  }
}