import { DialogContent, makeStyles, TextField } from '@material-ui/core';
import React, { useState } from 'react';

type Props = {
  onTextAreaChange: (gridaName) => void;
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

const GridaDialogTextArea = (props: Props) => {

  const classes = useStyles();

  const [gridaName, setGridaName] = useState('');

  const onChange = (e) => {
    const gridaName = e.target.value;

    setGridaName(gridaName);
    props.onTextAreaChange(gridaName);
  };


  return (
    <DialogContent>
      <TextField
        autoFocus
        margin="dense"
        placeholder="저장할 파일의 이름을 입력하세요"
        type="text"
        name="title"
        value={gridaName}
        onChange={onChange}
        className={classes.textArea}
        label="제목"
        variant="outlined"
      />
    </DialogContent>
  );
}

export default GridaDialogTextArea;