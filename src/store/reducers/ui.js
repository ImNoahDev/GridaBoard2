import {store} from "../../client/Root";

//[Define Action Types
const ActionGroup = 'UI';

export const UIActionTypes = Object.freeze({
  SHOW_UI_PROGRESS: `${ActionGroup}.SHOW_UI_PROGRESS`,
  HIDE_UI_PROGRESS: `${ActionGroup}.HIDE_UI_PROGRESS`,
  SHOW_TOAST_MESSAGE: `${ActionGroup}.SHOW_TOAST_MESSAGE`,
  HIDE_TOAST_MESSAGE: `${ActionGroup}.HIDE_TOAST_MESSAGE`,
  SHOW_DIALOG: `${ActionGroup}.SHOW_DIALOG`,
  HIDE_DIALOG: `${ActionGroup}.HIDE_DIALOG`,
  RESET_DIALOG: `${ActionGroup}.RESET_DIALOG`
});
//]

//[Action Methods
export const ShowUIProgressBackdrop = () => {
  store.dispatch({
    type: UIActionTypes.SHOW_UI_PROGRESS
  });
};
export const HideUIProgressBackdrop = () => {
  store.dispatch({
    type: UIActionTypes.HIDE_UI_PROGRESS
  });
};

export const ShowErrorToast = (message) => {
  store.dispatch({
    type: UIActionTypes.SHOW_TOAST_MESSAGE,
    message: message,
    toastType: 'error'
  });
};
export const ShowWarningToast = (message) => {
  store.dispatch({
    type: UIActionTypes.SHOW_TOAST_MESSAGE,
    message: message,
    toastType: 'warning'
  });
};
export const ShowInfoToast = (message) => {
  store.dispatch({
    type: UIActionTypes.SHOW_TOAST_MESSAGE,
    message: message,
    toastType: 'info'
  });
};
export const ShowSuccessToast = (message) => {
  store.dispatch({
    type: UIActionTypes.SHOW_TOAST_MESSAGE,
    message: message,
    toastType: 'success'
  });
};
export const ShowMessageToast = (message) => {
  store.dispatch({
    type: UIActionTypes.SHOW_TOAST_MESSAGE,
    message: message,
    toastType: ''
  });
};
export const HideToastMessage = () => {
  store.dispatch({
    type: UIActionTypes.HIDE_TOAST_MESSAGE
  });
};

export const ShowDialog = (title, message, confirmBtnText, cancelBtnText, isModal, didCloseCallback) => {
  store.dispatch({
    type: UIActionTypes.SHOW_DIALOG,
    title: title,
    message: message,
    confirmBtnText: confirmBtnText,
    cancelBtnText: cancelBtnText,
    isModal: isModal,
    didCloseCallback: didCloseCallback
  });
};
export const HideDialog = () => {
  store.dispatch({
    type: UIActionTypes.HIDE_DIALOG
  });
};
export const ResetDialogConfig = () => {
  store.dispatch({
    type: UIActionTypes.RESET_DIALOG
  });
};
//]

//[Reducer
export default (state={
  progress: {
    circular: false
  },
  toast: {
    show: false,
    message: '',
    toastType: ''
  },
  dialog: {
    show: false,
    title: '',
    message: '',
    confirmBtnText: '',
    cancelBtnText: '',
    okButtonText: '',
    isModal: false,
    didCloseCallback: null
  }
}, action) => {
  switch (action.type) {
    case UIActionTypes.SHOW_UI_PROGRESS: {
      return {
        ...state,
        progress: {
          circular: true
        }
      };
    }
    case UIActionTypes.HIDE_UI_PROGRESS: {
      return {
        ...state,
        progress: {
          circular: false
        }
      };
    }
    case UIActionTypes.SHOW_TOAST_MESSAGE: {
      return {
        ...state,
        toast: {
          show: true,
          message: action.message,
          toastType: action.toastType
        }
      }
    }
    case UIActionTypes.HIDE_TOAST_MESSAGE: {
      return {
        ...state,
        toast: {
          show: false,
          message: ''
        }
      }
    }
    case UIActionTypes.SHOW_DIALOG: {
      return {
        ...state,
        dialog: {
          show: true,
          title: action.title,
          message: action.message,
          confirmBtnText: action.confirmBtnText,
          cancelBtnText: action.cancelBtnText,
          isModal: action.isModal,
          didCloseCallback: action.didCloseCallback
        }
      }
    }
    case UIActionTypes.HIDE_DIALOG: {
      return {
        ...state,
        dialog: {
          ...state.dialog,
          show: false
        }
      }
    }
    case UIActionTypes.RESET_DIALOG: {
      return {
        ...state,
        dialog: {
          show: false,
          title: '',
          message: '',
          confirmBtnText: '',
          cancelBtnText: '',
          okButtonText: '',
          isModal: false,
          didCloseCallback: null
        }
      }
    }
    default: {
      return state;
    }
  }
};
//]
