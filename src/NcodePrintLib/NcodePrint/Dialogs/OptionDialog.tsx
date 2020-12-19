import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Grid, useTheme } from '@material-ui/core';
import { IPrintOption } from '../..';
import OptionLevel_debug from "./OptionLevel_debug";
import OptionLevel_1 from "./OptionLevel_1";
import OptionLevel_2 from "./OptionLevel_2";

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  scrollPaper: {
    alignItems: 'baseline'  // default center
  }
});





interface IDialogProps extends DialogProps {

  printOption: IPrintOption,
  cancelCallback: (e) => void,
  okCallback: (e) => void,
}


function OptionDialog(props: IDialogProps) {
  const { printOption, cancelCallback, okCallback, ...rest } = props;
  // const [open, setOpen] = useState(props.open);
  const classes = useStyles();
  const theme = useTheme();
  const dialogRef = useRef(null);
  const [optionLevel, setOptionLevel] = useState(0);

  const handleClose = (e) => {
    if (props.cancelCallback) {
      props.cancelCallback(e);
    }
    console.log("testing: closing");
  }

  const handleOK = (e) => {
    console.log("testing: closing");
    // setOpen(false);

    if (props.okCallback) {
      props.okCallback(e);
    }
  }

  const handleCancel = (e) => {
    console.log("testing: closing");
    // setOpen(false);
    if (props.cancelCallback) {
      props.cancelCallback(e);
    }
  }

  const onLevelChanged = (level: number) => {
    setOptionLevel(level);
    console.log(`default: level=${optionLevel}`);
  }

  const handleLevel = (e) => {
    let level = optionLevel + 1;
    level %= 3;
    setOptionLevel(level);
  }


  console.log(`default: level=${optionLevel}`);
  const msg = ["상세 설정", "전문가 설정", "기본 설정"][optionLevel];

  return (
    <React.Fragment>
      {
        console.log(open)
      }
      <Dialog open={open} {...rest} onClose={handleClose}
        classes={{ scrollPaper: classes.scrollPaper }}
      >

        <DialogTitle id="form-dialog-title" style={{ float: "left", width: "500px" }}>
          <Box fontSize={20} fontWeight="fontWeightBold" >
            인쇄 옵션
        </Box>
        </DialogTitle>

        <DialogContent ref={dialogRef}>
          <Box component="div" className={classes.root}>
            <Box fontSize={16} fontWeight="fontWeightRegular" >Processing... </Box>
          </Box>

          <Box component="div" className={classes.root} style={{ display: "flex", justifyContent: "center" }}>
            <Box borderColor={theme.palette.primary.main} border={1}>
            </Box>
          </Box>

          {optionLevel > 0 ? <OptionLevel_1 {...props} levelCallback={onLevelChanged} optionLevel={optionLevel} /> : ""}
          {optionLevel > 1 ? <OptionLevel_2 {...props} levelCallback={onLevelChanged} optionLevel={optionLevel} /> : ""}
          {optionLevel > 2 ? <OptionLevel_debug {...props} levelCallback={onLevelChanged} optionLevel={optionLevel} /> : ""}

        </DialogContent>

        <DialogActions>

          <Grid item xs={12} sm={4}>
            <Button style={{
              backgroundColor: theme.palette.info.main,
              color: theme.palette.info.contrastText,
              boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.3)",
            }} onClick={handleLevel} color="primary">
              {msg}
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button onClick={handleOK} color="primary">
              OK
          </Button>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button onClick={handleCancel} color="primary">
              Cancel
          </Button>
          </Grid>


        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}








interface Props extends ButtonProps {
  printOption: IPrintOption,
}


export default function OptionDialogButton(props: Props) {
  const { printOption, ...rest } = props;
  const [show, setShow] = useState(false);

  const openDialog = () => {
    setShow(true);
  }

  const onCancel = () => {
    setShow(false);
    console.log("onCancel");
  }

  const onOK = () => {
    setShow(false);
    console.log("onOK");
  }

  return (
    <React.Fragment>
      <button {...rest} onClick={openDialog} >
        {props.children}
      </button>

      { show ? <OptionDialog open={show} cancelCallback={onCancel} okCallback={onOK} printOption={printOption} /> : ""}
    </React.Fragment>
  );
}
