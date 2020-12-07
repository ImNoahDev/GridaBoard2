import React, { useState } from "react";
import { Button } from "@material-ui/core";
import CalibrationDialog from "./CalibrationDialog";

type Props = {
  children?: any,
};

export default function CalibrationButton(props: Props) {
  const [open, setOpen] = useState(false);
  const [pageNo, setPageNo] = useState(1);

  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleClose = (e: {}, reason: "backdropClick" | "escapeKeyDown") => {
    setOpen(false);
    console.log(e, reason);
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