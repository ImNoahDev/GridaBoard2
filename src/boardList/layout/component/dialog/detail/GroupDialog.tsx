import classes from "*.module.css";
import { Button, Dialog, DialogProps } from "@material-ui/core";
import { hideGroupDialog } from 'GridaBoard/store/reducers/listReducer';
import React, { useState } from "react";


const dialogTypes = {
  "newGroup" : {
    title : "새 그룹 생성",
    placeHolder : "그룹 이름",
    mainWarn  : "새로운 그룹 이름을 입력해주세요",
  },
  "changeGroupName" : {
    title : "그룹 이름 변경",
    placeHolder : "",
    mainWarn  : "새로운 그룹 이름을 입력해주세요",
  }
};


interface Props extends  DialogProps {
  type ?: string
  closeEvent ?: ()=>void
  defaultText ?: string | "test"
}
 

const GroupDialog = (props : Props)=>{
  const { open, closeEvent, type, defaultText, ...rest } = props;
  const defaultValue = defaultText || "";
  
  const [disabled, setDisabled] = useState(true);
  
  let { title, placeHolder, mainWarn } = dialogTypes[type];

  if(type === "changeGroupName"){
    placeHolder = defaultValue;
  }
  const inputChange = (e)=>{
    let cantSave = false;
    const newText = e.target.value;

    if(newText === defaultValue){
      cantSave = true;
    }
    
    
    if(!cantSave && newText != "" && disabled){
      setDisabled(false);
    }else if(cantSave || (newText == "" && !disabled)){
      setDisabled(true);
    }
  }

  return (
  <Dialog
    disableBackdropClick
    onClose={closeEvent}
    {...rest}
    open={open}
  >
    <div className="title">{title}</div>
    <input className="inputer" autoFocus placeholder={placeHolder} onChange={inputChange} defaultValue={defaultValue} />
    <div className="warn">{mainWarn}</div>
    <div className="footer">
      <Button variant="contained" disableElevation color="secondary" onClick={()=>{closeEvent()}} >취소</Button>
      <Button variant="contained" disableElevation color="primary" disabled={disabled}>저장</Button>
    </div>
  </Dialog> );
}


export default GroupDialog;