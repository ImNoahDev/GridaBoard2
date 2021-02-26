import { 
  Box, Button, Dialog, DialogActions,
  DialogTitle, IconButton, makeStyles 
} from '@material-ui/core';
import React from 'react';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import { savePDF } from "./SavePdf";
import PdfDialogTextArea from './PdfDialogTextArea';
import { turnOnGlobalKeyShortCut } from '../../GridaBoard/GlobalFunctions';
import GridaToolTip from '../../styles/GridaToolTip';

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

const SavePdfDialog = () => {

  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const showForm = React.useState(false)

  let pdfSaveName = '';

  const savePdfName = (pdfName: string) => {
    pdfSaveName = pdfName;
  }

  const onReset = () => {
    pdfSaveName = '';
    turnOnGlobalKeyShortCut(true);
  };

  const handlePdfDialogOpen = () => {
    setOpen(true);
    turnOnGlobalKeyShortCut(false);
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
      <GridaToolTip open={true} placement="top-end" tip={{
        head: "PDF File Save",
        msg: "PDF 파일을 로컬에 저장하는 버튼입니다.",
        tail: "키보드 버튼 ?로 선택 가능합니다"
      }} title={undefined}>
        <IconButton className={classes.iconContainer} onClick={handlePdfDialogOpen} style={{width: 36, height: 36}}>
          {!showForm
            ? <PictureAsPdfIcon className={classes.icon}/>
            : <PictureAsPdfIcon className={classes.icon}/>
          }
        </IconButton>
      </GridaToolTip>
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