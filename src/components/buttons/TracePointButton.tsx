import React, { Component, useState } from "react";
import '../../styles/buttons.css';
import { connect, useSelector, useDispatch } from 'react-redux';
import { setPointerTracer } from '../../store/reducers/pointerTracer';
import $ from "jquery";
import { RootState } from '../../store/rootReducer';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { Theme, Typography, withStyles } from '@material-ui/core';

const TracePointTooltip = withStyles((theme: Theme) => ({
  tooltip: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 240,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
  },
}))(Tooltip);

const TracePointButton = () => {
  const isTrace = useSelector((state:RootState) => state.pointerTracer.isTrace)
  const dispatch = useDispatch();

  const setEnable = (elem_name: string, sw: boolean) => {
    const $elem = $(`#${elem_name}`);
    if (sw) {
        const $elem = $("#btn_tracepoint").find(".c2");
        $elem.addClass("checked");
    } else {
        const $elem = $("#btn_tracepoint").find(".c2");
        $elem.removeClass("checked");
    }
  }
  
  const onTogglePointerTracer = () => {
    dispatch(setPointerTracer(!isTrace));
    setEnable("btn_tracepoint", isTrace);
  }

    return (
      <button id="btn_tracepoint" type="button" className="btn btn-neo btn-neo-vertical"
      onClick = {() => onTogglePointerTracer()}>
        <TracePointTooltip placement="left" title={
          <React.Fragment>
              <Typography color="inherit">Trace Point</Typography>
              <em>{"펜의 위치를 화면에 보여주는 버튼입니다."}</em>
              <br></br>
              <b>{"단축키 Q로 선택가능합니다."}</b>
          </React.Fragment>
              }>
          <div className="c2 checked">
              <img src="../../icons/icon_point_d.png" className="toggle-off normal-image"></img>
              <img src="../../icons/icon_point_p.png" className="toggle-off hover-image"></img>
              <img src="../../icons/icon_point_n.png" className="toggle-on normal-image"></img>
              <img src="../../icons/icon_point_p.png" className="toggle-on hover-image"></img>
          </div>
        </TracePointTooltip>
      </button>
    );
}
export default TracePointButton;