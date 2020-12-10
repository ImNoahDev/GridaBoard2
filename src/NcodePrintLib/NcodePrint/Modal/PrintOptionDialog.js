import React, {useState} from "react";
// import { Container, Modal, Row, Col, Button } from "react-bootstrap";

import { makeStyles } from '@material-ui/core/styles';


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Checkbox from '@material-ui/core/Checkbox';
import { Radio } from '@material-ui/core';

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
// import { CheckBox } from "@material-ui/icons";
import CheckBox from '@material-ui/core/Checkbox';

// 2020-12-10 printDialog까지 완성 (인쇄하는 부분으로 값들 전달하는 것 완성시키기)

const displayOption = () => {
  var subOption = document.getElementById('subOption');
  if (subOption.style.display === 'none') {
    subOption.style.display = 'block';
  } else {
    subOption.style.display = 'none';
  }
}

var _ncodePrint = $("#ncodePaper").prop("defaultChecked");
var _bluePrint = $("#bluePrint").prop("defaultChecked");
var _calibrationMark = $("#calibrationMark").prop("defaultChecked");
var _oldCalibrationMark = $("#calibrationMark").prop("defaultChecked");
var _printNcode = $("#printNcode").prop("defaultChecked");
var _ni = null;
var _ni_new = null;
var arrCallback = [];

function on(select_target, message, _func, bindObj) {
  // if (typeof obj == "object") {
  //     console.log("!!");
  // }
  $(select_target).on(message, _func.bind(bindObj));

  // 나중에 dump할 것을 위해서 아래와 같이 배열에 추가
  var callbackItem = getCallbackItem("jQuery", select_target, message, _func, bindObj);
  arrCallback.push(callbackItem);
  // this.dumpAll();
}

function getCallbackItem(receiver, select_target, message, _func, obj) {
  var obj_name = "window";
  if (obj) {
      if (obj.name) {
          obj_name = obj.name;
      } else if (obj.constructor) {
          obj_name = obj.constructor.name;
      }
  }

  return {
      receiver: receiver,
      target: select_target,
      msg: message,
      callback: _func.name,
      class: obj_name,
      assignedAt: getFunctionName(),
  };
};

function getFunctionName() {
  // https://kjwsx23.tistory.com/285/
  let stack_msg = new Error().stack || "";
  var stack = stack_msg.split("\n").map(function (line) {
      return line.trim();
  });
  if (stack[0].indexOf("Error") > -1) {
      stack.splice(0, 1);
  }

  return stack[3];
}


window.onload = function() {
  on("#nomalPaper", "change", onNormalPaper, window);
  on("#ncodePaper", "change", onNcodePaper, window);
  on("#printNcode", "change", onChangePrintNcode, window);
  on("#dropDownQualityState", "change", onQualitySelectChanged, window);
}

function onNormalPaper() {
  $("#nomalPaper").removeAttr('defaultChecked');
  if ($("#nomalPaper").is(":checked") === true) {
    $("#nomalPaper").prop("checked", true);
  } else {
    $("#nomalPaper").prop("checked", false);
  }
  var isForSmartpen = $("#nomalPaper").prop("checked");
  console.log(isForSmartpen);
  onModeChange(isForSmartpen);
}

function onNcodePaper() {
  $("#nomalPaper").removeAttr('defaultChecked');
  if ($("#ncodePaper").is(":checked") === true) {
    $("#nomalPaper").prop("checked", false);
  } else {
    $("#nomalPaper").prop("checked", true);
  }
  var isForBlueprintOnly = $("#ncodePaper").prop("checked");
  console.log(isForBlueprintOnly);
  onModeChange(!isForBlueprintOnly);
}

function onQualitySelectChanged() {
  var value = $("#dropDownQualityState").val();
  var print_ncode = $("#printNcode").prop("checked");

  if (print_ncode) value = 4;
  setPrintQuality(value);
}

function onModeChange(isForSmartpen) {
  var code_txt2 = "";
  if (isForSmartpen) {
      // pop previous values
      $("#bluePrint").prop("defaultChecked", _bluePrint);
      $("#calibrationMark").prop("defaultChecked", _calibrationMark);
      $("#printNcode").prop("defaultChecked", true);

      // $("#code_density").val(_code_density);

      // ncode printing
      $("#nomalPaper").prop("checked", true);
      $("#ncodePaper").prop("checked", false);

      $("#printNcode").prop("disabled", true);
      $("#codeDensity").prop("disabled", false);
      $("#calibrationMark").prop("disabled", false);
      // $("#btn_blueprint").prop("disabled", false);

      /** code issue area */
      $("#forceNewCode").prop("disabled", false);
      // if (_ni) {
      //     $("#forceSameCode").prop("disabled", false);
      //     code_txt2 = `(${_ni.section}.${_ni.owner}.${_ni.book}.${_ni.page} ~ ${_ni.page + _ni.num_pages - 1})`;
      //     $("#reuseCodeRange").text(code_txt2);
      // } else $("#forceSameCode").prop("disabled", true);

      // var code_txt1 = `(${_ni_new.section}.${_ni_new.owner}.${_ni_new.book}.${_ni_new.page} ~ ${
      //     _ni_new.page + _ni_new.num_pages - 1
      // })`;
      // $("#newCodeRange").text(code_txt1);

      onChangePrintNcode();
  } else {
      // push previous values
      _bluePrint = $("#bluePrint").prop("defaultChecked");
      _oldCalibrationMark = $("#calibrationMark").prop("defaultChecked");
      _printNcode = $("#printNcode").prop("defaultChecked");

      // _code_density = parseInt($("#code_density").val());

      // Blueprint only
      $("#nomalPaper").prop("checked", false);
      $("#ncodePaper").prop("checked", true);

      $("#printNcode").prop("disabled", true);
      $("#printNcode").prop("checked", false);

      $("#calibrationMark").prop("disabled", true);
      $("#calibrationMark").prop("checked", true);

      $("#codeDensity").prop("disabled", true);
      // $("#btn_blueprint").prop("disabled", true);

      $("#forceNewCode").prop("disabled", true);
      $("#forceSameCode").prop("disabled", true);

      $("#newCodeRange").text("");
      $("#reuseCodeRange").text("");
  }
}

