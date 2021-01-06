import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle, Grid, useTheme } from '@material-ui/core';
import OptionLevel_debug from "./OptionDialogComponents/OptionLevel_debug";
import OptionLevel_0 from "./OptionDialogComponents/OptionLevel_0";
import OptionLevel_1 from "./OptionDialogComponents/OptionLevel_1";
import OptionLevel_2 from "./OptionDialogComponents/OptionLevel_2";
import { convertStringToArray } from './OptionDialogComponents/PageRangeField';
import { MappingStorage } from '../../../common/mapper';

import { cloneObj } from '../../../common/util';
import { IPrintOption } from '../../../common/structures';
import { MediaSize } from '../../../common/constants';


const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  scrollPaper: {
    alignItems: 'baseline',  // default center
    width: "100%"
  }
});


export const MAX_PRINTOPTION_LEVEL = 1;    // 2: debug mode
export const DEFAULT_PRINTOPTION_LEVEL = 1;    // 2: debug mode

interface IDialogProps extends DialogProps {
  open: boolean,
  printOption: IPrintOption,
  cancelCallback: (printOption: IPrintOption) => void,
  okCallback: (printOption: IPrintOption) => void,

  handkeTurnOnAppShortCutKey: (on: boolean) => void,
}

let _printOption: IPrintOption;

