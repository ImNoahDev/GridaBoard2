import React from "react";
import { useSelector } from "react-redux";
import { Button, Dialog, DialogProps } from "@material-ui/core";
import {createCategory, changeCategoryName} from "boardList/BoardListPageFunc2";
import { RootState } from "GridaBoard/store/rootReducer";


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
  const defaultValue = useSelector((state: RootState) => state.list.dialog.selected);
  const selectedData = dialogTypes[type];
  console.log(selectedData);

  let subText = selectedData.sub;

  if(type == "deleteDoc"){
    subText = subText.replace("%d","1");
  }


  const success = ()=>{
    if(type == "deleteDoc"){
      alert("1");
    }
    // closeEvent(true);
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