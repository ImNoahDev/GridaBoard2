
import { Button, Dialog, DialogProps } from "@material-ui/core";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "GridaBoard/store/rootReducer";


interface Props extends  DialogProps {
  type ?: string
  closeEvent ?: (isChange:boolean)=>void
}


const DocsDialog = (props: Props)=>{
  const { open, closeEvent, type,  ...rest } = props;

  let inputer = null as HTMLInputElement;
  
  const [disabled, setDisabled] = useState(true);
  
  const defaultValue = useSelector((state: RootState) => state.list.dialog.selected);
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!",defaultValue); 
  let title = "1", placeHolder="2", mainWarn="3" ;

  const save = async ()=>{
    
  }
  return (<Dialog
    disableBackdropClick
    onClose={closeEvent}
    {...rest}
    open={open}
  >
    <div className="title">{title}</div>
    <input ref={(e)=>{inputer=e}} className="inputer" autoFocus placeholder={placeHolder} />
    <div className="warn">{mainWarn}</div>
    <div className="footer">
      <Button variant="contained" disableElevation color="secondary" onClick={()=>{closeEvent(false)}} >취소</Button>
      <Button variant="contained" disableElevation color="primary" disabled={disabled} onClick={()=>{save()}}>저장</Button>
    </div>
  </Dialog>);
};

export default DocsDialog;