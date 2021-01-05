import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, useTheme } from '@material-ui/core';
import { ILeveledDialogProps } from './OptionLevel_0';


const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  scrollPaper: {
    alignItems: 'baseline'  // default center
  }
});

const OptionLevel_debug = (props: ILeveledDialogProps) => {
  const { optionLevel } = props;

  const theme = useTheme();
  const classes = useStyles();


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

  return (
    <React.Fragment>
      <Box component="div" className={classes.root}>
        <Box fontSize={16} fontWeight="fontWeightRegular" >Level 2 Options </Box>
      </Box>

      <Box component="div" className={classes.root} style={{ display: "flex", justifyContent: "center" }}>
        <Box borderColor={theme.palette.primary.main} border={1}>
          Level 2 Options
            </Box>
      </Box>
    </React.Fragment>
  );
}


export default OptionLevel_debug;