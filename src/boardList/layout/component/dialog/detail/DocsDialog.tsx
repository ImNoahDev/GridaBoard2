
import { Button, Dialog, DialogProps } from "@material-ui/core";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "GridaBoard/store/rootReducer";


interface Props extends  DialogProps {
  type ?: string
  closeEvent ?: (isChange:boolean)=>void
}


const DocsDialog = (props: Props)=>{

  return (<div > asd</div>);
};

export default DocsDialog;