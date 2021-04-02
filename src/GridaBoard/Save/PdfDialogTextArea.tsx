import { DialogContent, makeStyles, TextField } from '@material-ui/core';
import React, { useState } from 'react';
import getText from "../language/language";


type Props = {
  onTextAreaChange: (pdfName) => void;
}

const useStyles = makeStyles({
  textArea: {
    outline: "none",
    width: "100%",
    textAlign: "center",
    height: "30px",
    marginBottom: "20px",
  }
});

const PdfDialogTextArea = (props: Props) => {

  const classes = useStyles();

  const [pdfName, setPdfName] = useState('');

  const onChange = (e) => {
    const pdfName = e.target.value;

    setPdfName(pdfName);
    props.onTextAreaChange(pdfName);
  };


  return (
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        placeholder={getText("save_pdf_popup_holder")}
        type="text"
        name="title"
        value={pdfName}
        onChange={onChange}
        className={classes.textArea}
        label={getText("save_pdf_popup_name")}
        variant="outlined"
      />
    </DialogContent>
  );
}

export default PdfDialogTextArea;