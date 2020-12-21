import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';


type Props = {
  open: boolean,
}


const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

function SimpleDialog(props) {
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
      <DialogTitle id="simple-dialog-title">프로그램이 실행 중입니다.<br />멈춘 줄 알고 걱정이었습니다.조금만 더 기다려 주세요.</DialogTitle>
    </Dialog>
  );
}


const msgs = [
  "인쇄 준비 작업이 취소되기를 기다리고 있습니다",
  "처리할 페이지 수가 많아 기다리는 시간이 더 걸리고 있습니다, 잠시만 기다려 주세요",
  "너무 오래 기다리게 했습니다만, 조금만 더 기다려 주세요"];



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
            취소 대기 중
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
            알겠습니다
          </Button>
        </DialogActions>
      </Dialog>

      <SimpleDialog open={okDlg} onClose={reactionClosed} />
    </React.Fragment>
  );
}