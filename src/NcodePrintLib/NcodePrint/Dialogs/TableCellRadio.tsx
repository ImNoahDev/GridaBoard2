import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Checkbox, createStyles, FormControl, FormControlLabel, FormLabel, Grid, Paper, Radio, RadioGroup, Table, TableBody, TableCell, TableCellProps, TableContainer, TableRow, Theme, Typography, useTheme } from '@material-ui/core';
import { IPrintOption } from '../..';
import GridaToolTip from '../../../styles/GridaToolTip';
import { MappingStorage } from '../../SurfaceMapper';
import { makeNPageIdStr } from '../../UtilFunc';
import { cellRadioStyle } from './OptionLevel_1';


interface ICellRadio extends TableCellProps {
  checked, handleChange, color, name, children, showHelp, toolTip?: { title: string, msg: string, footer: string, }
}
export function TableCellRadio(props: ICellRadio) {

  const { checked, handleChange, color, name, children, toolTip, showHelp, ...rest } = props;
  // const upper = value.toUpperCase();

  return (
    <TableCell {...rest} style={cellRadioStyle}>
      {/* <FormControlLabel style={cellRadioStyle} value={1} control={<Radio />} label="Ncode A4에 인쇄" /> */}
      <GridaToolTip placement="left" title={
        <React.Fragment>
          <Typography color="inherit">Background</Typography>
          <br />
          {"화면의 배경색을 선택합니다."}
          <br />
          <b>{"키보드 버튼 1로 선택 가능합니다"}</b>
        </React.Fragment>
      }>
        <Typography variant="subtitle1" component="h5">
          <Checkbox style={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 6 }}
            checked={checked}
            onChange={handleChange}
            color={color}
            name={name}
          />
          {children}
        </Typography>
      </GridaToolTip>
    </TableCell>);
}




// function TableCellRatioModule(props) {
//   const { selectedValue, value, handleChange, color, name, children, upper } = props;
//   return (
//     <Typography variant="subtitle1" component="h5">
//       <Radio style={{ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 6 }}
//         checked={selectedValue === value}
//         onChange={handleChange}
//         value={value}
//         color={color}
//         name={name}
//         inputProps={{ 'aria-label': upper }}
//       />
//       {children}
//     </Typography>
//   );
// }
// export function TableCellRadio(props: ICellRadio) {

//   const { selectedValue, value, handleChange, color, name, children, toolTip, ...rest } = props;
//   const upper = value.toUpperCase();

//   return (
//     <TableCell {...rest} style={cellRadioStyle}>
//       {/* <FormControlLabel style={cellRadioStyle} value={1} control={<Radio />} label="Ncode A4에 인쇄" /> */}

//       { toolTip ? (
//         <GridaToolTip placement="left" title={
//           <React.Fragment>
//             <Typography color="inherit">{toolTip.title}</Typography>
//             <br />
//             {toolTip.msg}
//             <br />
//             <b>{toolTip.footer}</b>
//           </React.Fragment>
//         }>
//           <TableCellRatioModule {...props} />
//         </GridaToolTip>)
//         : (<TableCellRatioModule {...props} />)}
//     </TableCell>);
// }
