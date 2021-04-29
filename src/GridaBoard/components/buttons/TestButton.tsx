/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Button, makeStyles } from '@material-ui/core';

import PenManager from 'nl-lib/neosmartpen/PenManager';
import { PenEventName } from 'nl-lib/common/enums';
import { INeoSmartpen } from 'nl-lib/common/neopen';

import { RootState } from 'GridaBoard/store/rootReducer';
import getText from 'GridaBoard/language/language';


const TestButton = (props) => {
  const useStyles = makeStyles(theme => ({
    connectBtn: {
      padding: "0px",
      borderRadius: '4px',
      "&>span" : {
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '12px',
        lineHeight: '14px',
        padding: "8px",
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        letterSpacing: '0.25px',
      }
    },
  }));

  const classes = useStyles();

  return (
    <React.Fragment>
        <Button 
        {...props}
        className={classes.connectBtn} variant="contained" color="primary"
        >
          WhiteBoard Test
        </Button>
    </React.Fragment>
  );
};

export default TestButton;
