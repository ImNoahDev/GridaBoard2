import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, createStyles, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, Table, TableBody, TableCell, TableCellProps, TableContainer, TableRow, Theme, Typography, useTheme } from '@material-ui/core';
import { IPrintOption } from '../..';
import GridaToolTip from '../../../styles/GridaToolTip';
import { MappingStorage } from '../../SurfaceMapper';
import { makeNPageIdStr } from '../../UtilFunc';
import { TableCellRadio } from './TableCellRadio';


// const useStyles = makeStyles((theme: Theme) => {
//   createStyles({

//     paper: {
//       padding: theme.spacing(2),
//       textAlign: 'center',
//       color: theme.palette.text.secondary,
//     },
//   })
// });
export const cellRadioStyle = {
  paddingBottom: 2, paddingTop: 2,
  paddingLeft: 0, paddingRight: 0,

  border: "none",
  boxShadow: "none",
};

const lineBreak = 15;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      width: '100%',
    },
    scrollPaper: {
      alignItems: 'baseline'  // default center
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    table: {
      minWidth: 650,
    },
    tr: {
      "padding-top": "0px !important",
      "padding-bottom": "0px !important",
    },
    td: cellRadioStyle,
  }),

);



export interface ILeveledDialogProps {

  printOption: IPrintOption,
  levelCallback: (level: number) => void,
  optionLevel: number,
}


function LineBreak(props) {
  return (
    <TableRow style={{ height: `${lineBreak}px` }}> </TableRow>
  )

}

