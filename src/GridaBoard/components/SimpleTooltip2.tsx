import React from "react";
import { makeStyles, Tooltip, TooltipProps, Theme } from '@material-ui/core';
import { useSelector } from "react-redux";
import { RootState } from "../store/rootReducer";


const useStyle = () => makeStyles((theme: Theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: "11px",
  },
}));


const SimpleTooltip2 = function(props: TooltipProps) {
  const classes = useStyle()();

  return <Tooltip arrow placement="right" classes={classes} {...props} />;
}

export default SimpleTooltip2;