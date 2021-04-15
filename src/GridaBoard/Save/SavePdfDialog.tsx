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



const useStyles = makeStyles((theme) => {
  console.log(theme);
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
    button: {
      border: "1px solid black",
      margin: "auto"
    }
  });
});

const SavePdfDialog = (props) => {
  const {saveType, ...rest} = props;


  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

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
    if(saveType == "grida"){
      saveGrida(selectedName);
    }else{
      savePDF(selectedName);
    }
    setOpen(false);
    onReset();
  }

  return (
    <div>
      {/* <GridaToolTip open={true} placement="top-end" tip={{
        head: "PDF File Save",
        msg: "PDF 파일을 로컬에 저장하는 버튼입니다.",
        tail: "키보드 버튼 ?로 선택 가능합니다"
      }} title={undefined}> */}
        <Button className={`${classes.dropdownBtn}`} onClick={handleDialogOpen}>
          {getText("save_to_"+saveType)}
        </Button>
      {/* </GridaToolTip> */}
      <Dialog open={open} onClose={handleDialogClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className={classes.title}>
          <Box fontSize={20} fontWeight="fontWeightBold" className={classes.titleBox}>
          {getText("save_"+saveType+"_popup_title")}
          </Box>
        </DialogTitle>
        <PdfDialogTextArea saveType={saveType} onTextAreaChange={(name) => setName(name)}/>
        <DialogActions>
          <Button onClick={handleSavePdf} variant="contained" color="primary" className={classes.button}>
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