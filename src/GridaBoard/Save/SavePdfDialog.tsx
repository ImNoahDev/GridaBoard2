import {
  Box, Button, Dialog, DialogActions,
  DialogTitle, makeStyles
} from '@material-ui/core';
import React from 'react';
import { savePDF } from "./SavePdf";
import { saveGrida } from "./SaveGrida";
import PdfDialogTextArea from './PdfDialogTextArea';
import { turnOnGlobalKeyShortCut } from '../GlobalFunctions';
import GridaToolTip from '../styles/GridaToolTip';
import $ from "jquery";
import getText from "../language/language";
import { saveThumbnail } from './SaveThumbnail';



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
      "& > span" : {
        color: "red",
        position: "absolute",
        left: "0",
        paddingLeft: "26px",
        fontSize: "11px",
        top: "13px",
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
  saveType : "grida" | "pdf" | "thumb"
}
const SavePdfDialog = (props: Props) => {
  const {saveType } = props;


  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const [warnOpen, setWarnOpen] =  React.useState(false);

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

  const handleDialogOpen = () => {
    setOpen(true);
    turnOnGlobalKeyShortCut(false);
  };

  const handleDialogClose = () => {
    setOpen(false);
    onReset();
  };

  const handleSavePdf = () => {
    //공백과 .으로는 시작 할 수 없음
    if(selectedName == ""){
      return ;
    }
    if(selectedName.search(/^[. ]/g) !== -1){
      //첫글자가 공백 혹은 .임
      setWarnOpen(true);
      return ;
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
      return ;
    }

    if(saveType == "grida"){
      saveGrida(selectedName);
    }else if (saveType === "pdf") {
      savePDF(selectedName);
    } else if (saveType === "thumb") {
      saveThumbnail(selectedName);
    }
    setOpen(false);
    onReset();
  }
  const warnText = getText("filename_onlyallowed").split("%[allow]");

  return (
    <div>
      {/* <GridaToolTip open={true} placement="top-end" tip={{
        head: "PDF File Save",
        msg: "PDF 파일을 로컬에 저장하는 버튼입니다.",
        tail: "키보드 버튼 ?로 선택 가능합니다"
      }} title={undefined}> */}
        <Button className={`${classes.dropdownBtn} ${saveType==="pdf"? "save_drop_down": ""}`} onClick={handleDialogOpen}>
          {saveType !== "thumb" ? getText("save_to_"+saveType) : "썸네이이일"}
        </Button>
      {/* </GridaToolTip> */}
      <Dialog className={classes.dialog} open={open} onClose={handleDialogClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className={classes.title}>
          <Box fontSize={20} fontWeight="fontWeightBold" className={classes.titleBox}>
          {saveType !== "thumb" ? getText("save_"+saveType+"_popup_title") : "썸네일 업로드"}
          </Box>
        </DialogTitle>
        <PdfDialogTextArea saveType={saveType} onTextAreaChange={(name) => setName(name)}/>
        <div className={classes.warn}>
          {warnText[0]}<span>{getText("filename_allow")}</span>{warnText[1]}
        </div>
        <DialogActions className={classes.dialogAction}>
          {warnOpen? <span>{getText("filename_cantStart")}</span> : ""}
          <Button onClick={handleSavePdf} variant="contained" color="primary" className={`${classes.button}`}>
            {saveType !== "thumb" ? getText("save_"+saveType+"_popup_save") : "업로드"}
          </Button>
          <Button onClick={handleDialogClose} variant="contained" className={classes.button}>
            {saveType !== "thumb" ? getText("save_"+saveType+"_popup_cancel") : "취소"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SavePdfDialog;