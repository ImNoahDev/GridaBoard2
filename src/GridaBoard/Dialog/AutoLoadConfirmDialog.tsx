import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, DialogProps, makeStyles, createStyles } from "@material-ui/core";
import { Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex"
    },

    hide: {
      display: 'none',
    },
  }),
);

interface Props extends DialogProps {
  /** 0 or 1 */
  step: number,

  onOk: () => void,
  onCancel: () => void,

  onNoMore: () => void,

}


const AutoLoadConfirmDialog = (props: Props) => {
  const { step, onOk, onCancel, open, ...rest } = props;
  const classes = useStyles();

  const level0_open = props.step === 0 && props.open;
  const level1_open = props.step === 1 && props.open;

  const handleClose = () => {
    console.log("do nothing!");
  }

  return (
    <div className={classes.root}>
      {/* 문서 감지 자동 로드를 위한 것 */}
      <Dialog open={level0_open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
        <DialogTitle id="alert-dialog-title">
          파일 불러오기
          </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            이전에 인쇄되었던 파일입니다. 파일을 로드하면 인쇄된 배경이 화면에도 그대로 나타납니다.
            파일을 로드하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onNoMore} color="primary" >
            다시 이 페이지에서 묻지 않기
          </Button>
          <Button onClick={props.onCancel} color="primary" >
            아니오, 빈화면에 쓰겠습니다.
          </Button>
          <Button onClick={props.onOk} color="primary" autoFocus>
            예, 선택합니다.
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={level1_open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
        <DialogTitle id="alert-dialog-title">
          파일 불러오기를 취소
          </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            선택한 파일을 이전에 인쇄했던 파일과 다른 파일입니다. 다시 한번 파일을 선택하고 로드하겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onNoMore} color="primary" >
            다시 이 페이지에서 묻지 않기
          </Button>
          <Button onClick={props.onCancel} color="primary" >
            아니오, 빈화면에 쓰겠습니다.
          </Button>
          <Button onClick={props.onOk} color="primary" autoFocus>
            예, 다시 한번 선택합니다.
          </Button>
        </DialogActions>
      </Dialog>
    </div >
  );
};


export default AutoLoadConfirmDialog;
