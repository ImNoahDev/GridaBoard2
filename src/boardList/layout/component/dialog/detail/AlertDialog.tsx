import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Dialog, DialogProps } from "@material-ui/core";
import {createCategory, changeCategoryName} from "boardList/BoardListPageFunc2";
import { RootState } from "GridaBoard/store/rootReducer";
import { deleteBoardFromLive, fbLogout } from "boardList/BoardListPageFunc";
import { forceUpdateBoardList } from "GridaBoard/store/reducers/appConfigReducer";
import { useHistory } from "react-router-dom";
import GridaDoc from "../../../../../GridaBoard/GridaDoc";
import getText from "GridaBoard/language/language";

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
      count = subData.data.length;
    }
    selectedData.title = selectedData.title.replace("%d", count);
  }


  const success = async ()=>{
    if(type == "deleteDoc"){
      console.log(selected);
      let deleteData = [selected];
      if(subData !== null){
        deleteData = subData.data;
      }
      console.log(deleteData);
      const result = await deleteBoardFromLive(deleteData);
      
      if (result === 1) {
        dispatch(forceUpdateBoardList());
      }
    } else if (type === "logout") {
      fbLogout();
      routeChangeToLogin();
    } else if (type === "toBoardList") {
      routeChangeToBoardList();
    } else if (type === "deletePage") {
      if(activePageNo === -1) return ;
      GridaDoc.getInstance().removePages(activePageNo);
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

  return (
    <Dialog
      disableBackdropClick
      onClose={closeEvent}
      {...rest}
      open={open}
    >
      <div className="title">{selectedData.title}</div>
      <div className="warn">{subText}</div>
      <div className="footer">
        <Button variant="contained" disableElevation color="secondary" onClick={()=>{closeEvent(false)}} >{selectedData.cancel}</Button>
        <Button variant="contained" disableElevation color="primary" onClick={()=>{success()}}>{selectedData.success}</Button>
      </div>
    </Dialog>);
}


export default AlertDialog;