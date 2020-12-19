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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    console.log(value);
    setValue(parseInt(value));
  };



  const [selectedValue, setSelectedValue] = React.useState('a');

  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };
  console.log(`OptionLevel1: level=${optionLevel}`);
  const msg = optionLevel > 0 ? "고급 설정 닫기" : "고급 설정 열기";

  const mapper = MappingStorage.getInstance();
  const newNcode = mapper.getNextIssuableNcodeInfo();

  console.log(printOption);
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
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="hasToPutNcode">
              일반 용지에 코드와 함께 인쇄: {printOption.hasToPutNcode ? "true" : "false"}
            </TableCellRadio>

            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="hasToPutNcode_neg">
              Ncode A4에 PDF만 인쇄: {!printOption.hasToPutNcode ? "true" : "false"}
            </TableCellRadio>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio colSpan={2} selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="pagesPerSheet">
              한 장당 인쇄할 페이지수: {printOption.pagesPerSheet}
            </TableCellRadio>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio colSpan={2} selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="targetPages">
              인쇄 범위: {JSON.stringify(printOption.targetPages)}
            </TableCellRadio>
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
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="pageInfo"
              toolTip={{ title: "페이지", msg: "11", footer: "1" }}>
              이전 인쇄물과 같은 페이지로 인쇄: {makeNPageIdStr(printOption.pageInfo)}
            </TableCellRadio>
          </TableRow>
          <TableRow className={classes.tr}>
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="newNcode">
              새로운 페이지에서 시작하도록 인쇄: {makeNPageIdStr(newNcode)}~
              </TableCellRadio>
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
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="mediaSize">
              용지 크기: {JSON.stringify(printOption.mediaSize)}
            </TableCellRadio>
          </TableRow>





          <TableRow className={classes.tr}>
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="downloadNcodedPdf">
              인쇄용 파일 다운로드: {printOption.downloadNcodedPdf ? "true" : "false"}
            </TableCellRadio>
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
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="colorMode">
              색상 변환 모드: {printOption.colorMode}
            </TableCellRadio>
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="luminanceMaxRatio">
              최대 인쇄 농도: {printOption.luminanceMaxRatio}
            </TableCellRadio>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="codeDensity">
              코드 농도: {printOption.codeDensity}
            </TableCellRadio>
          </TableRow>



          <TableRow className={classes.tr}>
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="drawFrame">
              틀 그리기: {printOption.drawFrame ? "true" : "false"}
            </TableCellRadio>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="debugMode">
              디버깅 레벨: {printOption.debugMode}
            </TableCellRadio>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="padding">
              용지 여백(mm): {printOption.padding}
            </TableCellRadio>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="maxPagesPerSheetToDrawMark">
              Ncode A4를 쓸 수 있는 한 장당 인쇄 페이지수: {printOption.maxPagesPerSheetToDrawMark}
            </TableCellRadio>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="drawMarkRatio">
              용지 등록 마크가 표시 비율: {printOption.drawMarkRatio}
            </TableCellRadio>
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="filename">
              파일이름: {printOption.filename}
            </TableCellRadio>
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCellRadio selectedValue={selectedValue} value="a" handleChange={handleChange2} color="secondary" name="url">
              URL: {printOption.url}
            </TableCellRadio>
          </TableRow>




        </TableBody>
      </Table>


    </React.Fragment >
  );
}


export default OptionLevel_1;