function onChangePrintNcode() {
  var print_ncode = $("#printNcode").prop("defaultChecked");

  if (print_ncode) {
      $("#calibrationMark").prop("defaultChecked", _oldCalibrationMark);
      $("#calibrationMark").prop("disabled", false);

      $("#codeDensity").prop("disabled", false);

      setPrintQuality(4);
  } else {
      _oldCalibrationMark = $("#calibrationMark").prop("defaultChecked");
      $("#calibrationMark").prop("defaultChecked", true);
      $("#calibrationMark").prop("disabled", true);
      $("#codeDensity").prop("disabled", true);
  }
}

function setPrintQuality(value) {
  var index = parseInt(value);
  $("#dropDownQualityState").val(index);
  var dpi = resolutionIndexToDpiNumber(index);

  $("#qualityDpiText").text(`${dpi} DPI`);
}

function resolutionIndexToDpiNumber(index) {
  var val = 300;
  switch (index) {
      case 1:
          val = 150;
          break;

      case 2:
          val = 200;
          break;

      case 3:
          val = 300;
          break;

      case 4:
          val = 600;
          break;

      default:
          val = 300;
          break;
  }

  return val;
}

const useStyles = makeStyles((theme) => ({
  form: {
    // display: 'flex',
    // flexDirection: 'column',
    margin: 'auto',
    width: 'fit-content',
    "&&&:before": {
      borderBottom: "none"
    },
    "&&:after": {
      borderBottom: "none"
    }
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
  const [checked, setChecked] = React.useState(true);
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
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" style={{boxShadow: "5px 5px"}}>
        <DialogTitle id="form-dialog-title" style={{ float: "left", width: "500px"}}>
          <div style={{float: "left", marginRight: "10px"}}>인쇄 설정</div>
          <div style={{ fontSize: "10px", color: "red"}}>
            *원활한 필기 인식을 위해 출력물의 색상이 실제와 다를 수 있습니다.
          </div>
        </DialogTitle>
        <hr></hr>
        <DialogContent>
          <div>
            <div style={{fontWeight: "bold"}}>
              인쇄 방법
            </div>
            <br></br>
            <p style={{float: "left", marginRight: "40px"}}>
              <input id="nomalPaper" type="checkbox" defaultChecked onClick={onNormalPaper} style={{display: "inline", marginRight: "10px"}}></input>
              <label>일반 용지에 인쇄</label>
            </p>
            <p>
              <input id="ncodePaper" type="checkbox" onClick={onNcodePaper} style={{display: "inline", marginRight: "10px"}}></input>
              <label>Ncode A4에 인쇄</label>
            </p>
          </div>  
          {/* </form> */}
          <Button onClick={displayOption} style={{border: "1px solid black", width: "450px"}}>고급 설정</Button>
          
          <div id="subOption" style={{marginTop: "20px", display: "none"}}>
            <p style={{float: "left", marginRight: "40px"}}>
              <input id="calibrationMark" type="checkbox" defaultChecked style={{display: "inline", marginRight: "10px"}}></input>
              <label>위치 보정용 마크 인쇄</label>
            </p>
            {/* 색변환(블루프린트) */}
            <input id="bluePrint" style={{display: "none"}}></input> 
            {/* Ncode 인쇄 여부 */}
            <input id="printNcode" style={{display: "none"}} disabled></input>
            <p>
              <span style={{marginRight: "20px"}}>코드 인쇄 농도</span>
              <select id="codeDensity">
                <option>연하게</option>
                <option>보통</option>
                <option>진하게</option>
              </select>
            </p>

            <div style={{fontWeight: "bold", clear: "both"}}>
                Ncode 발행
              </div>
              <br></br>
              <p style={{float: "left", marginRight: "40px"}}>
                <input id="forceNewCode" type="radio" defaultChecked style={{marginRight: "10px"}} />
                <label>새로운 페이지로 인쇄</label>
                <small><span id="newCodeRange"></span></small>
              </p>
              <p style={{clear: "both", marginRight: "40px"}}>
                <input id="forceSameCode" type="radio" style={{marginRight: "10px"}} />
                <label>기존 인쇄물과 같은 페이지로 인쇄</label>
                <small><span id="reuseCodeRange"></span></small>
              </p>

              <div>
                <span style={{marginRight: "20px"}}>인쇄 품질</span>
                <select id="dropDownQualityState">
                  <option>품질 우선</option>
                  <option>보통 품질</option>
                </select>
                <span id="qualityDpiText"></span>
              </div>
              <br></br>
              <div>
                <span style={{marginRight: "20px"}}>면당 여러 페이지 인쇄</span>
                <select style={{width: "50px"}}>
                  <option>2</option>
                  <option>4</option>
                  <option>6</option>
                  <option>8</option>
                </select>
              </div>
          </div>
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

