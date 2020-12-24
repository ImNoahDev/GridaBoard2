import React from 'react';
import { Theme, Tooltip, TooltipProps, Typography, withStyles } from "@material-ui/core";
import { ITipType } from '../NcodePrintLib/NcodePrint/Dialogs/OptionDialogComponents/RadioField';

const GridaToolTipPopup = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 240,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

interface Props extends TooltipProps {
  open?: boolean,
  tip?: ITipType,

  title: NonNullable<React.ReactNode>;
}

export default function GridaToolTip(props: Props) {
  const { children, tip, open, title, ...rest } = props;
  let { title: titleDefault } = props;

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
          <br />
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


  if (show) {
    return (
      <GridaToolTipPopup
        placement="left" title={renderTitle(title, tip)}>
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
