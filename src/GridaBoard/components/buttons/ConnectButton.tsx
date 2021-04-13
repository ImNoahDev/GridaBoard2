/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core';

import PenManager from 'nl-lib/neosmartpen/PenManager';
import { PenEventName } from 'nl-lib/common/enums';
import { INeoSmartpen } from 'nl-lib/common/neopen';

import { RootState } from 'GridaBoard/store/rootReducer';

type Props = {
  onPenLinkChanged: (e) => void;
  className?:string
};

const ConnectButton = (props: Props) => {
  const [numPens, setNumPens] = useState(0);
  const numPens_store = useSelector((state: RootState) => state.appConfig.num_pens);

  const useStyle = makeStyles(theme=>({
    penStyle : {
      position: "absolute",
      transform: "translate(10px, -10px)",
      width: "16px",
      height: "16px",
      background: theme.palette.grey[400],
      borderRadius: "50px",
      "& > span":{
        position: "absolute",
        left: "0px",
        top: "0px",
        transform: "translate(4px, 1px)",
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: "normal",
        fontSize: "8px",
        lineHeight: "13px",
        color: theme.palette.grey[50],
      }
    }
    
  }));

  const useStyles = makeStyles({
    connectBtn: {
      width: '92px',
      height: '30px',
      margin: '0px 16px',
      padding: '8px',
      borderRadius: '4px',
    },
    connectedBtn: {
      width: '84px',
      height: '30px',
      margin: '0px 16px',
      padding: '8px',
      borderRadius: '4px',
    },
    btnText: {
      fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '12px',
      lineHeight: '14px',

      display: 'flex',
      alignItems: 'center',
      textAlign: 'center',
      letterSpacing: '0.25px',
    },
  });

  useEffect(() => {
    setNumPens(numPens_store);
  }, [numPens_store]);

  const onPenLinkChanged = e => {
    props.onPenLinkChanged(e);
  };

  const handleConnectPen = () => {
    const penManager = PenManager.getInstance();
    const new_pen: INeoSmartpen = penManager.createPen();

    if (new_pen.connect()) {
      new_pen.addEventListener(PenEventName.ON_CONNECTED, onPenLinkChanged);
      new_pen.addEventListener(PenEventName.ON_DISCONNECTED, onPenLinkChanged);
    }
  };

  const classes = useStyles();

  return (
    <React.Fragment>
      {numPens < 1 ? (
        <Button className={classes.connectBtn} variant="contained" color="primary" onClick={() => handleConnectPen()}>
          <span className={classes.btnText}>+ 펜 연결하기</span>
        </Button>
      ) : (
        <Button className={classes.connectedBtn} variant="contained" color="primary" onClick={() => handleConnectPen()}>
          <span className={classes.btnText}>연결된 펜 ({numPens})</span>
        </Button>
      )}
    </React.Fragment>
  );
};

export default ConnectButton;
