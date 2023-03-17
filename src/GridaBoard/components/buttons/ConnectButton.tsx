/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Button, makeStyles } from '@material-ui/core';

import PenManager from 'nl-lib/neosmartpen/PenManager';
import { PenEventName } from 'nl-lib/common/enums';
import { INeoSmartpen } from 'nl-lib/common/neopen';

import { RootState } from 'GridaBoard/store/rootReducer';
import getText from 'GridaBoard/language/language';
import NDP from 'NDP-lib';
import { setPenListOpen } from '../../store/reducers/ui';

type Props = {
  onPenLinkChanged: (e) => void;
  className?:string
};

const ConnectButton = (props: Props) => {
  const [numPens, setNumPens] = useState(0);
  const numPens_store = useSelector((state: RootState) => state.appConfig.num_pens);
  const penListOpen = useSelector((state: RootState) => state.ui.simpleUiData.penListOpen);
  const penList = useSelector((state: RootState) => state.ndpClient.penList);
  const isPenControlOwner = useSelector((state: RootState) => state.ndpClient.isPenControlOwner);

  const bluetoothOn = useSelector((state: RootState) => state.ndpClient.bluetoothOn);
  const searchOn = useSelector((state: RootState) => state.ui.simpleUiData.penListSearchOn);
  

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

  useEffect(() => {
    setNumPens(numPens_store);
  }, [numPens_store]);

  const onPenLinkChanged = e => {
    props.onPenLinkChanged(e);
  };

  const handleConnectPen = async () => {
    // const penManager = PenManager.getInstance();
    // const new_pen: INeoSmartpen = penManager.createPen();

    // if (new_pen.connect()) {
    //   new_pen.addEventListener(PenEventName.ON_CONNECTED, onPenLinkChanged);
    //   new_pen.addEventListener(PenEventName.ON_DISCONNECTED, onPenLinkChanged);
    // }
    // if(!penListOpen){
    //   const getRes = await NDP.getInstance().Client.localClient.emitCmd("getPenList");
  
    //   if(getRes.result){
    //     const penList = getRes.data.penList;
    //     setPenList(penList);

    //     console.log(penList);
    //   }else{
    //     setPenList([]);
    //   }
    // }
    setPenListOpen(!penListOpen);
  };

  const classes = useStyles();

  return (
    <React.Fragment>
      {!searchOn || !bluetoothOn || !isPenControlOwner || penList.length < 1 ? (
        <Button className={classes.connectBtn} variant="outlined" color="primary" onClick={() => handleConnectPen()}>
          + {getText("pen_connect")}
        </Button>
      ) : (
        <Button className={classes.connectBtn} variant="contained" color="primary" onClick={() => handleConnectPen()}>
        {getText("pen_connect_count")} ({penList.length})
        </Button>
      )}
    </React.Fragment>
  );
};

export default ConnectButton;
