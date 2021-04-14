import React from "react";
import { makeStyles, Tooltip, TooltipProps, Theme } from '@material-ui/core';
import { useSelector } from "react-redux";
import { RootState } from "../store/rootReducer";


const useStyle = props => makeStyles((theme: Theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: "11px"
  },
  popper : {
    zoom : 1 / props.brZoom
  }
}));


const SimpleTooltip = function(props: TooltipProps) {
  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);
  const classes = useStyle({brZoom:brZoom})();

  return <Tooltip arrow classes={classes} {...props} />;
}

export default SimpleTooltip;