export function OptionDialog(props: IDialogProps) {
  const { printOption, cancelCallback, okCallback, ...rest } = props;
  // const [open, setOpen] = useState(props.open);
  const classes = useStyles();
  const theme = useTheme();
  const dialogRef = useRef(null);
  const [optionLevel, setOptionLevel] = useState(DEFAULT_PRINTOPTION_LEVEL);
  const isInitialMount = useRef(true);

  /** force to rerender */
  const [value, setValue] = React.useState(0);
  const forceToRender = () => {
    setValue(value + 1);
  }


  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      _printOption = cloneObj(printOption);
    } else {
      // Your useEffect code here to be run on update
    }
  });

  useEffect(() => {
    if (props.open) {
      props.handkeTurnOnAppShortCutKey(false);
    }
    else {
      props.handkeTurnOnAppShortCutKey(true);
    }

  }, [props.open]);


  const setInputFileds = () => {
    const elems = document.getElementsByName("targetPages") as any;
    elems.forEach((elem) => {
      if (elem.value.length > 0) {
        printOption["targetPages"] = convertStringToArray(elem.value);
      }
    });
  }

  const handleClose = (e) => {
    setInputFileds();

    // if (props.cancelCallback) {
    //   props.cancelCallback(printOption);
    // }
    console.log("testing: closing");
  }


  const handleCancel = (e) => {
    console.log("testing: closing");
    setInputFileds();

    // setOpen(false);
    if (props.cancelCallback) {
      props.cancelCallback(printOption);
    }
  }

  const handleOK = (e) => {
    console.log("testing: closing");
    setInputFileds();

    if (props.okCallback) {
      props.okCallback(printOption);
    }
  }


  const onLevelChanged = (level: number) => {
    setOptionLevel(level);
    console.log(`default: level=${optionLevel}`);
  }

  const handleLevel = (e) => {
    let level = optionLevel + 1;
    level %= MAX_PRINTOPTION_LEVEL + 1;
    setOptionLevel(level);
  }



  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    console.log(value);
    setValue(parseInt(value));
  };


  // const checkAssociatedMappingInfo = () => {
  //   // PrintPdfMain의 printTrigger를 +1 해 주면, 인쇄가 시작된다
  //   const msi = MappingStorage.getInstance();
  //   const pdfToNcodeMapArr = msi.findAssociatedNcode(printOption.fingerprint, printOption.pagesPerSheet);
  //   const pdfToNcodeMap = pdfToNcodeMapArr.length > 0 ? pdfToNcodeMapArr[0] : undefined;

  //   if (!pdfToNcodeMap) {
  //     printOption.forceToUpdateBaseCode = true;
  //     printOption.needToIssuePrintCode = true;
  //   }
  //   else if (pdfToNcodeMap.printPageInfo)

  //     if (printOption.needToIssuePrintCode) {
  //       printOption.pageInfo = { ...g_nullNcode };
  //     }
  //     else {
  //       printOption.pageInfo = { ...pdfToNcodeMap.printPageInfo };
  //     }
  // }


  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    const checked = event.target.checked;
    console.log(`event target=${name}, value=${value} checked=${checked}`);

    switch (name) {
      case "hasToPutNcode":
        printOption[name] = checked;
        break;

      case "useNA4":
        printOption["hasToPutNcode"] = !checked;
        break;

      case "targetPages":
        printOption[name] = convertStringToArray(value);
        break;

      case "pagesPerSheet": {
        printOption[name] = parseInt(value) as 1 | 2 | 4 | 8 | 9 | 16 | 18 | 25 | 32;
        const msi = MappingStorage.getInstance();
        const partOption = msi.getCodePrintInfo(printOption, undefined);
        for (const key in partOption) printOption[key] = partOption[key];
        break;
      }

      case "showTooltip":
      case "forceToUpdateBaseCode":
      case "needToIssuePrintCode":
      case "downloadNcodedPdf":
      case "drawCalibrationMark":
      case "drawFrame":
        printOption[name] = checked;
        break;

      case "sameCode": {
        printOption["forceToUpdateBaseCode"] = !checked;

        const msi = MappingStorage.getInstance();
        const partOption = msi.getCodePrintInfo(printOption, undefined);
        for (const key in partOption) printOption[key] = partOption[key];

        break;
      }

      case "newNcode": {
        printOption["forceToUpdateBaseCode"] = checked;

        const msi = MappingStorage.getInstance();
        const partOption = msi.getCodePrintInfo(printOption, undefined);
        for (const key in partOption) printOption[key] = partOption[key];
        break;
      }


      case "mediaSize":
        printOption[name] = MediaSize[value];
        break;


      case "drawMarkRatio":
        printOption[name] = parseInt(value) / 100;
        break;

      case "colorMode":
        printOption[name] = value === "Blue" ? 0 : (value === "Vivid" ? 1 : 2);
        break;

      case "luminanceMaxRatio":
        printOption[name] = parseInt(value) / 100;
        break;

      case "codeDensity":
        printOption[name] = value === "보통" ? 2 : (value === "연하게" ? 1 : 3);
        break;

      case "imagePadding":
        printOption.imagePadding = parseInt(value) + printOption.pdfPagePadding;
        break;

      case "pdfPagePadding":
        printOption.imagePadding = parseInt(value) + printOption.imagePadding - printOption.pdfPagePadding;
        printOption[name] = parseInt(value);
        break;

      case "maxPagesPerSheetToDrawMark":
        printOption[name] = isNaN(parseInt(value)) ? 65536 : parseInt(value);
        break;

      case "debugMode":
        printOption[name] = parseInt(value) as 0 | 1 | 2 | 3;
        break;

      default:
        break;
    }
    forceToRender();
  };

  const levelButtonText = ["상세 설정 보기", "전문가 설정 보기", "간단 설정으로"];

  console.log(`default: level=${optionLevel}`);
  let msg = levelButtonText[optionLevel];
  if (optionLevel === MAX_PRINTOPTION_LEVEL) msg = levelButtonText[levelButtonText.length - 1];

  return (
    <React.Fragment>
      {
        console.log(open)
      }
      <Dialog open={open} {...rest} onClose={handleClose} classes={{ scrollPaper: classes.scrollPaper }} >

        <DialogTitle id="form-dialog-title" style={{ float: "left", width: "600px" }}>
          <Box fontSize={20} fontWeight="fontWeightBold" >
            인쇄 옵션
        </Box>
        </DialogTitle>

        <DialogContent ref={dialogRef}>
          <OptionLevel_0  {...props} color={"primary"} levelCallback={onLevelChanged} handleChange2={handleChange2} optionLevel={optionLevel} />

          {optionLevel > 0 ? <OptionLevel_1 {...props} color={"primary"} levelCallback={onLevelChanged} handleChange2={handleChange2} optionLevel={optionLevel} /> : ""}
          {optionLevel > 1 ? <OptionLevel_2 {...props} color={"primary"} levelCallback={onLevelChanged} handleChange2={handleChange2} optionLevel={optionLevel} /> : ""}
          {optionLevel > 2 ? <OptionLevel_debug {...props} color={"primary"} levelCallback={onLevelChanged} handleChange2={handleChange2} optionLevel={optionLevel} /> : ""}

        </DialogContent>

        <DialogActions>

          <Grid item xs={12} sm={4}>
            <Button onClick={handleLevel} color="primary">
              {msg}
            </Button>
          </Grid>

          <Grid item xs={12} sm={7}>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button style={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.info.contrastText,
              boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.3)",
            }} onClick={handleOK} color="primary" autoFocus>
              확인
          </Button>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button style={{
              backgroundColor: theme.palette.info.main,
              color: theme.palette.info.contrastText,
              boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.3)",
            }}
              onClick={handleCancel} color="secondary">
              취소
          </Button>
          </Grid>

        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}








interface Props extends ButtonProps {
  printOption: IPrintOption,
  handkeTurnOnAppShortCutKey: (on: boolean) => void,
}


export default function OptionDialogButton(props: Props) {
  const { printOption, ...rest } = props;
  const [show, setShow] = useState(false);

  const openDialog = () => {
    props.handkeTurnOnAppShortCutKey(false);

    setShow(true);
  }

  const onCancel = () => {
    setShow(false);
    props.handkeTurnOnAppShortCutKey(true);
    console.log("onCancel");
  }

  const onOK = () => {
    setShow(false);
    props.handkeTurnOnAppShortCutKey(true);
    console.log("onOK");
  }

  return (
    <React.Fragment>
      <button {...rest} onClick={openDialog} >
        {props.children}
      </button>

      { show ? <OptionDialog
        open={show}
        cancelCallback={onCancel} okCallback={onOK}
        handkeTurnOnAppShortCutKey={props.handkeTurnOnAppShortCutKey}
        printOption={_printOption} /> : ""}
    </React.Fragment>
  );
}