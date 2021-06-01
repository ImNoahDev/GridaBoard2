import React from "react";
import { makeStyles, Dialog, DialogProps} from "@material-ui/core";
import { useSelector } from "react-redux";
import { RootState } from "GridaBoard/store/rootReducer";
import { showGroupDialog, hideGroupDialog } from 'GridaBoard/store/reducers/listReducer';
import getText from "GridaBoard/language/language";
import GroupDialog from "./detail/GroupDialog"
import classes from "*.module.sass";

const useStyle = makeStyles(theme=>({
  paper : {
    background: theme.custom.white[90],
    boxShadow : theme.custom.shadows[0],
    borderRadius: "12px",
    minWidth : "360px",
    minHeight : "255px",
    alignItems: "center",
    "& > .title" : {
      display: "flex",
      justifyContent : "center",
      alignItems : "center",
      marginTop : "40px",
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: "bold",
      fontSize: "20px",
      lineHeight: "23px",
      letterSpacing: "0.25px",
      color : theme.palette.text.primary
    },
    "& > .inputer" : {
      width: "296px",
      height: "40px",
      marginTop : "16px",
      border: "1px solid " + theme.custom.grey[3],
      boxSizing: "border-box",
      borderRadius: "8px",
      paddingLeft : "12px",
    },
    "& > .warn" : {
      width: "272px",
      height : "32px",
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "12px",
      lineHeight: "14px",
      display: "flex",
      letterSpacing: "0.25px",
      color : theme.palette.text.secondary,
      marginTop: "8px",
      marginBottom: "8px",
    },
    "& > .footer" : {
      height: "88px",
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems : "center",
      padding: "0 24px",
      "& > button" : {
        height : "40px",
        width: "152px",
        boxSizing: "border-box",
        borderRadius: "60px",

        "&:first-child" : {
          border: "1px solid" + theme.custom.icon.mono[2],
        }
      }
    }
  }
}))
interface Props extends  DialogProps {
  test ?: string
}


const CombineDialog = (props : Props)=>{
  const { onClose, open } = props;
  const classes = useStyle();
  
  const diaType = useSelector((state: RootState) => state.list.groupDialog.type);

  const closeEvent = ()=>{
    hideGroupDialog();
  }

  const groupProps = {
    closeEvent : closeEvent,
    open:open,
    type:diaType,
    classes : {
      paper : classes.paper
    },
    defaultText : ""
  };
  let returnDialog = null;
  if(["newGroup", "changeGroupName"].includes(diaType)){
    if(diaType === "changeGroupName"){
      groupProps.defaultText = "test";
    }
    returnDialog = (<GroupDialog {...groupProps} />);
  }

  return returnDialog;
}

export default CombineDialog;