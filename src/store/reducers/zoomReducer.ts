import { store } from "../../client/Root";

const SET_ZOOM = 'rotate/SET_ZOOM';

// 액션 생성 함수
export const setZoomStore = (zoom: number) => {
  store.dispatch({ 
    type: SET_ZOOM, zoom
  });
};

// 초기 상태
const initialState = {
  zoom: 1 as number,
};

// 리듀서 작성
export default function zoom(state = initialState, action) {
  switch (action.type) {
    case SET_ZOOM:
      return {
        ...state,
        zoom: action.zoom as number,
      };
    default:
      return state;
  }
}