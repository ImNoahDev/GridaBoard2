import React from "react";
import { makeStyles, Dialog, DialogProps} from "@material-ui/core";
import { useSelector } from "react-redux";
import { RootState } from "GridaBoard/store/rootReducer";
import { showGroupDialog, hideGroupDialog, changeGroup } from 'GridaBoard/store/reducers/listReducer';
import getText from "GridaBoard/language/language";
import GroupDialog from "./detail/GroupDialog";
import MoveDialog from "./detail/MoveDialog";
import AlertDialog from "./detail/AlertDialog";

const useStyle = makeStyles(theme=>({
  groupDialog : {
    minWidth : "360px",
    minHeight : "255px",
    "& > .title" : {
      marginTop : "40px",
    },
    "& > .inputer" : {
      marginTop : "16px",
    },
    "& > .warn" : {
      width: "272px",
      height : "32px",
      fontSize: "12px",
      lineHeight: "14px",
      marginTop: "8px",
    },
  },
  alertDialog: {
    minWidth : "360px",
    minHeight : "215px",
    "& > .title" : {
      marginTop : "40px",
    },
    "& > .warn" : {
      width: "100%",
      height : "40px",
      fontSize: "14px",
      lineHeight: "16px",
      marginTop: "16px",
      display: "flex",
      textAlign : "center",
      justifyContent : "center",
      alignItems : "center",
    },

  },
  paper : {
    background: theme.custom.white[90],
    boxShadow : theme.custom.shadows[0],
    borderRadius: "12px",
    alignItems: "center",
    "& > .title" : {
      display: "flex",
      justifyContent : "center",
      alignItems : "center",
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
      border: "1px solid " + theme.custom.grey[3],
      boxSizing: "border-box",
      borderRadius: "8px",
      paddingLeft : "12px",
    },
    "& > .warn" : {
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: "normal",
      display: "flex",
      letterSpacing: "0.25px",
      color : theme.palette.text.secondary,
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
  test ?: string,
  docsObj ?:{
    docs: any[],
    category: any[],
  }
}


const CombineDialog = (props : Props)=>{
  const { onClose, open , docsObj} = props;
  const classes = useStyle();
  
  const diaType = useSelector((state: RootState) => state.list.dialog.type);

  const closeEvent = (isChange:boolean)=>{
    hideGroupDialog();
    changeGroup(isChange);
  }

  const groupProps = {
    closeEvent : closeEvent,
    open:open,
    type:diaType,
    classes : {
      paper : `${classes.paper}`
    }
  };
  let returnDialog = null;
  if(["newGroup", "changeGroupName", "changeDocName"].includes(diaType)){
    groupProps.classes.paper += `  ${classes.groupDialog}`;
    returnDialog = (<GroupDialog {...groupProps} />);
  }else if(["moveDoc"].includes(diaType)){
    groupProps.classes.paper += `  ${classes.groupDialog}`;
    returnDialog = (<MoveDialog {...groupProps} docsObj={docsObj}/>);
  }else if(["deleteDoc", "logout", "toBoardList", "deletePage"].includes(diaType)){
    groupProps.classes.paper += `  ${classes.alertDialog}`;
    returnDialog = (<AlertDialog {...groupProps} />);
  }

  return returnDialog;
}

export default CombineDialog;