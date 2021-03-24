import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/rootReducer";
import GridaToolTip from "../../styles/GridaToolTip";
import { Button } from "@material-ui/core";

export default function ZoomButton() {
  const zoom = useSelector((state: RootState) => state.zoomReducer.zoom);
  const zoomPercent = Math.round(zoom * 100);

  return (
    <Button variant="outlined" id="btn_zoom" type="button" className="btn btn-neo has-badge" data-container="body"
      data-toggle="popover" data-placement="left" data-trigger="focus" data-html="true"
      data-target="#my-popover-content" >
      <GridaToolTip open={true} placement="left" tip={{
          head: "Zoom",
          msg: "화면을 키우고 줄이는 버튼입니다.",
          tail: "단축키 Q로 선택가능합니다."
        }} title={undefined}>
        <div className="c2">
          <img src="/icons/icon_zoom_n.png" className="normal-image"></img>
          <img src="/icons/icon_zoom_p.png" className="hover-image"></img>
        </div>
      </GridaToolTip>
      <span id="zoom-ratio" className="zoom-badge badge badge-pill badge-info">${zoomPercent}%</span>
    </Button>
  );
}
