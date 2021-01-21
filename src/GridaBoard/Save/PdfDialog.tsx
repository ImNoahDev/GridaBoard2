import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle, Input, InputBase, makeStyles, TextField } from '@material-ui/core';
import React, { Component, useEffect, useRef, useState } from 'react';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import { savePDF } from "../Save/SavePdf";
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import GridaDoc from '../GridaDoc';
import { title } from 'process';
import { setGraphicsState } from 'pdf-lib';

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
  context: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    // border: "1px solid black",
    margin: "auto",
    width: "400px",
    marginBottom: "25px"
  },
  button: {
    border: "1px solid black",
    margin: "auto"
  },
  input: {
    outline: "none",
    width: "100%",
    textAlign: "center",
    height: "30px"
  }
});

export function PdfDialog() {

  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const [pdfUrl, setPdfUrl] = useState(undefined as string);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClosePdf = () => {
    savePDF(pdfUrl, name)
    setOpen(false);
    onReset();
  }

  const [inputs, setInputs] = useState({
    name: '',
  })

  const { name } = inputs;

  const onChange = (e) => {
    const { name, value } = e.target;

    const nextInputs = {
      ...inputs,
      [name]: value,
    }
    setInputs(nextInputs)
  }
  
  const onReset = () => {
    const resetInputs = {
      name: "",
    }

    setInputs(resetInputs);
  }

  return (
    <div>
      <PictureAsPdfIcon onClick={handleClickOpen}/>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <div>
          <DialogTitle id="form-dialog-title" className={classes.title}>
            <Box fontSize={20} fontWeight="fontWeightBold" className={classes.titleBox}>
              PDF 저장
            </Box>
          </DialogTitle>
          <DialogContent className={classes.context}>
            <TextField
              // autoFocus
              margin="dense"
              placeholder="저장할 파일의 이름을 입력하세요"
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              className={classes.input}
              label="제목"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePdf} variant="contained" color="primary" className={classes.button}>
              저장
            </Button>
            <Button onClick={handleClose} variant="contained" className={classes.button}>
              취소
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );

}

export default PdfDialog;