import React from "react";
import '../../styles/buttons.css';
import { Button } from '@material-ui/core';
import GridaToolTip from "../../styles/GridaToolTip";
import { setViewFit } from '../../store/reducers/viewFitReducer';
import { PageZoomEnum, ZoomFitEnum } from "../../../nl-lib/common/enums";
import { useSelector } from "react-redux";
import { RootState } from "../../store/rootReducer";
import { setZoomStore } from '../../store/reducers/zoomReducer';

import $ from "jquery";

const dropdownStyle = {
  display: "none",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "8px",
  position: "fixed",
  width: "240px",
  height: "176px",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
  borderRadius: "12px",
  zIndex: 10000,
  marginRight: "20px",
  marginTop: "210px"
} as React.CSSProperties;

export default function FitButton() {

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClose = (viewFit: ZoomFitEnum) => {
    setAnchorEl(null);
    setViewFit(viewFit);
  };

  const zoom = useSelector((state: RootState) => state.zoomReducer.zoom);
  const zoomPercent = Math.round(zoom * 100);

  const setZoomByButton = (zoomEnum: PageZoomEnum) => {
    setAnchorEl(null);
    setViewFit(ZoomFitEnum.FREE);
    
    let newZoom;
    switch (zoomEnum) {
      case PageZoomEnum.ZOOM_UP: {
        const delta = -100;
        newZoom = zoom * 0.9985 ** delta
        break;
      }
      case PageZoomEnum.ZOOM_DOWN: {
        const delta = 100;
        newZoom = zoom * 0.9985 ** delta
        break;
      }
      default: break;
    }

    setZoomStore(newZoom);
  };

  $('#btn_fit').hover(function() {
    $(this).css("color", "rgba(104,143,255,1)")
  },function() {
    $(this).css("color", "rgba(18,18,18,1)")
  });

  $(document).ready(function(){
    $('.help_drop_down').hover(
      function(event){
        $(this).addClass('hover');
        $(this).css("color", "rgba(104,143,255,1)");
        $(this).css("background", "rgba(232,236,245,1)");
      },
      function(){
        $(this).removeClass('hover');
        $(this).css("color", "rgba(18,18,18,1)");
        $(this).css("background", "rgba(255,255,255,0.9)");
      }
    );
  });

  function handleClickFit() {
    const fit = document.getElementById("fitDrop");
    if (fit.style.display == 'none') {
      fit.style.display = 'block'
    } else {
      fit.style.display = 'none'
    }
  }

  return (
    <React.Fragment>
      <div>
        <Button type="button" id="btn_fit" className="fitDropDown" onClick={handleClickFit}>
          {/* <GridaToolTip open={true} placement="left" tip={{
              head: "Fit",
              msg: "용지의 크기를 맞추는 여러 옵션 중 하나를 선택합니다.",
              tail: "Z 폭 맞춤, X 높이 맞춤, C 전체 페이지, V 100%"
            }} title={undefined}> */}
            <span id="zoom-ratio" className="fitDropDown">{zoomPercent}%</span>
          {/* </GridaToolTip> */}
        </Button>
      </div>

      <div id="fitDrop" className="fit_btn" style={dropdownStyle}>
          <Button id="customer" className="help_drop_down" style={{
            width: "224px", height: "40px", padding: "4px 12px"
          }} onClick={() => setZoomByButton(PageZoomEnum.ZOOM_UP)}>
            <span style={{width: "200px", height: "16px", marginLeft: "-128px"}}>
              화면 확대
            </span>
          </Button>
          <Button id="shortcut" className="help_drop_down" style={{
            width: "224px", height: "40px", padding: "4px 12px"
          }} onClick={() => setZoomByButton(PageZoomEnum.ZOOM_DOWN)}>
            <span style={{width: "200px", height: "16px", marginLeft: "-128px"}}>
              화면 축소
            </span>
          </Button>
          <Button id="tutorial" className="help_drop_down" style={{
            width: "224px", height: "40px", padding: "4px 12px"
          }} onClick={() => handleClose(ZoomFitEnum.HEIGHT)}>
            <span style={{width: "200px", height: "16px", marginLeft: "-80px"}}>
              페이지 높이 맞춤
            </span>
          </Button>
          <Button id="faq" className="help_drop_down" style={{
            width: "224px", height: "40px", padding: "4px 12px"
          }} onClick={() => handleClose(ZoomFitEnum.WIDTH)}>
            <span style={{width: "200px", height: "16px", marginLeft: "-80px"}}>
              페이지 너비 맞춤
            </span>
          </Button>
        </div>
    </React.Fragment>
  );
}