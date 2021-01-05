import React, { useState } from "react";
import { Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, } from "@material-ui/core";

import { MappingStorage } from "..";

import { makeNPageIdStr } from "../../util";
import { g_defaultNcode } from "../../constants";


export default function ClearLocalMappingButton(props: ButtonProps) {
  const [open, setOpen] = useState(false);

  const clear = () => {
    const msi = MappingStorage.getInstance();
    msi.clear();
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  };

  const pageInfoStr = makeNPageIdStr(g_defaultNcode);

  return (
    <div>
      <Button {...props} onClick={clear}>
        {props.children}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="PDF 매핑 정보 삭제 완료"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          PDF 매핑 정보 삭제 완료
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            PDF와 Ncode를 연결하는 로컬(LocalStorage)의 등록 정보가 모두 삭제되었습니다.
            지금부터 인쇄되는 PDF는 기본 매핑정보 <b>{pageInfoStr}</b> 부터 다시 등록됩니다.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="outlined" color="primary">
            확인
          </Button>
        </DialogActions>

      </Dialog>
    </div>
  );
}



