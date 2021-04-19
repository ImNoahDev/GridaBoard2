import React, { useEffect, useState } from "react";
import {makeStyles, Badge} from "@material-ui/core";
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';

const useStyle = makeStyles(theme=>({
  badge : {
    background: theme.custom.icon.mono[1],
    color : theme.custom.icon.mono[4]
  }
}));

const CustomBadge = (props) => {
  const {children,anchorOrigin, ...rest} = props;
  const classes = useStyle();
  const badgeInVisible = !useSelector((state: RootState) => state.ui.shotcut.show);
  const defaultAnchor = {
    vertical: 'bottom',
    horizontal: 'right',
  };

  return (
  <Badge  {...rest}
    classes={{badge: classes.badge}}
    invisible={badgeInVisible}
    anchorOrigin={anchorOrigin? anchorOrigin: defaultAnchor}>
    {children}
  </Badge>)
}

export default CustomBadge;