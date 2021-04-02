import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import getText from "../../../GridaBoard/language/language";

type Props = {
  open: boolean,
  onClose?,

}


const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

function SimpleDialog(props: Props) {
  const classes = useStyles();
  const { onClose, open } = props;

  const handleClose = () => {
    onClose();
  };

  if (open) {
    setTimeout(() => {
      onClose();
    }, 1000);
  }

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">{getText("print_cancel_ready_ok_warn1")}<br />{getText("print_cancel_ready_ok_warn2")}</DialogTitle>
    </Dialog>
  );
}


const msgs = [
  getText("print_ready_to_cancel"),
  getText("print_cancel_ready_expalin"),
  getText("print_sorry_but_more")];



export default function CancelWaitingDialog(props: Props) {
  const classes = useStyles();
  const [okDlg, setOK] = useState(false);
  const [msgId, setMsgId] = useState(0);
  const [intervalID, setIntervalID] = useState(undefined);

  const handleClose = () => {
    setOK(true);
  }

  const reactionClosed = () => {
    setOK(false);
  }

  useEffect(() => {
    if (props.open) {
      if (intervalID === undefined) {
        const interval = setTimeout(() => {
          setMsgId((msgId + 1) % msgs.length);
          console.log("RRR: interval");
        }, 10);

        setIntervalID(interval);
      }
    }
    else {
      console.log('RRR: closed');

    }
  }, [props.open]);

  useEffect(() => {
    setMsgId(0);
    return () => {
      console.log('RRR: EXIT');
      setMsgId(0);
    }
  }, []);



  return (
    <React.Fragment>
      <Dialog open={props.open}>
        <DialogTitle id="form-dialog-title" style={{ float: "left", width: "500px" }}>
          <Box fontSize={20} fontWeight="fontWeightBold" >
            {getText("print_cancel_ready")}
            </Box>
        </DialogTitle>

        <DialogContent>
          <div className={classes.root}>
            <Box fontSize={16} fontWeight="fontWeightRegular" >
              {msgs[msgId]}
            </Box>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            {getText("print_cancel_ready_ok")}
          </Button>
        </DialogActions>
      </Dialog>

      <SimpleDialog open={okDlg} onClose={reactionClosed} />
    </React.Fragment>
  );
}