import classes from "*.module.css";
import { Button, Dialog, DialogProps } from "@material-ui/core";
import { hideGroupDialog } from 'GridaBoard/store/reducers/listReducer';
import React, { useState } from "react";
import {createCategory} from "boardList/BoardListPageFunc2";

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
  closeEvent ?: (isChange:boolean)=>void
  defaultText ?: string | "test"
}

const textCheck = (text:string|false)=>{
  //정규식 조건을 통해서 안될경우 false
  let a = 1;
  if(a == 1)
    return text;
  else
    return false;
}
 

const GroupDialog = (props : Props)=>{
  const { open, closeEvent, type, defaultText, ...rest } = props;
  const defaultValue = defaultText || "";
  let inputer = null as HTMLInputElement;
  
  const [disabled, setDisabled] = useState(true);
  
  let { title, placeHolder, mainWarn } = dialogTypes[type];

  if(type === "changeGroupName"){
    placeHolder = defaultValue;
  }
  const inputChange = (e)=>{
    let cantSave = false;
    let newText:string|false = e.target.value;


    if(newText === defaultValue){
      cantSave = true;
    }
    
    newText = textCheck(newText);
    if(newText === false)
      cantSave = true;
    
    if(!cantSave && newText != "" && disabled){
      setDisabled(false);
    }else if(cantSave || (newText == "" && !disabled)){
      setDisabled(true);
    }
  }
  const createGroup = async ()=>{
    let newText:string|false = inputer.value;
    // createCategory
    newText = textCheck(newText);

    if(newText === false){
      //못바꿈
      return false;
    }

    await createCategory(newText as string);

    closeEvent(true);

  }

  return (
  <Dialog
    disableBackdropClick
    onClose={closeEvent}
    {...rest}
    open={open}
  >
    <div className="title">{title}</div>
    <input ref={(e)=>{inputer=e}} className="inputer" autoFocus placeholder={placeHolder} onChange={inputChange} defaultValue={defaultValue} />
    <div className="warn">{mainWarn}</div>
    <div className="footer">
      <Button variant="contained" disableElevation color="secondary" onClick={()=>{closeEvent(false)}} >취소</Button>
      <Button variant="contained" disableElevation color="primary" disabled={disabled} onClick={()=>{createGroup()}}>저장</Button>
    </div>
  </Dialog> );
}


export default GroupDialog;