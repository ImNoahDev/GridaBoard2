import React, { useEffect, useState } from "react";
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { render } from "react-dom";
import { deflate } from 'node:zlib';
import { useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
    position : "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000
  },
  background : {
    position : "absolute",
    width: "100%",
    height: "100%",
    background: "gray",
    opacity: 0.5
  },
  hidden : {
    visibility : "hidden"
  }
}));


const LoadingCircle = () => { 
  const isVisible = useSelector((state: RootState) => state.loadingCircle.visible);
  const classes = useStyles();
  
  return (<div className={`${classes.root} ${isVisible?"": classes.hidden}`}>
      <div className={classes.background}></div>
      <CircularProgress />
    </div>);
  
}

// const LoadingCircle = styled(Loading)({
//   position : "absolute",
//   backgroundColor : "red"
// });

export default LoadingCircle;