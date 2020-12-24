import React from 'react';
import { Table, TableBody, TableCell, TableRow, Typography, useTheme } from '@material-ui/core';
import { MappingStorage } from '../../../SurfaceMapper';
import { makeNPageIdStr } from '../../../UtilFunc';
import { RadioField } from './RadioField';
import { ILeveledDialogProps, LineBreak, useLevelDialogStyles, cellRadioStyle } from "./OptionLevel_0";
import { SelectField } from './SelectField';
import { MediaSize } from '../../..';


function OptionLevel_1(props: ILeveledDialogProps) {
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


  // console.log(`OptionLevel1: level=${optionLevel}`);
  const msg = optionLevel > 0 ? "고급 설정 닫기" : "고급 설정 열기";

  const mapper = MappingStorage.getInstance();
  const newNcode = mapper.getNextIssuableNcodeInfo();

  // console.log(printOption);
  const help = printOption.showTooltip;

  let newCodeOnly = false;
  if (printOption.pageInfo.page === -1) {
    newCodeOnly = true;
  }

  const ncodeA4 = !printOption.hasToPutNcode;

  const newCodeWillUsed = printOption.needToIssueCode || printOption.forceToIssueNewCode;

  const mediaNames = Object.keys(MediaSize);
  return (
    <React.Fragment>
      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableRow style={{ height: "24px" }}><TableCell colSpan={2} style={cellRadioStyle}>
          {/* <hr /> */}
        </TableCell> </TableRow>
      </Table>



      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableBody>
          <TableRow className={classes.tr}>
            <TableCell style={cellRadioStyle} colSpan={2}>
              <Typography variant="subtitle1" component="h5"> <b> 용지 크기와 농도 </b> </Typography>
            </TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              <SelectField showHelp={help} colSpan={2} handleChange={handleChange2}
                candidates={mediaNames}
                value={printOption.mediaSize.name}
                color={color} name="mediaSize">
                용지 크기:
              </SelectField >
            </TableCell>
          </TableRow>



          <TableRow className={classes.tr}>
            <TableCell colSpan={1} style={cellRadioStyle}>
              <SelectField showHelp={help} colSpan={2} handleChange={handleChange2}
                candidates={["연하게", "보통", "진하게"]}
                value={(printOption.codeDensity === 2 ? "보통" : "진하게")}
                color={color} name="codeDensity">
                Ncode 농도:
              </SelectField >
            </TableCell>

            <TableCell colSpan={1} style={cellRadioStyle}>
              <RadioField showHelp={help} checked={printOption.drawFrame} handleChange={handleChange2} color={color} name="drawFrame">
                페이지 윤곽 표시
              </RadioField >
            </TableCell>

          </TableRow>

        </TableBody>
      </Table>


      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableRow style={{ height: "24px" }}><TableCell colSpan={2} style={cellRadioStyle}>
          {/* <hr /> */}
        </TableCell> </TableRow>
      </Table>



      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableBody>
          <TableRow className={classes.tr}>
            <TableCell style={cellRadioStyle} colSpan={2}>
              <Typography variant="subtitle1" component="h5"> <b> Ncode 할당 정보 </b> </Typography>
            </TableCell>
          </TableRow>

          <TableRow className={classes.tr} >
            <TableCell colSpan={2} style={cellRadioStyle}>
              <RadioField showHelp={help} colSpan={2} disabled={newCodeOnly || ncodeA4} checked={!newCodeWillUsed} handleChange={handleChange2} color={color}
                name="sameCode">
                이전 인쇄물과 같은 페이지로 인쇄: {makeNPageIdStr(printOption.pageInfo)}
              </RadioField >
            </TableCell>
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              <RadioField showHelp={help} colSpan={2} disabled={newCodeOnly || ncodeA4} checked={newCodeWillUsed && !ncodeA4} handleChange={handleChange2} color={color} name="newNcode">
                새로운 페이지에서 시작하도록 인쇄: {makeNPageIdStr(newNcode)}~
              </RadioField >
            </TableCell>
          </TableRow>




        </TableBody>
      </Table>


    </React.Fragment >
  );
}


export default OptionLevel_1;