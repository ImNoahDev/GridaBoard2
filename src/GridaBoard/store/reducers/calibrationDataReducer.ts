import { store } from "../../client/pages/GridaBoard";

// 액션 타입
const SET_CALIBRATION_DATA = 'SET_CALIBRATION_DATA';

// 액션 생성 함수
export const setCalibrationData = (data) => {
  store.dispatch({ 
    type: SET_CALIBRATION_DATA, data 
  });
};

// 초기 상태
const initialState = {
  calibrationData: {
    section: -1, 
    owner: -1, 
    book: -1, 
    page: -1, 
    nu: {x: -1, y: -1},
  }
};

export type ICalibrationData = typeof initialState;

// 리듀서 작성
export default function calibrationDataReducer(state = initialState, action) {
  switch (action.type) {
    case SET_CALIBRATION_DATA: {
      const data = action.data
      return {
        ...state,
        calibrationData : data,
      };
    }
    default: {
      return state;
    }
  }
}
