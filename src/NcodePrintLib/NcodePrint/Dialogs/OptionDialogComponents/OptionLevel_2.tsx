import React from 'react';
import { Box, Table, TableBody, TableCell,  TableRow,  Typography, useTheme } from '@material-ui/core';
import { MappingStorage } from '../../../SurfaceMapper';
import { makeNPageIdStr } from '../../../UtilFunc';
import { RadioField } from './RadioField';
import { ILeveledDialogProps, LineBreak, useLevelDialogStyles, cellRadioStyle } from "./OptionLevel_0";


function OptionLevel_2(props: ILeveledDialogProps) {
  const { optionLevel, printOption, handleChange2, color } = props;

  const localColor = "secondary";

  const theme = useTheme();
  const classes = useLevelDialogStyles();


  const toggleProfessionalOption = (e) => {
    let level = optionLevel;
    if (level > 1) level = 1;
    else level = 2;
    props.levelCallback(level);
  }

  console.log(`OptionLevel2: level=${optionLevel}`);
  if (optionLevel < 1) return (<></>);

  const msg = optionLevel > 1 ? "전문가 설정 닫기" : "전문가 설정 열기";
  console.log(`OptionLevel2: step 2, level=${optionLevel}`);

  const mapper = MappingStorage.getInstance();
  const newNcode = mapper.getNextIssuableNcodeInfo();

  // console.log(printOption);
  const help = printOption.showTooltip;

  let newCodeOnly = false;
  if (printOption.pageInfo.page === -1) {
    newCodeOnly = true;
  }

  const newCodeWillUsed = printOption.needToIssueCode || printOption.forceToIssueNewCode;

  return (
    <React.Fragment>

      <LineBreak />
      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableBody>



          <TableRow className={classes.tr}>
            <TableCell style={cellRadioStyle} colSpan={2}>
              <Typography variant="subtitle1" component="h5" color={localColor}> <b> 상세 설정 </b> </Typography>
            </TableCell>
          </TableRow>
          

          
          <TableRow className={classes.tr} >
            <TableCell colSpan={1} style={cellRadioStyle}>
<RadioField showHelp={help} colSpan={1} checked={false} handleChange={handleChange2} color={localColor} name="colorMode">
              색변환 방법 선택: {printOption.colorMode}
            </RadioField >
</TableCell>

            <TableCell colSpan={1} style={cellRadioStyle}>
<RadioField showHelp={help} checked={false} handleChange={handleChange2} color={localColor} name="luminanceMaxRatio">
              색변환 최대 농도: {printOption.luminanceMaxRatio * 100}%
            </RadioField >
</TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCell colSpan={1} style={cellRadioStyle}>
<RadioField showHelp={help} checked={printOption.drawCalibrationMark} handleChange={handleChange2} color={localColor} name="drawCalibrationMark">
              등록 마크 인쇄: {printOption.drawCalibrationMark ? "true" : "false"}
            </RadioField >
</TableCell>
            <TableCell colSpan={1} style={cellRadioStyle}>
<RadioField showHelp={help} checked={false} handleChange={handleChange2} color={localColor} name="drawMarkRatio">
              등록 마크 표시 비율: {printOption.drawMarkRatio}
            </RadioField >
</TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCell colSpan={1} style={cellRadioStyle}>
<RadioField showHelp={help} checked={printOption.forceToIssueNewCode} handleChange={handleChange2} color={localColor} name="forceToIssueNewCode">
              강제 새코드 발행: {printOption.forceToIssueNewCode ? "true" : "false"}
            </RadioField >
</TableCell>
          </TableRow>



        </TableBody>
      </Table>





      <LineBreak />
      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableBody>
          <TableRow className={classes.tr}>
            <TableCell style={cellRadioStyle}>
              <Typography variant="subtitle1" component="h5" color={localColor}> <b> 정보 및 디버깅 </b> </Typography>
            </TableCell>
          </TableRow>



          <TableRow className={classes.tr}>
            <TableCell colSpan={1} style={cellRadioStyle}>
<RadioField showHelp={help} checked={printOption.needToIssueCode} handleChange={handleChange2} color={localColor} name="needToIssueCode">
              코드 할당 예정: {printOption.needToIssueCode ? "true" : "false"}
            </RadioField >
</TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCell colSpan={1} style={cellRadioStyle}>
<RadioField showHelp={help} checked={false} handleChange={handleChange2} color={localColor} name="maxPagesPerSheetToDrawMark">
              Ncode A4 인쇄 가능 페이지/장의 최대값: {printOption.maxPagesPerSheetToDrawMark}
            </RadioField >
</TableCell>
          </TableRow>



          <TableRow className={classes.tr}>
            <TableCell colSpan={1} style={cellRadioStyle}>
<RadioField showHelp={help} checked={false} handleChange={handleChange2} color={localColor} name="filename">
              파일이름:  <Box fontSize={1}>{printOption.filename}</Box>
            </RadioField >
</TableCell>
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCell colSpan={1} style={cellRadioStyle}>
<RadioField showHelp={help} checked={false} handleChange={handleChange2} color={localColor} name="url">
              URL: <Box fontSize={1}>{printOption.url}</Box>
            </RadioField >
</TableCell>
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCell colSpan={1} style={cellRadioStyle}>
<RadioField showHelp={help} checked={false} handleChange={handleChange2} color={localColor} name="debugMode">
              디버깅 레벨: {printOption.debugMode}
            </RadioField >
</TableCell>
          </TableRow>



        </TableBody>
      </Table>


    </React.Fragment >
  );
}




export default OptionLevel_2;