import React, { useEffect, useState } from 'react';
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

export default function ProgressDialog(props: Props) {
  const classes = useStyles();
  const { progress } = props;
  const [open, setOpen] = useState(props.open);
  const progressRef = React.useRef(() => { });

  const handleClose = (e) => {
    setOpen(false);
    if (props.cancelCallback) {
      props.cancelCallback(e);
    }
  }

  // useEffect(() => {
  //   progressRef.current = () => {
  //     if (progress > 100) {
  //       setProgress(0);
  //       setBuffer(10);
  //     } else {
  //       const diff = Math.random() * 10;
  //       const diff2 = Math.random() * 10;
  //       setProgress(progress + diff);
  //       setBuffer(progress + diff + diff2);
  //     }
  //   };
  // });

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     progressRef.current();
  //   }, 500);

  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, []);
  const percent = Math.ceil(progress);
  const buffered = Math.ceil(progress / 10) * 10;

  return (
    <Dialog open={props.open} {...props} onClose={handleClose} >
      <DialogTitle id="form-dialog-title" style={{ float: "left", width: "500px" }}>
        <Box fontSize={20} fontWeight="fontWeightBold" >{props.title}</Box>
      </DialogTitle>

      <DialogContent>
        <div className={classes.root}>
          <Box fontSize={16} fontWeight="fontWeightRegular" >Processing... {percent}%</Box>
        </div>
        <div className={classes.root}>
          <LinearProgress variant="buffer" value={percent} valueBuffer={buffered} />
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