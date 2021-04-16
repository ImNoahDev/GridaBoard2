import { store } from "../../client/Root";
import { getBrowserZoomFactor } from "nl-lib/common/util";

//[Define Action Types
const ActionGroup = 'UI';

export const UIActionTypes = Object.freeze({


  SHOW_UI_PROGRESS: `${ActionGroup}.SHOW_UI_PROGRESS`,
  HIDE_UI_PROGRESS: `${ActionGroup}.HIDE_UI_PROGRESS`,
  SHOW_TOAST_MESSAGE: `${ActionGroup}.SHOW_TOAST_MESSAGE`,
  HIDE_TOAST_MESSAGE: `${ActionGroup}.HIDE_TOAST_MESSAGE`,
  SHOW_DIALOG: `${ActionGroup}.SHOW_DIALOG`,
  HIDE_DIALOG: `${ActionGroup}.HIDE_DIALOG`,
  RESET_DIALOG: `${ActionGroup}.RESET_DIALOG`,
  SHOW_PROGRESS_DIALOG: `${ActionGroup}.SHOW_PROGRESS_DIALOG`,
  HIDE_PROGRESS_DIALOG: `${ActionGroup}.HIDE_PROGRESS_DIALOG`,
  UPDATE_PROGRESS_DIALOG: `${ActionGroup}.UPDATE_PROGRESS_DIALOG`,

  UPDATE_DRAWER_WITH: `${ActionGroup}.UPDATE_DRAWER_WITH`,
  UPDATED_SELECTD_PAGE: `${ActionGroup}.UPDATED_SELECTD_PAGE`,

  REPORT_BROWSER_ZOOM: `${ActionGroup}.REPORT_BROWSER_ZOOM`,
  
  SHOW_SHORTCUT: `${ActionGroup}.SHOW_SHORTCUT`,
});
//]

//[Action Methods
export const reportBrowserZoomFactor = (zoom: number) => {
  store.dispatch({
    type: UIActionTypes.REPORT_BROWSER_ZOOM,
    zoom: zoom
  });

}
export const showShortCut = (show: boolean) => {
  store.dispatch({
    type: UIActionTypes.SHOW_SHORTCUT,
    show: show
  });

}


export const showUIProgressBackdrop = () => {
  store.dispatch({
    type: UIActionTypes.SHOW_UI_PROGRESS
  });
};
export const hideUIProgressBackdrop = () => {
  store.dispatch({
    type: UIActionTypes.HIDE_UI_PROGRESS
  });
};

export const showErrorToast = (message) => {
  store.dispatch({
    type: UIActionTypes.SHOW_TOAST_MESSAGE,
    message: message,
    toastType: 'error'
  });
};
export const showWarningToast = (message) => {
  store.dispatch({
    type: UIActionTypes.SHOW_TOAST_MESSAGE,
    message: message,
    toastType: 'warning'
  });
};
export const showInfoToast = (message) => {
  store.dispatch({
    type: UIActionTypes.SHOW_TOAST_MESSAGE,
    message: message,
    toastType: 'info'
  });
};
export const showSuccessToast = (message) => {
  store.dispatch({
    type: UIActionTypes.SHOW_TOAST_MESSAGE,
    message: message,
    toastType: 'success'
  });
};
export const showMessageToast = (message) => {
  store.dispatch({
    type: UIActionTypes.SHOW_TOAST_MESSAGE,
    message: message,
    toastType: ''
  });
};
export const hideToastMessage = () => {
  store.dispatch({
    type: UIActionTypes.HIDE_TOAST_MESSAGE
  });
};



export const showDialog = (options: { title, message, confirmBtnText, cancelBtnText, isModal, didCloseCallback }) => {
  const { title, message, confirmBtnText, cancelBtnText, isModal, didCloseCallback } = options;
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
export const hideDialog = () => {
  store.dispatch({
    type: UIActionTypes.HIDE_DIALOG
  });
};
export const resetDialogConfig = () => {
  store.dispatch({
    type: UIActionTypes.RESET_DIALOG
  });
};


export const showProgressDlg = async (option: { title: string, messages: string }) => {
  store.dispatch({
    type: UIActionTypes.SHOW_PROGRESS_DIALOG,
    title: option.title,
  });
};

export const hideProgressDlg = async () => {
  store.dispatch({
    type: UIActionTypes.HIDE_PROGRESS_DIALOG,
  });
};

export const updateProgressDlg = async (option: { progress: number }) => {
  store.dispatch({
    type: UIActionTypes.UPDATE_PROGRESS_DIALOG,
    progress: option.progress,
  });
}


export const updateDrawerWidth = async (option: { width: number }) => {
  store.dispatch({
    type: UIActionTypes.UPDATE_DRAWER_WITH,
    width: option.width,
  });
}

export const updateSelectedPage = async (option: { pageNo: number }) => {
  store.dispatch({
    type: UIActionTypes.UPDATED_SELECTD_PAGE,
    pageNo: option.pageNo,
  });
}

//]


const defaultDrawerWidth = 180;
// export let g_drawerWidth = defaultDrawerWidth;
const initialState = {
  waiting: {
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
  },
  progress: {
    show: false,
    title: '',
    message: '',
    progress: 0,
  },
  drawer: {
    width: defaultDrawerWidth,
    pageNo: 0,
  },
  browser: {
    zoom: getBrowserZoomFactor(),
  },
  shotcut : {
    show : false
  }
}

//[Reducer
export default (state = initialState, action) => {
  switch (action.type) {
    case UIActionTypes.REPORT_BROWSER_ZOOM: {
      return {
        ...state,
        browser: {
          zoom: action.zoom,
        }
      };
    }
    case UIActionTypes.SHOW_SHORTCUT: {
      return {
        ...state,
        shotcut: {
          show: action.show,
        }
      };
    }

    case UIActionTypes.SHOW_UI_PROGRESS: {
      return {
        ...state,
        waiting: {
          circular: true
        }
      };
    }
    case UIActionTypes.HIDE_UI_PROGRESS: {
      return {
        ...state,
        waiting: {
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

    case UIActionTypes.UPDATE_DRAWER_WITH: {
      return {
        ...state,
        drawer: {
          ...state.drawer,
          width: action.width,
        }
      }
    }

    case UIActionTypes.UPDATED_SELECTD_PAGE: {
      return {
        ...state,
        drawer: {
          ...state.drawer,
          pageNo: action.pageNo,
        }
      }
    }


    default: {
      return state;
    }
  }
};
//]
