import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Dialog, DialogProps } from "@material-ui/core";
import {createCategory, changeCategoryName} from "boardList/BoardListPageFunc2";
import { RootState } from "GridaBoard/store/rootReducer";
import { deleteBoardFromLive, fbLogout } from "boardList/BoardListPageFunc";
import { forceUpdateBoardList } from "GridaBoard/store/reducers/appConfigReducer";
import { useHistory } from "react-router-dom";
import GridaDoc from "GridaBoard/GridaDoc";
import getText from "GridaBoard/language/language";
import { InkStorage } from "nl-lib/common/penstorage";
import { PageEventName } from "nl-lib/common/enums";
import { showSnackbar } from "../../../../../GridaBoard/store/reducers/listReducer";

const confirmText = getText('print_popup_yes');
const cancelText = getText('print_popup_no');

const dialogTypes = {
  "deleteDoc" : {
    title : getText('deleteBoard_title'),
    sub : getText('deleteBoard_sub'),
    cancel : cancelText,
    success : confirmText
  },
  "logout" : {
    title : getText('profile_logout_msg'),
    cancel: cancelText,
    success : confirmText
  },
  "toBoardList" : {
    title : getText('toBoardList_title'),
    sub: getText('toBoardList_sub'),
    cancel: cancelText,
    success : confirmText
  },
  "deletePage" : {
    title: getText('deletePage_title'),
    cancel: cancelText,
    success : confirmText
  },
  "clearPage" : {
    title: getText('clearPage_title'),
    cancel: cancelText,
    success : confirmText
  }
}

interface Props extends  DialogProps {
  type ?: string
  closeEvent ?: (isChange:boolean)=>void
}

const AlertDialog = (props : Props)=>{
  const { open, closeEvent, type,  ...rest } = props;
  const activePageNo = useSelector((state: RootState) => state.activePage.activePageNo);
  const selected = useSelector((state: RootState) => state.list.dialog.selected);
  const subData = useSelector((state: RootState) => state.list.dialog.sub);
  const dispatch = useDispatch();
  const history = useHistory();

  const selectedData = dialogTypes[type];
  console.log(selectedData);

  let subText = selectedData.sub;

  if(type == "deleteDoc"){
    let count = 1;
    if(subData !== null){
      selectedData.title = getText('deleteBoard_title');
      count = subData.data.length;
    }
    selectedData.title = selectedData.title.replace("%d", count);
  }


  const success = async ()=>{

    switch (type) {
      case "deleteDoc" : {
        let deleteData = [selected];
        if(subData !== null){
          deleteData = subData.data;
        }
        const result = await deleteBoardFromLive(deleteData);
        
        if (result === 1) {
          dispatch(forceUpdateBoardList());

          const selectedDocNames: string[] = [];
          for (const doc of subData.data) {
            selectedDocNames.push(doc.doc_name);
          }
          showSnackbar({
            snackbarType : "deleteDoc",
            selectedDocName : selectedDocNames,
            selectedCategory : getText('boardList_trashBin'),
            categoryData : "trash"
          })
        }
        break;
      }
      case "logout" : {
        fbLogout();
        routeChangeToLogin();
        break;
      }
      case "toBoardList" : {
        routeChangeToBoardList();
        break;
      }
      case "deletePage" : {
        if (activePageNo === -1) return ;
        await GridaDoc.getInstance().removePages(activePageNo);
        console.log("!!");
        break;
      }
      case "clearPage" : {
        const doc = GridaDoc.getInstance();
        const pageInfo = doc.getPage(activePageNo).pageInfos[0];
    
        const inkStorage = InkStorage.getInstance();
        inkStorage.dispatcher.dispatch(PageEventName.PAGE_CLEAR, pageInfo);
        inkStorage.removeStrokeFromPage(pageInfo);
        break;
      }
      default: break;
    }
    
    closeEvent(false)
  }

  const routeChangeToLogin = () => {
    const path = `/`;
    history.push(path);
  }

  const routeChangeToBoardList = () => {
    const path = `/list`;
    history.push(path);
  }

  const isWarn = subText !== undefined;
  console.log(subText);

  return (
    <Dialog
      disableBackdropClick
      onClose={closeEvent}
      {...rest}
      open={open}
    >
      <div className={`title ${isWarn?"" : "noWarnTitle" }`}>{selectedData.title}</div>
      {isWarn ? (<div className="warn">{subText}</div>) : ""}      
      <div className="footer">
        <Button variant="contained" disableElevation color="secondary" onClick={()=>{closeEvent(false)}} >{selectedData.cancel}</Button>
        <Button variant="contained" disableElevation color="primary" onClick={()=>{success()}}>{selectedData.success}</Button>
      </div>
    </Dialog>);
}


export default AlertDialog;