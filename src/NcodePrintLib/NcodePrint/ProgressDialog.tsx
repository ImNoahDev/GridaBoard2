import React, { useCallback, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});
type Props = {
  /** 0 ~ 100 */
  progress: number,

  open: boolean,

  title: string,

  cancelCallback: (e) => void,
}


export function useForceUpdate() {
  const [, setTick] = useState(0);
  const update = useCallback(() => {
    setTick(tick => tick + 1);
  }, [])
  return update;
}


export default function ProgressDialog(props: Props) {
  const classes = useStyles();
  const [progress, setProgress] = useState(props.progress);
  const [open, setOpen] = useState(props.open);

  const handleClose = (e) => {
    setOpen(false);
    if (props.cancelCallback) {
      props.cancelCallback(e);
    }
  }
  const forceUpdate = useForceUpdate();


  useEffect(() => {
    setProgress(props.progress);
    forceUpdate();
    // forceUpdate();
  }, [props.progress]);

  const percent = Math.ceil(progress);
  const buffered = Math.ceil(progress / 10) * 10;

  useEffect(() => {
    console.log(`dlg progress >> ${progress}, percent=${percent}, buffered=${buffered}`)
  }, [progress]);

  return (
    <Dialog open={open} {...props} onClose={handleClose} >
      <DialogTitle id="form-dialog-title" style={{ float: "left", width: "500px" }}>
        <Box fontSize={20} fontWeight="fontWeightBold" >{props.title}</Box>
      </DialogTitle>

      <DialogContent>
        <div className={classes.root}>
          <LinearProgress variant="buffer" value={percent} valueBuffer={buffered} />
        </div>
        <div className={classes.root}>
          <Box fontSize={16} fontWeight="fontWeightRegular" >Processing... {percent}%</Box>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
          </Button>
      </DialogActions>
    </Dialog>
  );
}