function OptionLevel_1(props: ILeveledDialogProps) {
  const { optionLevel, printOption } = props;
  // const [selectedValue, setSelectedValue] = React.useState('a');

  const theme = useTheme();
  const classes = useStyles();

  const toggleDetailOption = (e) => {
    let level = optionLevel;
    if (optionLevel > 0) level = 0;
    else level = 1;
    props.levelCallback(level);
  }

  const [value, setValue] = React.useState(0);
  const forceToRender = () => {
    setValue(value + 1);
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    console.log(value);
    setValue(parseInt(value));
  };



  const [selectedValue, setSelectedValue] = React.useState('Ncode');

  const onHasToPutNcode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    printOption.hasToPutNcode = value === "Ncode" ? true : false;
    setSelectedValue(value);
  };

  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;
    const checked = event.target.checked;
    console.log( `event target=${name}, value=${value} checked=${checked}`);

    switch (name) {
      case "hasToPutNcode":
        printOption[name] = checked;
        break;

      case "useNA4":
        printOption["hasToPutNcode"] = !checked;
        break;

      // case "targetPages":
      //   printOption[name] = true;
      //   break;

      // case "pagesPerSheet":
      //   printOption[name] = true;
      //   break;

      case "showTooltip":
      case "newNcode":
      case "forceToIssueNewCode":
      case "downloadNcodedPdf":
      case "needToIssueCode":
      case "drawCalibrationMark":
        printOption[name] = checked;
        break;

      // case "pageInfo":
      //   printOption[name] = true;
      //   break;


      // case "mediaSize":
      //   printOption[name] = true;
      //   break;


      // case "drawMarkRatio":
      //   printOption[name] = true;
      //   break;

      // case "colorMode":
      //   printOption[name] = true;
      //   break;

      // case "luminanceMaxRatio":
      //   printOption[name] = true;
      //   break;

      // case "codeDensity":
      //   printOption[name] = true;
      //   break;

      case "drawFrame":
        printOption[name] = checked;
        break;

      // case "padding":
      //   printOption[name] = true;
      //   break;

      // case "maxPagesPerSheetToDrawMark":
      //   printOption[name] = true;
      //   break;

      // case "debugMode":
      //   printOption[name] = true;
      //   break;

      default:
        break;
    }
    forceToRender();
  };

  // console.log(`OptionLevel1: level=${optionLevel}`);
  const msg = optionLevel > 0 ? "고급 설정 닫기" : "고급 설정 열기";

  const mapper = MappingStorage.getInstance();
  const newNcode = mapper.getNextIssuableNcodeInfo();

  // console.log(printOption);
  const help = printOption.showTooltip;

  return (
    <React.Fragment>
      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableBody>
          <TableRow className={classes.tr}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              <Typography variant="subtitle1" component="h5"> <b> 인쇄 대상 용지 </b> </Typography>
            </TableCell>
          </TableRow>
          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={printOption.hasToPutNcode} handleChange={handleChange2} color="secondary" name="hasToPutNcode">
              일반 용지에 코드와 함께 인쇄: {printOption.hasToPutNcode ? "true" : "false"}
            </TableCellRadio >

            <TableCellRadio showHelp={help} checked={!printOption.hasToPutNcode} handleChange={handleChange2} color="secondary" name="useNA4">
              Ncode A4에 PDF만 인쇄: {!printOption.hasToPutNcode ? "true" : "false"}
            </TableCellRadio >
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} colSpan={2} checked={false} handleChange={handleChange2} color="secondary" name="targetPages">
              인쇄 범위 ({printOption.targetPages}페이지), 대상: {JSON.stringify(printOption.targetPages)}
            </TableCellRadio >
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} colSpan={2} checked={false} handleChange={handleChange2} color="secondary" name="pagesPerSheet">
              한 장당 인쇄할 페이지수: {printOption.pagesPerSheet}
            </TableCellRadio >
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} colSpan={2} checked={printOption.showTooltip} handleChange={handleChange2} color="secondary" name="showTooltip">
              도움말 표시: {printOption.showTooltip ? "true" : "false"}
            </TableCellRadio >
          </TableRow>


        </TableBody>
      </Table>



      <LineBreak />
      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableBody>
          <TableRow className={classes.tr}>
            <TableCell style={cellRadioStyle}>
              <Typography variant="subtitle1" component="h5"> <b> 재인쇄 여부 </b> </Typography>
            </TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary"
              toolTip={{ title: "페이지", msg: "11", footer: "1" }} name="pageInfo">
              이전 인쇄물과 같은 페이지로 인쇄: {makeNPageIdStr(printOption.pageInfo)}
            </TableCellRadio >
          </TableRow>
          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary" name="newNcode">
              새로운 페이지에서 시작하도록 인쇄: {makeNPageIdStr(newNcode)}~
              </TableCellRadio >
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={printOption.forceToIssueNewCode} handleChange={handleChange2} color="secondary" name="forceToIssueNewCode">
              강제 새코드 발행: {printOption.forceToIssueNewCode ? "true" : "false"}
            </TableCellRadio >
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={printOption.needToIssueCode} handleChange={handleChange2} color="secondary" name="needToIssueCode">
              자동 새코드 발행: {printOption.needToIssueCode ? "true" : "false"}
            </TableCellRadio >
          </TableRow>


        </TableBody>
      </Table>

      <LineBreak />
      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableBody>
          <TableRow className={classes.tr}>
            <TableCell style={cellRadioStyle}>
              <Typography variant="subtitle1" component="h5"> <b> 인쇄 방법 </b> </Typography>
            </TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary" name="mediaSize">
              용지 크기: {JSON.stringify(printOption.mediaSize)}
            </TableCellRadio >
          </TableRow>





          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={printOption.downloadNcodedPdf} handleChange={handleChange2} color="secondary" name="downloadNcodedPdf">
              추가 인쇄용 PDF파일 다운로드: {printOption.downloadNcodedPdf ? "true" : "false"}
            </TableCellRadio >
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={printOption.drawCalibrationMark} handleChange={handleChange2} color="secondary" name="drawCalibrationMark">
              등록 마크 인쇄: {printOption.drawCalibrationMark ? "true" : "false"}
            </TableCellRadio >
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary" name="drawMarkRatio">
              등록 마크 표시 비율: {printOption.drawMarkRatio}
            </TableCellRadio >
          </TableRow>


        </TableBody>
      </Table>


      <LineBreak />
      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableBody>
          <TableRow className={classes.tr}>
            <TableCell style={cellRadioStyle}>
              <Typography variant="subtitle1" component="h5"> <b> 상세 인쇄 방법 </b> </Typography>
            </TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary" name="colorMode">
              색상 변환 모드: {printOption.colorMode}
            </TableCellRadio >
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary" name="luminanceMaxRatio">
              최대 색상 농도: {printOption.luminanceMaxRatio * 100}%
            </TableCellRadio >
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary" name="codeDensity">
              Ncode 인쇄 농도: {printOption.codeDensity === 1 ? "연하게" : (printOption.codeDensity === 2 ? "보통" : "진하게")}
            </TableCellRadio >
          </TableRow>



          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={printOption.drawFrame} handleChange={handleChange2} color="secondary" name="drawFrame">
              페이지 윤곽 표시: {printOption.drawFrame ? "true" : "false"}
            </TableCellRadio >
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary" name="padding">
              인쇄 여백: {printOption.padding}mm
            </TableCellRadio >
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary" name="maxPagesPerSheetToDrawMark">
              Ncode A4 인쇄 가능 페이지/장의 최대값: {printOption.maxPagesPerSheetToDrawMark}
            </TableCellRadio >
          </TableRow>




          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary" name="filename">
              파일이름: {printOption.filename}
            </TableCellRadio >
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary" name="url">
              URL: {printOption.url}
            </TableCellRadio >
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCellRadio showHelp={help} checked={false} handleChange={handleChange2} color="secondary" name="debugMode">
              디버깅 레벨: {printOption.debugMode}
            </TableCellRadio >
          </TableRow>



        </TableBody>
      </Table>


    </React.Fragment >
  );
}


export default OptionLevel_1;