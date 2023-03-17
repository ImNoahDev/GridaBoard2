import {
  Box, Button, Dialog, DialogActions,
  DialogTitle, makeStyles
} from '@material-ui/core';
import React from 'react';
import { savePDF } from "./SavePdf";
import { saveGrida } from "./SaveGrida";
import PdfDialogTextArea from './PdfDialogTextArea';
import { turnOnGlobalKeyShortCut } from '../GlobalFunctions';
import getText from "../language/language";
import { overwrite, saveGridaToDB } from 'boardList/BoardListPageFunc';
import { store } from '../client/pages/GridaBoard';
import { setDocId, setDocName, setIsNewDoc } from '../store/reducers/docConfigReducer';


const useStyles = makeStyles((theme) => {
  return ({
    dropdownBtn : {
      width: "200px",
      height: "40px",
      padding: "4px 12px",
      display: "flex",
      justifyContent: "left",
      "&:hover" : {
        background : theme.custom.icon.blue[3],
        color: theme.palette.action.hover
      }
    },
    title: {
      width: "450px",
    },
    titleBox: {
      justifyContent: "center",
      alignItems: "center",
      fontSize: 20,
      textAlign: "center",
    },
    dialog : {
      "& > div > div" : {
        padding : "8px 0px"
      }
    },
    dialogAction : {
      paddingBottom : "15px",
      position: "relative",
      "& > div" : {
        color: "red",
        position: "absolute",
        left: "0",
        paddingLeft: "26px",
        fontSize: "11px",
        top: "13px",
        display: "flex",
        flexDirection: "column",
      }
    },
    button: {
      border: "1px solid black",
      "&:last-child" : {
        marginRight : "14px"
      }
    },
    warn : {
      padding : "0 26px",
      fontSize: "11px",
      "&>span" : {
        color:"red"
      }
    }
  });
});
type Props = {
  saveType : "grida" | "pdf" | "saveAs" | "overwrite",
  handleClickSaveAway ?: ()=>void,
  disabled?: boolean,
}
const SavePdfDialog = (props: Props) => {
  const {saveType, handleClickSaveAway } = props;


  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const [warn1Open, setWarn1Open] =  React.useState(false);
  const [warn2Open, setWarn2Open] =  React.useState(false);

  let selectedName = '';

  const setName = (propName: string) => {
    selectedName = propName;

    if(saveType == "grida")
      selectedName += ".grida";
  }

  const onReset = () => {
    selectedName = '';
    turnOnGlobalKeyShortCut(true);
  };

  const handleDialogOpen = async (saveType: string) => {
    const isNewDoc = store.getState().docConfig.isNewDoc;
    if (saveType === "overwrite" && !isNewDoc) {
      setOpen(false)
      await overwrite();
      handleClickSaveAway();
    } else {
      setOpen(true);
      turnOnGlobalKeyShortCut(false);
    }
  };

  const handleDialogClose = () => {
    setOpen(false);
    onReset();
  };

  const handleSavePdf = async () => {
    //공백과 .으로는 시작 할 수 없음
    let rtTrue = true;
    if(selectedName == ""){
      rtTrue = false;
    }
    if(saveType == "grida" && selectedName.length > 26){
      setWarn2Open(true);
      rtTrue = false;
    }else if(saveType !== "grida" && selectedName.length > 20){
      setWarn2Open(true);
      rtTrue = false;
    }else{
      setWarn2Open(false);
    }
    if(selectedName.search(/^[. ]/g) !== -1){
      //첫글자가 공백 혹은 .임
      setWarn1Open(true);
      rtTrue = false;
    }else{
      setWarn1Open(false);
    }
    if(selectedName.search(/[^a-zA-Z0-9가-힇ㄱ-ㅎㅏ-ㅣぁ-ゔァ-ヴー々〆〤一-龥0-9.+_\- .]/g) !== -1){
      /**
       * 허용된 문자
       * 알파벳 : a-z , A-Z
       * 한글 : 가-힇, ㄱ-ㅎ, ㅏ-ㅣ
       * 일어 : ぁ-ゔ, ァ-ヴ, ー々〆〤
       * 한자 : 一-龥
       * 숫자 : 0-9
       * 특문 : + _ - 공백 .
       * 
       * 이외의 것이 있을 경우 진입
       */
      let text = getText("filename_onlyallowed");
      text = text.replace("%[allow]", getText("filename_allow"));
      alert(text);
      rtTrue = false;
    }
    if(!rtTrue) return ;

    if(saveType == "grida"){
      saveGrida(selectedName);
    }else if (saveType === "pdf") {
      savePDF(selectedName);
    } else if (saveType === "saveAs" || saveType === "overwrite") {
      const gridaFileName = await saveGridaToDB(selectedName);
      setDocName(selectedName);
      
      const docId = gridaFileName.slice(0, gridaFileName.length - 6);
      setDocId(docId);
      
      setIsNewDoc(false);
    } 
    setOpen(false);
    onReset();
    handleClickSaveAway();
  }
  const warnText = getText("filename_onlyallowed").split("%[allow]");
  // const handleEntering = () => {
  //   if (radioGroupRef.current != null) {
  //     radioGroupRef.current.focus();
  //   }
  // };

  const onKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSavePdf();
    }
  }

  return (
    <div>
      {/* <GridaToolTip open={true} placement="top-end" tip={{
        head: "PDF File Save",
        msg: "PDF 파일을 로컬에 저장하는 버튼입니다.",
        tail: "키보드 버튼 ?로 선택 가능합니다"
      }} title={undefined}> */}
        <Button className={`${classes.dropdownBtn} ${saveType==="pdf"? "save_drop_down": ""}`} onClick={() => handleDialogOpen(saveType)} disabled={props.disabled}>
          {getText("save_to_"+saveType)}
        </Button>
      {/* </GridaToolTip> */}
      <Dialog className={classes.dialog} open={open} aria-labelledby="form-dialog-title" onKeyPress={onKeyPress}>
        <DialogTitle id="form-dialog-title" className={classes.title}>
          <Box fontSize={20} fontWeight="fontWeightBold" className={classes.titleBox}>
          {getText("save_"+saveType+"_popup_title")}
          </Box>
        </DialogTitle>
        <PdfDialogTextArea saveType={saveType} onTextAreaChange={(name) => setName(name)}/>
        <div className={classes.warn}>
          {warnText[0]}<span>{getText("filename_allow")}</span>{warnText[1]}
        </div>
        <DialogActions className={classes.dialogAction}>
          <div>
            {warn1Open? <span>{getText("filename_cantStart")}</span> : ""}
            {warn2Open? <span>{getText("filename_limitLength")}</span> : ""}
          </div>
          <Button onClick={handleSavePdf} variant="contained" color="primary" className={`${classes.button}`}>
            {getText("save_"+saveType+"_popup_save")}
          </Button>
          <Button onClick={handleDialogClose} variant="contained" className={classes.button}>
            {getText("save_"+saveType+"_popup_cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SavePdfDialog;