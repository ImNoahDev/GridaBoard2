import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Dialog, DialogProps } from "@material-ui/core";
import {createCategory, changeCategoryName} from "boardList/BoardListPageFunc2";
import { RootState } from "GridaBoard/store/rootReducer";
import { deleteBoardFromLive, fbLogout } from "boardList/BoardListPageFunc";
import { forceUpdateBoardList } from "GridaBoard/store/reducers/appConfigReducer";
import { useHistory } from "react-router-dom";
import GridaDoc from "../../../../../GridaBoard/GridaDoc";


const dialogTypes = {
  "deleteDoc" : {
    title : "삭제하시겠습니까",
    sub : "%d개의 파일 휴지동 ㄱㄱ",
    cancel : "취소",
    success : "확인"
  },
  "logout" : {
    title : "로그아웃 하실래요?",
    cancel: "취소",
    success : "확인"
  },
  "toBoardList" : {
    title : "페이지를 벗어나시겠습니까?",
    cancel: "취소",
    success : "확인"
  },
  "deletePage" : {
    title: "페이지를 삭제하시겠습니까?",
    sub : "페이지에 있는 모든 스트로크도 함께 제거됩니다",
    cancel: "취소",
    success : "확인"
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
    subText = subText.replace("%d", count);
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