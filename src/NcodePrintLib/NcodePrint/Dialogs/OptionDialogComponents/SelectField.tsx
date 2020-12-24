import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Checkbox, createStyles, FormControl, FormControlLabel, FormLabel, Grid, InputBase, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, Table, TableBody, TableCell, TableCellProps, TableContainer, TableRow, TextField, Theme, Typography, useTheme, withStyles } from '@material-ui/core';
import GridaToolTip from '../../../../styles/GridaToolTip';
import { ITipType } from './RadioField';
import { printOptionTip } from './ToolTips';
import ArrowRightSharpIcon from '@material-ui/icons/ArrowRightSharp';

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
    border: '0px solid #ced4da',
    fontSize: 16,
    padding: '0px 0px 0px 10px',
    magrin: '0px 0px 0px 0px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    width: "50px",
    // Use the system font instead of the default Roboto font.

    '&:focus': {
      borderRadius: 4,
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
  value,
  candidates,
}

function SelectFieldSub(props: Props) {
  const classes = useStyles();
  const { handleChange, color, name, children, tip, value, showHelp, candidates, ...rest } = props;
  const [checked, setChecked] = useState(false);
  

  const onFocusOut = (event) => {
    console.log(event.target.value);
    setChecked(true);

    handleChange(event);
  }

  const onChange = (event) => {
    setChecked(true);
    handleChange(event);
  }


  return (
    <Box display="flex" alignItems="center" justifyContent="left" >
      <Checkbox style={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 6 }}
        disabled
        checked={checked}
        onChange={handleChange}
        color={color}
        name={name}
      />


      {children}
      <FormControl className={classes.margin}>
        {/* <InputLabel id="demo-customized-select-label">Age</InputLabel> */}
        <Select style={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 6, margin: 0 }}
          onChange={onChange}
          variant="outlined"
          color={color}
          name={name}
          id={name}
          value={value}
          input={<BootstrapInput />}
          onBlur={onFocusOut}
          label='ex) 빈칸=전체, "1, 2, 4", "1-3, 5"'
          fullWidth={true}
        >
          {candidates.map((value, index) => (<MenuItem key={index} value={value}>{value}</MenuItem>))}

        </Select>
      </FormControl>

    </Box >
  )
}
export function SelectField(props: Props) {

  const { handleChange, color, name, children, tip, showHelp, ...rest } = props;

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
          <SelectFieldSub  {...props} />
        </Typography>
      </GridaToolTip>
    </div>
  );
}



