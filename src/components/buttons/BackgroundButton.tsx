import React from "react";
import '../../styles/buttons.css';
import ThemeManager from "../../styles/ThemeManager";
import GridaToolTip from "../../styles/GridaToolTip";
import Popover from "@material-ui/core/Popover";
import { Button } from "@material-ui/core";
import $ from "jquery";

const themeManager: ThemeManager = ThemeManager.getInstance();

const basicStyle = {
  display: "block"
} as React.CSSProperties;

const neoStyle = {
  display: "none"
} as React.CSSProperties;

const dropdownStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "8px",
  position: "relative",
  width: "140px",
  height: "100px",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
  borderRadius: "12px",
} as React.CSSProperties;

export default function BackgroundButton() {

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const setBackground = (background) => {
    if(background === 1) {
      $('#basic_background').css('display', 'block');
      $('#neo_background').css('display', 'none');
      themeManager.setT1();
    } else if(background === 2) {
      $('#basic_background').css('display', 'none');
      $('#neo_background').css('display', 'block');
      themeManager.setT2();
    } else if(background === 3) {
      themeManager.setT4();
    } else {
      themeManager.setT5();
    }
    handleClose();
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  $('#basic_background').hover(function() {
    $(this).css("color", "rgba(104,143,255,1)")
  },function() {
    $(this).css("color", "rgba(18,18,18,1)")
  });

  $('#neo_background').hover(function() {
    $(this).css("color", "rgba(104,143,255,1)")
  },function() {
    $(this).css("color", "rgba(18,18,18,1)")
  });

  $(document).ready(function(){
    $('.background_drop_down').hover(
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
      <Button type="button" id="basic_background" style={basicStyle} onClick={handleClick} aria-describedby={id}>
        <GridaToolTip open={true} placement="left" tip={{
            head: "Background",
            msg: "화면의 배경색을 선택합니다.",
            tail: "키보드 버튼 1로 선택 가능합니다"
          }} title={undefined}>
            <span>
              Basic
            </span>
        </GridaToolTip>
      </Button>
      <Button type="button" id="neo_background" style={neoStyle} onClick={handleClick} aria-describedby={id}>
        <GridaToolTip open={true} placement="left" tip={{
            head: "Background",
            msg: "화면의 배경색을 선택합니다.",
            tail: "키보드 버튼 1로 선택 가능합니다"
          }} title={undefined}>
            <span>
              Neo-prism
            </span>
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
          <div>
            <Button className="background_drop_down" onClick={() => setBackground(1)} style={{
              width: "120px", height: "40px", padding: "4px 12px"
            }}>
              <span className="bg-dropmenu" style={{marginLeft: "-58px"}}>Basic</span>
            </Button>
          </div>
          <div>
            <Button className="background_drop_down" onClick={() => setBackground(2)} style={{
              width: "120px", height: "40px", padding: "4px 12px"
            }}>
              <span className="bg-dropmenu" style={{marginLeft: "-20px"}}>Neo-prism</span>
            </Button>
          </div>
        </div>
      </Popover>
    </React.Fragment>
  );
}