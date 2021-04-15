import React from 'react';
import { useSelector } from "react-redux";
import { RootState } from "GridaBoard/store/rootReducer";
import { makeStyles, Theme, Tooltip, TooltipProps, Typography, withStyles } from "@material-ui/core";
// import { ITipType } from './RadioField';


export type ITipType = { head: string, msg: string, tail: string };

const tooltipStyle = props => makeStyles(theme=>({
  tooltip: {
    backgroundColor: theme.custom.icon.blue[4],
    color: theme.palette.text.hint,
    maxWidth: 240,
    fontSize: theme.typography.pxToRem(12),
    border: `1px solid ${theme.custom.icon.blue[2]}`, 
  },
  popper: {
    zoom: 1 / props.brZoom
  }
}));

interface Props extends TooltipProps {
  open?: boolean,
  tip?: ITipType,

  title: NonNullable<React.ReactNode>;
}

export default function NeoToolTip(props: Props) {
  const { children, tip, open, title, ...rest } = props;
  const { title: titleDefault } = props;
  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);

  let show = open;

  if (titleDefault !== undefined) {
    console.log(`title default show=${title}`);
  }

  let head = "", msg = "", tail = "";
  if (tip) {
    head = tip.head;
    msg = tip.msg;
    tail = tip.tail;
  }
  else if (!title) { show = false; }

  const renderTitle = (title, tip) => {
    if (tip) {
      return (
        <React.Fragment>
          <Typography color="primary"><b> {head}</b></Typography>
          {msg}
          <br />
          <br />
          <b>{tail}</b>
        </React.Fragment>
      );
    }
    else {
      return (
        <React.Fragment>
          {title}
        </React.Fragment>
      );
    }
  }
  const tooltipClass = tooltipStyle({brZoom:brZoom})();

  if (show) {
    return (
      <Tooltip classes={tooltipClass}
        placement="left" title={renderTitle(title, tip)}>
        {children}
      </Tooltip>
    );
  }

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}
