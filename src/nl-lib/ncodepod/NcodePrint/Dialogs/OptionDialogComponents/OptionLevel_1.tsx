import React from 'react';
import { Table, TableBody, TableCell, TableRow, Typography, useTheme } from '@material-ui/core';
import { MappingStorage } from 'nl-lib/common/mapper';
import { RadioField } from './RadioField';
import { ILeveledDialogProps, LineBreak, useLevelDialogStyles, cellRadioStyle } from "./OptionLevel_0";
import { SelectField } from './SelectField';
import { makeNPageIdStr } from 'nl-lib/common/util';
import { MediaSize } from 'nl-lib/common/constants';
import getText from 'nl-lib/../GridaBoard/language/language';

function EmptryTableRow() {
  return (
    <TableRow style={{ height: "24px" }}><TableCell colSpan={2} style={cellRadioStyle}>
      {/* <hr /> */}
    </TableCell> </TableRow>
  )
}

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
  // const msg = optionLevel > 0 ? "고급 설정 닫기" : "고급 설정 열기";

  const msi = MappingStorage.getInstance();
  const [newBaseCode, newPrintCode] = msi.getNextIssuablePageInfo(printOption);

  // console.log(printOption);
  const help = printOption.showTooltip;

  let newCodeOnly = false;
  if (printOption.needToIssueBaseCode) {
    newCodeOnly = true;
  }

  const ncodeA4 = !printOption.hasToPutNcode;

  const newCodeWillUsed = printOption.needToIssueBaseCode || printOption.forceToUpdateBaseCode;

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
              <Typography variant="subtitle1" component="h5"> <b> {getText("print_popup_detail_title")} </b> </Typography>
            </TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              <SelectField showHelp={help} colSpan={2} handleChange={handleChange2}
                candidates={mediaNames}
                value={printOption.mediaSize.name}
                color={color} name="mediaSize">
                {getText("print_popup_detail_papersize")}:
              </SelectField >
            </TableCell>
          </TableRow>



          <TableRow className={classes.tr}>
            <TableCell colSpan={1} style={cellRadioStyle}>
              <SelectField showHelp={help} colSpan={2} handleChange={handleChange2}
                candidates={[getText("print_popup_detail_ncodelevel_normal"), getText("print_popup_detail_ncodelevel_hard")]}
                value={(printOption.codeDensity === 2 ? getText("print_popup_detail_ncodelevel_normal") : getText("print_popup_detail_ncodelevel_hard"))}
                color={color} name="codeDensity">
                {getText("print_popup_detail_ncodelevel")}:
              </SelectField >
            </TableCell>

            {/* <TableCell colSpan={1} style={cellRadioStyle}>
              <RadioField showHelp={help} checked={printOption.drawFrame} handleChange={handleChange2} color={color} name="drawFrame">
                {getText("print_popup_detail_outline")}:
              </RadioField >
            </TableCell> */}

          </TableRow>

        </TableBody>
      </Table>


      <Table style={{ borderCollapse: "collapse", border: "0" }}>
        <TableRow style={{ height: "24px" }}><TableCell colSpan={2} style={cellRadioStyle}>
          {/* <hr /> */}
        </TableCell> </TableRow>
      </Table>



      {/* <Table style={{ borderCollapse: "collapse", border: "0" }}>
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
                {printOption.needToIssueBaseCode ? "이전 ID로 인쇄할 수 없음" : "이전 ID로 인쇄: "}
                {printOption.needToIssueBaseCode ? "" : makeNPageIdStr(printOption.prevBasePageInfo)}
              </RadioField >
            </TableCell>
          </TableRow>


          <TableRow className={classes.tr}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              <RadioField showHelp={help} colSpan={2} disabled={newCodeOnly || ncodeA4} checked={newCodeWillUsed && !ncodeA4} handleChange={handleChange2}
                color={color} name="newNcode">
                새로운 ID로 인쇄: {makeNPageIdStr(newBaseCode)}~
              </RadioField >
            </TableCell>
          </TableRow>


          <EmptryTableRow />


          <TableRow className={classes.tr}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              <RadioField showHelp={help} colSpan={2} disabled={true} checked={newCodeWillUsed && !ncodeA4} handleChange={handleChange2}
                color={color} name="ncodePrint">
                (내부 상태) 인쇄 Ncode 정보
                {printOption.needToIssuePrintCode ? "(새코드)" : "(이전코드)"} :
                {makeNPageIdStr(printOption.printPageInfo)}~
              </RadioField >
            </TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              <RadioField showHelp={help} colSpan={2} disabled={true} checked={printOption.needToIssueBaseCode} handleChange={handleChange2}
                color={color} name="needToIssueBaseCode">
                (상태) needToIssueBaseCode: {printOption.needToIssueBaseCode ? "true" : "false"}
              </RadioField >
            </TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              <RadioField showHelp={help} colSpan={2} disabled={true} checked={printOption.needToIssuePrintCode} handleChange={handleChange2}
                color={color} name="needToIssuePrintCode">
                (상태) needToIssuePrintCode: {printOption.needToIssuePrintCode ? "true" : "false"}
              </RadioField >
            </TableCell>
          </TableRow>

          <TableRow className={classes.tr}>
            <TableCell colSpan={2} style={cellRadioStyle}>
              <RadioField showHelp={help} colSpan={2} disabled={true} checked={printOption.forceToUpdateBaseCode} handleChange={handleChange2}
                color={color} name="forceToUpdateBaseCode">
                (선택) forceToUpdateBaseCode: {printOption.forceToUpdateBaseCode ? "true" : "false"}
              </RadioField >
            </TableCell>
          </TableRow>

        </TableBody>
      </Table> */}


    </React.Fragment >
  );
}


export default OptionLevel_1;