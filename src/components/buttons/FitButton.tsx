import React from "react";
import '../../styles/buttons.css';
import { Button, Popover } from '@material-ui/core';
import GridaToolTip from "../../styles/GridaToolTip";
import { setViewFit } from '../../store/reducers/viewFitReducer';
import { ZoomFitEnum } from "../../nl-lib/common/enums";
import { useSelector } from "react-redux";
import { RootState } from "../../store/rootReducer";
import $ from "jquery";

const dropdownStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "8px",
  position: "relative",
  width: "240px",
  height: "176px",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
  borderRadius: "12px",
} as React.CSSProperties;

export default function FitButton() {

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (viewFit: ZoomFitEnum) => {
    setAnchorEl(null);
    setViewFit(viewFit);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const zoom = useSelector((state: RootState) => state.zoomReducer.zoom);
  const zoomPercent = Math.round(zoom * 100);

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

    return (
      <React.Fragment>
        <Button type="button" id="btn_fit" onClick={handleClick} aria-describedby={id}>
          <GridaToolTip open={true} placement="left" tip={{
              head: "Fit",
              msg: "용지의 크기를 맞추는 여러 옵션 중 하나를 선택합니다.",
              tail: "Z 폭 맞춤, X 높이 맞춤, C 전체 페이지, V 100%"
            }} title={undefined}>
            <span id="zoom-ratio">{zoomPercent}%</span>
          </GridaToolTip>
        </Button>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <div style={dropdownStyle}>
            <Button id="customer" className="help_drop_down" style={{
              width: "224px", height: "40px", padding: "4px 12px"
            }}>
              <span style={{width: "200px", height: "16px", marginLeft: "-80px"}}>
                화면 확대 [Ctrl+(+)]
              </span>
            </Button>
            <Button id="shortcut" className="help_drop_down" style={{
              width: "224px", height: "40px", padding: "4px 12px"
            }}>
              <span style={{width: "200px", height: "16px", marginLeft: "-80px"}}>
                화면 축소 [Ctrl+(-)]
              </span>
            </Button>
            <Button id="tutorial" className="help_drop_down" style={{
              width: "224px", height: "40px", padding: "4px 12px"
            }} onClick={() => handleClose(ZoomFitEnum.HEIGHT)}>
              <span style={{width: "200px", height: "16px", marginLeft: "-80px"}}>
                페이지 높이 맞춤 [H]
              </span>
            </Button>
            <Button id="faq" className="help_drop_down" style={{
              width: "224px", height: "40px", padding: "4px 12px"
            }} onClick={() => handleClose(ZoomFitEnum.WIDTH)}>
              <span style={{width: "200px", height: "16px", marginLeft: "-80px"}}>
                페이지 너비 맞춤 [W]
              </span>
            </Button>
          </div>
        </Popover>
      </React.Fragment>
    );
}