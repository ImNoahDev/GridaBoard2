import React from 'react';
import { Theme, Tooltip, Typography, withStyles } from "@material-ui/core";

const GridaToolTipPopup = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 240,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

export default function GridaToolTip(props) {
  const { children, tip, open, ...rest } = props;
  let show = open;

  let title = "", msg = "", tail = "";
  if (tip) {
    title = tip.title;
    msg = tip.msg;
    tail = tip.tail;
  }
  else { show = false; }


  if (show) {
    return (
      <GridaToolTipPopup
        placement="left" title={
          <React.Fragment>
            <Typography color="primary"><b> {title}</b></Typography>
            <br />
            {msg}
            <br />
            <br />
            <b>{tail}</b>
          </React.Fragment>
        }>
        {children}

      </GridaToolTipPopup>
    );
  }

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}
