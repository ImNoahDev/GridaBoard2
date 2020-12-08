import React, {useState} from "react";
// import { Container, Modal, Row, Col, Button } from "react-bootstrap";

import { makeStyles } from '@material-ui/core/styles';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import TextField from '@material-ui/core/TextField';

import { Button, Box, Input } from "@material-ui/core";

import { IPrintingReport, IPrintOption, MediaSize, PageInfo } from '../PrintDataTypes';

import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import $ from 'jquery';

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
export default function PrintOptionDialog () {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [IPrintOption, setIPrintOption] = useState({
    codeDensity: 2,
    printDpi: 600,
    pdfRenderingDpi: 300,
    putCalibrationMark: true,
    printNcode: true,
    dotsInACell: 7,
    mediaSize: MediaSize.A4,
    direction: "auto",
    colorMode: 1,
    scaleUpToMedia: true,
    scaleDownToMedia: true,
    targetPages: "",
    pagesPerSheet: 1,
    pageInfo: PageInfo.first_page,
    debugMode: 0,
    hasToPutNcode: true
  })

  const handleClickOpen = () => {
    setOpen(true);
  }

  const handleClose = (e) => {
    setIPrintOption({
      ...IPrintOption,
      codeDensity: 2,
      printDpi: 600,
      pdfRenderingDpi: 300,
      putCalibrationMark: true,
      printNcode: true,
      dotsInACell: 7,
      mediaSize: MediaSize.A4,
      direction: "auto",
      colorMode: 1,
      scaleUpToMedia: true,
      scaleDownToMedia: true,
      targetPages: "",
      pagesPerSheet: 1,
      pageInfo: PageInfo.first_page,
      debugMode: 0,
      hasToPutNcode: true
    })
    setOpen(false);
  }

  const handleSave = (e) => {
    //저장 로직 추가
    setIPrintOption({
      ...IPrintOption,
      targetPages : $('#targetPages').val(),
      [e.target.name] : e.target.value
    });

    setOpen(false);
  }

  const onChange = (e) => {
    setIPrintOption({
      ...IPrintOption,
      [e.target.name] : e.target.value
    });

    console.log(e.target.value);
    // console.log(MediaSize);
    // console.log(MediaSize.A4);
  }

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        <Box fontSize={16} fontWeight="fontWeightBold" >
          인쇄 옵션 설정
        </Box>
      </Button>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">인쇄 설정</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Dialog의 Body
          </DialogContentText>

          {/* 코드의 농도 Dialog */}
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="codeDensity">코드 농도</InputLabel>
              <Select
                autoFocus
                value={IPrintOption.codeDensity}
                onChange={onChange}
                inputProps={{
                  name: 'codeDensity',
                  id: 'codeDensity',
                }}
              >
                <MenuItem value="1">연하게</MenuItem>
                <MenuItem value="2">보통</MenuItem>
                <MenuItem value="3">진하게</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* 인쇄의 품질 Dialog */}
          <form className={classes.form} noValidate style={{float:"left"}}>
            <FormControl className={classes.formControl}>
                <InputLabel htmlFor="printDpi">인쇄 품질</InputLabel>
                <Select
                  value={IPrintOption.printDpi}
                  onChange={onChange}
                  inputProps={{
                    name: 'printDpi',
                    id: 'printDpi',
                  }}
                >
                  <MenuItem value="600">품질 우선</MenuItem>
                  <MenuItem value="300">보통 품질</MenuItem>
                </Select>
            </FormControl>
          </form>

          {/* PDF의 Rendering DPI Dialog */}
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="pdfRenderingDpi">PDFRendering</InputLabel>
              <Select
                value={IPrintOption.pdfRenderingDpi}
                onChange={onChange}
                inputProps={{
                  name: 'pdfRenderingDpi',
                  id: 'pdfRenderingDpi'
                }}
              >
                <MenuItem value="150">150DPI</MenuItem>
                <MenuItem value="200">200DPI</MenuItem>
                <MenuItem value="300">300DPI</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* Calibration 유무 체크 Dialog */}
          <form className={classes.form} noValidate style={{clear:"both", float:"left"}}>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="putCalibrationMark">CalibrationMark</InputLabel>
              <Select
                value={IPrintOption.putCalibrationMark}
                onChange={onChange}
                inputProps={{
                  name: 'putCalibrationMark',
                  if: 'putCalibrationMark',
                }}
              >
                <MenuItem value="true">true</MenuItem>
                <MenuItem value="false">false</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* Print시 Ncode 유무 Dialog */}
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="printNcode">PrintNcode</InputLabel>
              <Select
                value={IPrintOption.printNcode}
                onChange={onChange}
                inputProps={{
                  name: 'printNcode',
                  id: 'printNcode'
                }}
              >
                <MenuItem value="true">true</MenuItem>
                <MenuItem value="false">false</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* DotsInACell의 Dialog - 보이지는 않는다 */}
          <form className={classes.form} noValidate style={{display:"none"}}>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="dotsInACell" disabled>DotsInACell</InputLabel>
                <Input value="7" id="dotsInACell" name="dotsInACell" />
            </FormControl>
          </form>

          {/* MediaSize의 Dialog */}
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="mediaSize">MediaSize</InputLabel>
              <Select
                value={IPrintOption.mediaSize}
                onChange={onChange}
                inputProps={{
                  name: 'mediaSize',
                  id: 'mediaSize'
                }}
              >
                <MenuItem value={"A4"}>A4</MenuItem>
                <MenuItem value={"A3"}>A3</MenuItem>
                <MenuItem value={"B4"}>B4</MenuItem>
                <MenuItem value={"B5"}>B5</MenuItem>
                <MenuItem value={"Letter"}>Letter</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* ColorMode에 대한 Dialog */}
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="colorMode">ColorMode</InputLabel>
              <Select
                value={IPrintOption.colorMode}
                onChange={onChange}
                inputProps={{
                  name: 'colorMode',
                  id: 'colorMode'
                }}
              >
                <MenuItem value="0">BLUEPRINT</MenuItem>
                <MenuItem value="1">ANDROID_STYLE</MenuItem>
                <MenuItem value="2">IPHONE_STYLE</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* Direction에 대한 Dialog */}
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="direction">Direction</InputLabel>
              <Select
                value={IPrintOption.direction}
                onChange={onChange}
                inputProps={{
                  name: 'direction',
                  id: 'direction'
                }}
              >
                <MenuItem value="auto">auto</MenuItem>
                <MenuItem value="protrait">protrait</MenuItem>
                <MenuItem value="landscape">landscape</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* ScaleUp에 대한 Dialog */}
          <form className={classes.form} noValidate style={{clear:"both", float:"left"}}>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="scaleUpToMedia">ScaleUpToMedia</InputLabel>
              <Select
                value={IPrintOption.scaleUpToMedia}
                onChange={onChange}
                inputProps={{
                  name: 'scaleUpToMedia',
                  id: 'scaleUpToMedia'
                }}
              >
                <MenuItem value="true">true</MenuItem>
                <MenuItem value="false">false</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* ScaleDown에 대한 Dialog */}
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="scaleDownToMedia">ScaleDownToMedia</InputLabel>
              <Select
                value={IPrintOption.scaleDownToMedia}
                onChange={onChange}
                inputProps={{
                  name: 'scaleDownToMedia',
                  id: 'scaleDownToMedia'
                }}
              >
                <MenuItem value="true">true</MenuItem>
                <MenuItem value="false">false</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* TargetPage에 대한 Dialog */}
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              {/* <TextField id="targetPages" margin="dense" label="TargetPages" type="text" /> */}
              {/* <InputLabel htmlFor="targetPages">TargetPages</InputLabel> */}
              <TextField id="targetPages" name="targetPages" margin="dense" label="TargetPages"
                     type="text" onSubmit={(e) => handleSave}/>
            </FormControl>
          </form>

          {/* PagePerSheet에 대한 Dialog */}
          <form className={classes.form} noValidate style={{float:"left"}}>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="pagesPerSheet">PagesPerSheet</InputLabel>
              <Select
                value={IPrintOption.pagesPerSheet}
                onChange={onChange}
                inputProps={{
                  name: 'pagesPerSheet',
                  id: 'pagesPerSheet'
                }}
              >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="4">4</MenuItem>
                <MenuItem value="8">8</MenuItem>
                <MenuItem value="9">9</MenuItem>
                <MenuItem value="16">16</MenuItem>
                <MenuItem value="18">18</MenuItem>
                <MenuItem value="25">25</MenuItem>
                <MenuItem value="32">32</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* PageInfo에 대한 Dialog */}
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="pageInfo">PageInfo</InputLabel>
              <Select
                value={IPrintOption.pageInfo}
                onChange={onChange}
                inputProps={{
                  name: 'pageInfo',
                  id: 'pageInfo'
                }}
              >
                <MenuItem value={1}>3, 27, 1068, 1</MenuItem>
                <MenuItem value={2}>3, 27, 1069, 1</MenuItem>
                <MenuItem value={3}>3, 27, 1070, 1</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* DebugMode에 대한 Dialog */}
          <form className={classes.form} noValidate style={{float:"left"}}>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="debugMode">DebugMode</InputLabel>
              <Select
                value={IPrintOption.debugMode}
                onChange={onChange}
                inputProps={{
                  name: 'debugMode',
                  id: 'debugMode'
                }}
              >
                <MenuItem value="0">0</MenuItem>
                <MenuItem value="1">1</MenuItem>
              </Select>
            </FormControl>
          </form>

          {/* HasToPutNcode에 대한 Dialog */}
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="debugMode">HasToPutNcode</InputLabel>
              <Select
                value={IPrintOption.hasToPutNcode}
                onChange={onChange}
                inputProps={{
                  name: 'hasToPutNcode',
                  id: 'hasToPutNcode'
                }}
              >
                <MenuItem value="true">true</MenuItem>
                <MenuItem value="false">false</MenuItem>

              </Select>
            </FormControl>
          </form>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}