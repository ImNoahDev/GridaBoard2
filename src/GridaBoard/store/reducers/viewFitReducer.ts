import { store } from "../../client/pages/GridaBoard";
import { ZoomFitEnum } from "nl-lib/common/enums";

const SET_VIEW_FIT = 'rotate/SET_VIEW_FIT';

// 액션 생성 함수
export const setViewFit = (viewFit) => {
  store.dispatch({
    type: SET_VIEW_FIT, viewFit
  });
};

// 초기 상태
const initialState = {
  viewFit: ZoomFitEnum.FULL,
};

// 리듀서 작성
export default function viewFit(state = initialState, action) {
  switch (action.type) {
    case SET_VIEW_FIT:
      return {
        ...state,
        viewFit: action.viewFit,
      };
    default:
      return state;
  }
}