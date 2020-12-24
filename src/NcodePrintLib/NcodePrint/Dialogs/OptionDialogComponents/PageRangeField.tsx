import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Checkbox, createStyles, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, Table, TableBody, TableCell, TableCellProps, TableContainer, TableRow, TextField, Theme, Typography, useTheme } from '@material-ui/core';
import GridaToolTip from '../../../../styles/GridaToolTip';
import { ITipType } from './RadioField';
import { printOptionTip } from './ToolTips';



interface Props extends TableCellProps {
  handleChange, color, name, children, showHelp, tip?: ITipType,
  range: number[],
  max: number,
}

function PageRangeSub(props: Props) {
  const { handleChange, color, range, name, max, children, tip, showHelp, ...rest } = props;

  const [rangeStr, setRangeStr] = useState(convertArrayToString(range));
  const [checked, setChecked] = useState(false);

  useEffect(() => {

  });

  const onChange = (event) => {
    const result = hasOnlyRangeCharacters(event.target.value);
    if (event.target.value === '' || result) {
      // const str = autoFixNumber(event.target.value, max);
      // event.target.value = str;
      setRangeStr(event.target.value);

      setChecked(true);
      console.log(event.target.value);
    }
  }

  const onFocusOut = (event) => {
    const str = normalizeRange(event.target.value, max);
    event.target.value = str;
    setRangeStr(event.target.value);
    console.log(event.target.value);

    setChecked(true);
    handleChange(event);
  }


  return (
    <Box display="flex" alignItems="center" justifyContent="left" >
      <Grid sm={5} alignContent={"flex-start"}>
        <Checkbox style={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 6 }}
          disabled
          checked={checked}
          onChange={handleChange}
          color={color}
          name={name}
        />

        {children}
      </Grid>
      <Grid sm={7} alignContent={"flex-end"}>
        <TextField style={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 6, margin: 0 }}
          onChange={onChange}
          margin="none"
          variant="outlined"
          color={color}
          name={name}
          id={name} size="small"
          InputLabelProps={{
            shrink: true,
          }}
          onBlur={onFocusOut}
          label='ex) 빈칸=전체, "1, 2, 4", "1-3, 5"'
          value={rangeStr}
          fullWidth={true}
        />
      </Grid>
    </Box>
  )
}
export function PageRangeField(props: Props) {

  const { handleChange, color, range, name, max, children, tip, showHelp, ...rest } = props;
  const [rangeStr, setRangeStr] = useState(convertArrayToString(range));
  useEffect(() => {

  });
  let autoTip = tip;
  // const upper = value.toUpperCase();
  if (autoTip === undefined) {
    autoTip = printOptionTip[name];
  }

  console.log("text filed rendered");
  return (
    <div>
      {/* <FormControlLabel style={cellRadioStyle} value={1} control={<Radio />} label="Ncode A4에 인쇄" /> */}
      <GridaToolTip open={showHelp} placement="left" tip={autoTip} title={undefined}> 
        <Typography variant="subtitle1" component="h5">
          <PageRangeSub  {...props} />
        </Typography>
      </GridaToolTip>
    </div>
  );
}






export const convertStringToArray = (str: string) => {
  const trimed = str.replace(" ", "");
  const arr = trimed.split(',').flatMap(s => {
    if (!s.includes("-"))
      return parseInt(s);
    const words = s.split(/\s*-\s*/g);
    const min = parseInt(words[0]);
    const max = parseInt(words[1]);
    return Array.from({ length: max - min + 1 }, (_, n) => n + min);
  });

  return arr;
}

const convertArrayToString = (nums: number[]) => {
  const arr = [...nums];
  arr.sort((a, b) => (a - b));

  let prev = arr[0];
  let begin = arr[0];
  let last = arr[0];

  const rangeStr = (bbb: number, eee: number) => eee !== bbb ? `${bbb}-${eee}` : `${bbb}`;

  const ret: string[] = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== prev + 1) {
      const str = rangeStr(begin, prev);
      ret.push(str);
      last = begin;

      begin = arr[i];
      prev = begin;
    }
    prev = arr[i];
  }
  if (arr.length === 1 || last !== arr[arr.length - 1]) {
    const str = rangeStr(begin, arr[arr.length - 1]);
    ret.push(str);
  }

  return ret.join(", ");
};

function normalizeRange(str: string, numPages: number) {
  const trimed = str;
  if (trimed.length === 0) return `1-${numPages}`;

  let arr = trimed.split(/[\s,]+/).flatMap(s => {
    if (!s.includes("-")) {
      let r = parseInt(s);
      if (!r) return [];
      if (r < 1 || r > numPages) return [];

      return [r];
    }

    const words = s.split(/\s*-\s*/g);
    let min = parseInt(words[0]);
    let max = parseInt(words[1]);

    if (isNaN(min)) min = 1;
    if (isNaN(max)) max = numPages;

    min = Math.min(Math.max(1, min), numPages);
    max = Math.min(Math.max(1, max), numPages);

    return Array.from({ length: max - min + 1 }, (_, n) => n + min);
  });
  arr = Array.from(new Set(arr));

  const ret = convertArrayToString(arr);
  return ret;
}

function autoFixNumber(str: string, numPages: number) {
  let retStr = "";
  let numStr = "";

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char >= "0" && char <= "9") {
      numStr = numStr.concat(char);
    }
    else {
      if (numStr.length !== 0) {
        let num = parseInt(numStr);
        if (num < 1) num = 1;
        if (num > numPages) num = numPages;
        retStr = retStr.concat(num.toString());
      }
      numStr = "";
      retStr = retStr.concat(char);
    }
  }

  if (numStr.length !== 0) {
    let num = parseInt(numStr);
    if (num < 1) num = 1;
    if (num > numPages) num = numPages;
    retStr = retStr.concat(num.toString());
  }


  return retStr;
}


function hasOnlyRangeCharacters(str: string) {
  const rangeChars = "0123456789-, ";
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (rangeChars.indexOf(char) < 0) return false;
  }

  return true;
}
