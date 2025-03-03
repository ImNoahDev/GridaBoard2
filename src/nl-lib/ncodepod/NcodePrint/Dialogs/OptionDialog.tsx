import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogContentText, DialogProps, DialogTitle, Grid, TableCell, useTheme } from '@material-ui/core';
import OptionLevel_debug from "./OptionDialogComponents/OptionLevel_debug";
import OptionLevel_0 from "./OptionDialogComponents/OptionLevel_0";
import OptionLevel_1 from "./OptionDialogComponents/OptionLevel_1";
import OptionLevel_2 from "./OptionDialogComponents/OptionLevel_2";
import { convertStringToArray } from './OptionDialogComponents/PageRangeField';
import { MappingStorage } from 'nl-lib/common/mapper';

import { cloneObj } from 'nl-lib/common/util';
import { IPrintOption } from 'nl-lib/common/structures';
import { MediaSize } from 'nl-lib/common/constants';
import { useSelector } from 'react-redux';

import { RootState } from 'GridaBoard/store/rootReducer';
import getText from "GridaBoard/language/language";


const useStyles = makeStyles(theme=> ({
  root: {
    width: '100%',
  },
  scrollPaper: {
    alignItems: 'baseline',  // default center
    width: "100%"
  },
  buttons : {
    boxShadow: `${theme.custom.shadows[2]} !important`
  }
}));

export const cellRadioStyle = {
  paddingBottom: 2, paddingTop: 2,
  paddingLeft: 0, paddingRight: 0,

  border: "none",
  boxShadow: "none",
};


export const MAX_PRINTOPTION_LEVEL = 1;    // 2: debug mode
export const DEFAULT_PRINTOPTION_LEVEL = 0;    // 2: debug mode

interface IDialogProps extends DialogProps {
  open: boolean,
  printOption: IPrintOption,
  cancelCallback: (printOption: IPrintOption) => void,
  okCallback: (printOption: IPrintOption) => void,

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
        printOption[name] = value === getText("print_popup_detail_ncodelevel_normal") ? 2 : 3;
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

  const levelButtonText = [getText("print_popup_toDetail"), "전문가 설정 보기", getText("print_popup_toSimple")];

  console.log(`default: level=${optionLevel}`);
  let msg = levelButtonText[optionLevel];
  if (optionLevel === MAX_PRINTOPTION_LEVEL) msg = levelButtonText[levelButtonText.length - 1];

  const help = printOption ? printOption.showTooltip : true;

  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);

  return (
    <React.Fragment>
      <Dialog open={open} {...rest} onClose={handleClose} classes={{ scrollPaper: classes.scrollPaper }} style={{zoom: 1 / brZoom}}>

        <DialogTitle id="form-dialog-title" style={{ float: "left", width: "600px" }}>
          <Box fontSize={20} fontWeight="fontWeightBold" style={{float: "left", marginRight: "100px", marginBottom: "-20px"}}>
            {getText("print_popup_title")}
          </Box>
   
          {/* <TableCell colSpan={1} style={cellRadioStyle}>
              <RadioField showHelp={help} colSpan={1} checked={printOption.showTooltip} handleChange={handleChange2} color="primary" name="showTooltip">
                도움말 표시: {printOption.showTooltip ? "true" : "false"}
              </RadioField >
          </TableCell> */}
        </DialogTitle>



        <DialogContent ref={dialogRef}>
          <DialogContentText>
            {getText("print_popup_subtitle")}
            <br/><br/>
          </DialogContentText>

          <OptionLevel_0  {...props} color={"primary"} levelCallback={onLevelChanged} handleChange2={handleChange2} optionLevel={optionLevel} />

          {optionLevel > 0 ? <OptionLevel_1 {...props} color={"primary"} levelCallback={onLevelChanged} handleChange2={handleChange2} optionLevel={optionLevel} /> : ""}
          {optionLevel > 1 ? <OptionLevel_2 {...props} color={"primary"} levelCallback={onLevelChanged} handleChange2={handleChange2} optionLevel={optionLevel} /> : ""}
          {optionLevel > 2 ? <OptionLevel_debug {...props} color={"primary"} levelCallback={onLevelChanged} handleChange2={handleChange2} optionLevel={optionLevel} /> : ""}

        </DialogContent>

        <DialogActions>

          <Grid item xs={12} sm={11}>
            <Button onClick={handleLevel} color="primary">
              {msg}
            </Button>
          </Grid>

          {/* <Grid item xs={12} sm={5}>
          </Grid> */}

          <Grid item xs={12} sm={2}>
            <Button className={classes.buttons} onClick={handleOK} variant="contained" color="primary" autoFocus>
              {getText("print_popup_yes")}
          </Button>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button className={classes.buttons} onClick={handleCancel} variant="contained">
              {getText("print_popup_no")}
          </Button>
          </Grid>

        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}








interface Props extends ButtonProps {
  printOption: IPrintOption,
}


export default function OptionDialogButton(props: Props) {
  const { printOption, ...rest } = props;
  const [show, setShow] = useState(false);

  const openDialog = () => {
    //동작함??
    setShow(true);
  }

  const onCancel = () => {
    //동작함??
    setShow(false);
    console.log("onCancel");
  }

  const onOK = () => {
    //동작함??
    setShow(false);
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
        printOption={_printOption} /> : ""}
    </React.Fragment>
  );
}
