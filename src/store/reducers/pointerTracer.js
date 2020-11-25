// 액션 타입
const SET_POINTER_TRACER = 'pointerTracer/SET_POINTER_TRACER';

// 액션 생성 함수
export const setPointerTracer = isTrace => ({ type: SET_POINTER_TRACER, isTrace });

// 초기 상태
const initialState = {
  isTrace: true,
};

// 리듀서 작성
export default function pointerTracer(state = initialState, action) {
  switch (action.type) {
    case SET_POINTER_TRACER:
      return {
        ...state,
        isTrace: action.isTrace,
      };
    default:
      return state;
  }
}