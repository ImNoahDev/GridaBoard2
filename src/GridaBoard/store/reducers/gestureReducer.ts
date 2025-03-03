import { NeoDot } from "../../../nl-lib/common/structures";
import { store } from "../../client/pages/GridaBoard";
import { firebaseAnalytics } from "../../util/firebase_config";


const DoubleTapActionGroup = "DOUBLE_TAP";
const CrossLineActionGroup = "CROSS_LINE";
const SymbolActionGroup = "SYMBOL";
const GestureActionGroup = "GESTURE";


const DoubleTapActionType = Object.freeze({
  INITIALIZE_TAP: `${DoubleTapActionGroup}.INITIALIZE_TAP`,
  INCREMENT_TAP_COUNT: `${DoubleTapActionGroup}.INCREMENT_TAP_COUNT`,
  SET_FIRST_DOT: `${DoubleTapActionGroup}.SET_FIRST_DOT`,
});

const CrossLineActionType = Object.freeze({
  INITIALIZE_CROSS_LINE: `${CrossLineActionGroup}.INITIALIZE_CROSS_LINE`,
  SET_LEFT_TO_RIGHT_DIAGONAL: `${CrossLineActionGroup}.SET_LEFT_TO_RIGHT_DIAGONAL`,
  SET_RIGHT_TO_LEFT_DIAGONAL: `${CrossLineActionGroup}.SET_RIGHT_TO_LEFT_DIAGONAL`,
});

const SymbolActionType = Object.freeze({
  SET_NOT_FIRST_PEN_DOWN: `${SymbolActionGroup}.SET_NOT_FIRST_PEN_DOWN`,
  SHOW: `${SymbolActionGroup}.SHOW`,
  HIDE: `${SymbolActionGroup}.HIDE`
});

const GestureAction = Object.freeze({
  SET_HIDE_CANVAS_MODE: `${GestureActionGroup}.SET_HIDE_CANVAS_MODE`,
  SET_GESTURE_MODE: `${GestureActionGroup}.SET_GESTURE_MODE`,
  SET_GESTURE_DISABLE: `${GestureActionGroup}.SET_GESTURE_DISABLE`,
  SET_PEN_MODE: `${GestureActionGroup}.SET_PEN_MODE`
});

// Double Tap Action Function
export const initializeTap = () => {
  store.dispatch({
    type: DoubleTapActionType.INITIALIZE_TAP
  });
};
export const incrementTapCount = () => {
  store.dispatch({
    type: DoubleTapActionType.INCREMENT_TAP_COUNT
  });
};
export const setFirstDot = (firstDot: NeoDot) => {
  store.dispatch({
    type: DoubleTapActionType.SET_FIRST_DOT, firstDot
  });
};

// Cross Line Action Function
export const initializeCrossLine = () => {
  store.dispatch({
    type: CrossLineActionType.INITIALIZE_CROSS_LINE
  });
};
export const setLeftToRightDiagonal = () => {
  store.dispatch({
    type: CrossLineActionType.SET_LEFT_TO_RIGHT_DIAGONAL
  });
};
export const setRightToLeftDiagonal = () => {
  store.dispatch({
    type: CrossLineActionType.SET_RIGHT_TO_LEFT_DIAGONAL
  });
};

// Symbol Action Function
export const setNotFirstPenDown = (notFirstPenDown: boolean) => {
  store.dispatch({
    type: SymbolActionType.SET_NOT_FIRST_PEN_DOWN, notFirstPenDown
  });
};
export const showSymbol = () => {
  store.dispatch({
    type: SymbolActionType.SHOW
  });
}
export const hideSymbol = () => {
  store.dispatch({
    type: SymbolActionType.HIDE
  });
}

// Hide Canvas Action Function
export const setHideCanvasMode = (hideCanvasMode: boolean) => {
  store.dispatch({
    type: GestureAction.SET_HIDE_CANVAS_MODE, hideCanvasMode
  });
};

// Gesture Action Function
export const setGestureMode = (gestureMode: boolean) => {
  store.dispatch({
    type: GestureAction.SET_GESTURE_MODE, gestureMode
  });
};
export const setIsPageMode = (mode: boolean) => {
  let firebaseText = "";
  if(mode) firebaseText = "plate";
  else firebaseText = "page";
  
  firebaseAnalytics.logEvent(`mode_${firebaseText}`, {
    event_name: `mode_${firebaseText}`
  });
  store.dispatch({
    type: GestureAction.SET_GESTURE_DISABLE, 
    mode
  });
};
export const setIsPenMode = (mode: boolean) => {
  store.dispatch({
    type: GestureAction.SET_PEN_MODE, 
    mode
  });
};

// 초기 상태
const initialState = {
  doubleTap: {
    tapCount: 0,
    firstDot: null
  },
  crossLine: {
    leftToRightDiagonal: false,
    rightToLeftDiagonal: false
  },
  symbol: {
    notFirstPenDown: false,
    show: false,
  },
  hideCanvasMode: false,
  gestureMode: true, // 제스쳐 온오프
  isPageMode : true, // 페이지 모드(true), 플레이트 모드(false)
  isPenMode : true // 펜 모드(true), 마우스 모드(false) (마지막에 쓴 펜 기중)
};

// 리듀서
export default function gestureReducer(state = initialState, action) {
  switch (action.type) {
    case DoubleTapActionType.INITIALIZE_TAP:
      return {
        ...state,
        doubleTap: {
          tapCount: 0,
          firstDot: null
        }
      }
    case DoubleTapActionType.INCREMENT_TAP_COUNT:
      return {
        ...state,
        doubleTap: {
          ...state.doubleTap,
          tapCount: state.doubleTap.tapCount+1
        }
      };
    case DoubleTapActionType.SET_FIRST_DOT:
      return {
        ...state,
        doubleTap: {
          tapCount: 1,
          firstDot: action.firstDot
        }
      }
    case CrossLineActionType.INITIALIZE_CROSS_LINE:
      return {
        ...state,
        crossLine: {
          leftToRightDiagonal: false,
          rightToLeftDiagonal: false  
        }
      }
    case CrossLineActionType.SET_LEFT_TO_RIGHT_DIAGONAL:
      return {
        ...state,
        crossLine: {
          ...state.crossLine,
          leftToRightDiagonal: true
        }
      }
    case CrossLineActionType.SET_RIGHT_TO_LEFT_DIAGONAL:
      return {
        ...state,
        crossLine: {
          ...state.crossLine,
          rightToLeftDiagonal: true
        }
      }
    case SymbolActionType.SET_NOT_FIRST_PEN_DOWN:
      return {
        ...state,
        symbol: {
          ...state.symbol,
          notFirstPenDown: action.notFirstPenDown
        }
      }
    case SymbolActionType.SHOW:
      return {
        ...state,
        symbol: {
          ...state.symbol,
          show: true
        }
      }
    case SymbolActionType.HIDE:
      return {
        ...state,
        symbol: {
          ...state.symbol,
          show: false
        }
      }  
    case GestureAction.SET_HIDE_CANVAS_MODE:
      return {
        ...state,
        hideCanvasMode: action.hideCanvasMode
      }
    case GestureAction.SET_GESTURE_MODE:
      return {
        ...state,
        gestureMode: action.gestureMode
      }
    case GestureAction.SET_GESTURE_DISABLE : 
      return {
        ...state,
        isPageMode : action.mode 
      }
    case GestureAction.SET_PEN_MODE : 
      return {
        ...state,
        isPenMode : action.mode 
      }
    default:
      return state;
  }
}