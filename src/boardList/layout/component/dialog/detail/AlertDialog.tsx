import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Dialog, DialogProps } from "@material-ui/core";
import {createCategory, changeCategoryName} from "boardList/BoardListPageFunc2";
import { RootState } from "GridaBoard/store/rootReducer";
import { deleteBoardFromLive } from "boardList/BoardListPageFunc";
import { forceUpdateBoardList } from "GridaBoard/store/reducers/appConfigReducer";


const dialogTypes = {
  "deleteDoc" : {
    title : "삭제하시겠습니까",
    sub : "%d개의 파일 휴지동 ㄱㄱ",
    cancel : "취소",
    success : "확인"
  }
}



interface Props extends  DialogProps {
  type ?: string
  closeEvent ?: (isChange:boolean)=>void
}



const AlertDialog = (props : Props)=>{
  const { open, closeEvent, type,  ...rest } = props;
  const selected = useSelector((state: RootState) => state.list.dialog.selected);
  const subData = useSelector((state: RootState) => state.list.dialog.sub);
  const dispatch = useDispatch();


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
    }
    closeEvent(false)
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