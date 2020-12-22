import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, createStyles, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, Table, TableBody, TableCell, TableCellProps, TableContainer, TableRow, Theme, Typography, useTheme } from '@material-ui/core';
import { IPrintOption } from '../../..';
import GridaToolTip from '../../../../styles/GridaToolTip';
import { MappingStorage } from '../../../SurfaceMapper';
import { makeNPageIdStr } from '../../../UtilFunc';
import { RadioField } from './RadioField';
import { convertStringToArray, PageRangeField } from './PageRangeField';
import { printOptionTip } from './ToolTips';
import { SelectField } from './SelectField';


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
export function LineBreak(props) {
  return (
    <TableRow style={{ height: `${lineBreak}px` }}>
      <TableCell style={cellRadioStyle}></TableCell>
    </TableRow>
  )

}


export const useLevelDialogStyles = makeStyles((theme: Theme) =>
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

  handleChange2: (event: React.ChangeEvent<HTMLInputElement>) => void,
  color,
}




function OptionLevel_0(props: ILeveledDialogProps) {
  const { optionLevel, printOption, handleChange2, color } = props;
  // const [selectedValue, setSelectedValue] = React.useState('a');

  const theme = useTheme();
  const classes = useLevelDialogStyles();

  const toggleDetailOption = (e) => {
    let level = optionLevel;
    if (optionLevel > 0) level = 0;
    else level = 1;
    props.levelCallback(level);
  }
  makeNPageIdStr
  // console.log(`OptionLevel1: level=${optionLevel}`);
  const msg = optionLevel > 0 ? "고급 설정 닫기" : "고급 설정 열기";

  const mapper = MappingStorage.getInstance();
  const newNcode = mapper.getNextIssuableNcodeInfo();

  // console.log(printOption);
  const help = printOption ? printOption.showTooltip : true;

  const midbreak = 16;
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
            <TableCell colSpan={1} style={cellRadioStyle}>
              <RadioField showHelp={help} checked={printOption.hasToPutNcode ? printOption.hasToPutNcode : false}
                handleChange={handleChange2} color={color} name="hasToPutNcode">
                일반 복사 용지에 인쇄
            </RadioField >
            </TableCell>

            <TableCell colSpan={1} style={cellRadioStyle}>
              <RadioField showHelp={help} checked={!printOption.hasToPutNcode} handleChange={handleChange2} color={color} name="useNA4">
                Ncode A4에 인쇄
            </RadioField >
            </TableCell>
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCell colSpan={1} style={cellRadioStyle}>
              <SelectField showHelp={help} colSpan={2} handleChange={handleChange2}
                candidates={[1, 2, 4, 8, 9, 16, 18, 25, 32]}
                value={printOption.pagesPerSheet} color={color} name="pagesPerSheet">
                한 장당 인쇄할 페이지수:
              </SelectField >
            </TableCell>

            <TableCell colSpan={1} style={cellRadioStyle}>
              <RadioField showHelp={help} colSpan={1} checked={printOption.showTooltip} handleChange={handleChange2} color={color} name="showTooltip">
                도움말 표시: {printOption.showTooltip ? "true" : "false"}
              </RadioField >
            </TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCell colSpan={1} style={cellRadioStyle} align={"right"}>
              <RadioField showHelp={help} checked={printOption.downloadNcodedPdf} handleChange={handleChange2} color={color} name="downloadNcodedPdf">
                PDF로 저장
            </RadioField >
            </TableCell>
          </TableRow>

          <TableRow style={{ height: "24px" }}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              {/* <hr /> */}
            </TableCell>
          </TableRow>

        </TableBody>
      </Table>

      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableBody>
          <TableRow className={classes.tr}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              <Typography variant="subtitle1" component="h5"> <b> 인쇄 페이지 </b> </Typography>
            </TableCell>
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              <PageRangeField showHelp={help} range={printOption.targetPages} max={printOption.docNumPages} handleChange={handleChange2} color={color} name="targetPages">
                인쇄 범위 ({printOption.targetPages.length}페이지)
            </PageRangeField >
            </TableCell>
          </TableRow>

        </TableBody>
      </Table>


    </React.Fragment >
  );
}


export default OptionLevel_0;