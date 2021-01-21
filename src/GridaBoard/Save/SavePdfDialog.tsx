import { 
  Box, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, makeStyles, TextField 
} from '@material-ui/core';
import React, { useState } from 'react';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import { savePDF } from "./SavePdf";

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
  content: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    margin: "auto",
    width: "400px",
    marginBottom: "25px"
  },
  button: {
    border: "1px solid black",
    margin: "auto"
  },
  textArea: {
    outline: "none",
    width: "100%",
    textAlign: "center",
    height: "30px"
  }
});

const SavePdfDialog = () => {

  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const [pdfName, setPdfName] = useState('');

  const onChange = (e) => {
    let { pdfName, value } = e.target;
    pdfName = value;

    setPdfName(pdfName);
  };

  const onReset = () => {
    setPdfName('');
  };

  const handlePdfDialogOpen = () => {
    setOpen(true);
  };

  const handlePdfDialogClose = () => {
    setOpen(false);
    onReset();
  };

  const handleSavePdf = () => {
    savePDF(pdfName);
    setOpen(false);
    onReset();
  }

  return (
    <div>
      <PictureAsPdfIcon onClick={handlePdfDialogOpen}/>
      <Dialog open={open} onClose={handlePdfDialogClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" className={classes.title}>
          <Box fontSize={20} fontWeight="fontWeightBold" className={classes.titleBox}>
            PDF 저장
          </Box>
        </DialogTitle>
        <DialogContent className={classes.content}>
          <TextField
            margin="dense"
            placeholder="저장할 파일의 이름을 입력하세요"
            type="text"
            name="title"
            value={pdfName}
            onChange={onChange}
            className={classes.textArea}
            label="제목"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSavePdf} variant="contained" color="primary" className={classes.button}>
            저장
          </Button>
          <Button onClick={handlePdfDialogClose} variant="contained" className={classes.button}>
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SavePdfDialog;