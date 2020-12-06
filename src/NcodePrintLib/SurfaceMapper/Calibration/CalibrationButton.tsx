import React, { useState } from "react";
// import { Container, Modal, Row, Col, Button } from "react-bootstrap";

import { makeStyles } from '@material-ui/core/styles';
import { Button, Box } from "@material-ui/core";
import CalibrationDialog from "./CalibrationDialog";

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 'fit-content',
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
  formControlLabel: {
    marginTop: theme.spacing(1),
  },
}));

export default function CalibrationButton(props) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [pageNo, setPageNo] = useState(1);

  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleClose = (e: {}, reason: "backdropClick" | "escapeKeyDown") => {
    setOpen(false);
  }

  return (
    <div>
      <Button {...props} onClick={handleClickOpen}>
        {props.children}
      </Button>

      <CalibrationDialog open={open} handleClose={handleClose} pageNo={pageNo} />
    </div>
  );
}