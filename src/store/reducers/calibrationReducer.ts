import { store } from "../../client/Root";
//[Define Action Types
const ActionGroup = "CALIBRATION_DLG";

const ACTION_TYPE = Object.freeze({
  SHOW: `${ActionGroup}.SHOW`,
  HIDE: `${ActionGroup}.HIDE`,
  PROGRESS: `${ActionGroup}.PROGRESS`,
});
//]

const SET_CALIBRATION_MODE = 'SET_CALIBRATION_MODE';

type Action = {
  type: any,
  option?: ICalibrationState,
  progress?: number,
  show?: boolean,
  calibrationMode?: boolean,
}
//[Action Methods
export const showCalibrationDialog = async (option: ICalibrationState) => {
  store.dispatch({
    type: ACTION_TYPE.SHOW,
    option,
  });
};

export const hideCalibrationDialog = async () => {
  store.dispatch({
    type: ACTION_TYPE.HIDE,
  });
};

export const updateCalibrationDialog = async (progress: number) => {

  store.dispatch({
    type: ACTION_TYPE.PROGRESS,
    progress,
  });
}

export const calibrationMoveToPage = async (pageNo: number) => {
  const progress = pageNo === 1 ? 0 : pageNo;
  updateCalibrationDialog(progress);
}
//]

export const setCalibrationMode = async (calibrationMode) => {
  store.dispatch({
    type: SET_CALIBRATION_MODE, calibrationMode
  })
}

//[Reducer
const initialState = {
  url: undefined as string,
  
  show: false as boolean,

  targetPages: [] as number[],

  /** 0:page 1 top left,  1:page 1 bottom right,  2:page 2,  3: page 3,  ... */
  progress: 0 as number,

  calibrationMode: false as boolean,
};

export type ICalibrationState = typeof initialState;

export default (state = initialState, action: Action) => {
  // console.log(action);

  switch (action.type) {
    case ACTION_TYPE.SHOW: {
      return {
        ...action.option,
        show: true,
      };
    }

    case ACTION_TYPE.HIDE: {
      return {
        ...state,
        show: false,
      };
    }

    case ACTION_TYPE.PROGRESS: {
      return {
        ...state,
        progress: action.progress,
      };
    }
    case SET_CALIBRATION_MODE: {
      return {
        ...state,
        calibrationMode: action.calibrationMode
      }
    }
    default: {
      return state;
    }
  }
};
//]
