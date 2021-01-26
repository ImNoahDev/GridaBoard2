import { 
  Box, Button, Dialog, DialogActions,
  DialogTitle, makeStyles 
} from '@material-ui/core';
import React from 'react';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import { savePDF } from "./SavePdf";
import PdfDialogTextArea from './PdfDialogTextArea';

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
  }
});

const SavePdfDialog = () => {

  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  let pdfSaveName = '';

  const savePdfName = (pdfName: string) => {
    pdfSaveName = pdfName;
  }

  const onReset = () => {
    pdfSaveName = '';
  };

  const handlePdfDialogOpen = () => {
    setOpen(true);
  };

  const handlePdfDialogClose = () => {
    setOpen(false);
    onReset();
  };

  const handleSavePdf = () => {
    savePDF(pdfSaveName);
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
        <PdfDialogTextArea onTextAreaChange={(pdfName) => savePdfName(pdfName)}/>
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