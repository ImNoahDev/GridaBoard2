import {
  Box, Button, Dialog, DialogActions,
  DialogTitle, makeStyles
} from '@material-ui/core';
import React from 'react';
import { savePDF } from "./SavePdf";
import PdfDialogTextArea from './PdfDialogTextArea';
import { turnOnGlobalKeyShortCut } from '../GlobalFunctions';
import GridaToolTip from '../styles/GridaToolTip';
import $ from "jquery";
import { saveGrida } from "./SaveGrida";
import GridaDialogTextArea from './GridaDialogTextArea';

const useStyles = makeStyles({
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
  },
  iconContainer: {
    "&:hover $icon": {
        color: 'red',
    }
  },
  icon: {
      color: 'black',
  },
});

const SaveGridaDialog = () => {

  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  let gridaSaveName = '';

  const saveGridaName = (gridaName: string) => {
    gridaSaveName = gridaName+'.grida';
  }

  const onReset = () => {
    gridaSaveName = '';
    turnOnGlobalKeyShortCut(true);
  };

  const handleGridaDialogOpen = () => {
    setOpen(true);
    turnOnGlobalKeyShortCut(false);
  };

  const handleGridaDialogClose = () => {
    setOpen(false);
    onReset();
  };

  const handleSaveGrida = () => {
    saveGrida(gridaSaveName);
    setOpen(false);
    onReset();
  }

  $(document).ready(function(){
    $('.save_drop_down').hover(
      function(event){
        $(this).addClass('hover');
        $(this).css("color", "rgba(104,143,255,1)");
        $(this).css("background", "rgba(232,236,245,1)");
      },
      function(){
        $(this).removeClass('hover');
        $(this).css("color", "rgba(18,18,18,1)");
        $(this).css("background", "rgba(255,255,255,0.9)");
      }
    );
  });

  return (
    <div>
      {/* <GridaToolTip open={true} placement="top-end" tip={{
        head: "PDF File Save",
        msg: "PDF 파일을 로컬에 저장하는 버튼입니다.",
        tail: "키보드 버튼 ?로 선택 가능합니다"
      }} title={undefined}> */}
        {/* <Button className="save_drop_down" style={{
          width: "200px", height: "40px", padding: "4px 12px"
        }} onClick={handlePdfDialogOpen}>
          <span style={{marginLeft: "-54px"}}>데이터 저장(.grida)</span>
        </Button> */}
        <Button className="save_drop_down" style={{
          width: "200px", height: "40px", padding: "4px 12px",
        }} 
          // onClick={() => saveGrida('hello.grida')}
          onClick={handleGridaDialogOpen}
          // onClick={() => alert('미구현된 기능입니다.')}
        >
          <span style={{marginLeft: "-40px"}}>데이터 저장(.grida)</span>
        </Button>
      {/* </GridaToolTip> */}
      <Dialog open={open} onClose={handleGridaDialogClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className={classes.title}>
          <Box fontSize={20} fontWeight="fontWeightBold" className={classes.titleBox}>
            GRIDA 저장
          </Box>
        </DialogTitle>
        <GridaDialogTextArea onTextAreaChange={(gridaName) => saveGridaName(gridaName)}/>
        <DialogActions>
          <Button onClick={handleSaveGrida} variant="contained" color="primary" className={classes.button}>
            저장
          </Button>
          <Button onClick={handleGridaDialogClose} variant="contained" className={classes.button}>
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SaveGridaDialog;