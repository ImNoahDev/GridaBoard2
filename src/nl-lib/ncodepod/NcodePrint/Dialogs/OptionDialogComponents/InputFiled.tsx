import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, FormControl,Grid, InputBase, InputLabel, TableCellProps, Typography, withStyles } from '@material-ui/core';
import { printOptionTip } from './ToolTips';

import NeoToolTip, { ITipType } from 'nl-lib/common/ui/NeoToolTip';


const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(0),
    },
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 15,
    padding: '6px 6px 4px 6px',
    width: "100%",
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.

    '&:focus': {
      borderRadius: 8,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
}))(InputBase);

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(0),
  },
}));



interface Props extends TableCellProps {
  handleChange, color, name, children, showHelp, tip?: ITipType,
  range: number[],
  max: number,
}

function PageRangeSub(props: Props) {
  const classes = useStyles();
  const { handleChange, color, range, name, max, children, tip, showHelp, ...rest } = props;

  const [rangeStr, setRangeStr] = useState(convertArrayToString(range));
  useEffect(() => {

  });

  const onChange = (event) => {
    const result = hasOnlyRangeCharacters(event.target.value);
    if (event.target.value === '' || result) {
      // const str = autoFixNumber(event.target.value, max);
      // event.target.value = str;
      setRangeStr(event.target.value);
      console.log(event.target.value);
    }
  }

  const onFocusOut = (event) => {
    const str = normalizeRange(event.target.value, max);
    event.target.value = str;
    setRangeStr(event.target.value);
    console.log(event.target.value);

    handleChange(event);
  }


  return (
    <Box display="flex" alignItems="center" justifyContent="left" >
      <Grid sm={5} alignContent={"flex-start"}>
        {children}
      </Grid>
      <Grid sm={7} alignContent={"flex-end"}>
        <FormControl className={classes.margin}>

          <InputLabel htmlFor="demo-customized-textbox">Age</InputLabel>
          <BootstrapInput
            onChange={onChange}
            margin="none"
            color={color}
            name={name}
            id={name}

            onBlur={onFocusOut}
            value={rangeStr}
            fullWidth={true}
          />
        </FormControl>
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
      <NeoToolTip open={showHelp} placement="left" tip={autoTip} title={undefined}>
        <Typography variant="subtitle1" component="h5">
          <PageRangeSub  {...props} />
        </Typography>
      </NeoToolTip>
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
