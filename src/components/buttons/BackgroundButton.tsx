import React from "react";
import '../../styles/buttons.css';
import ThemeManager from "../../styles/ThemeManager";
import GridaToolTip from "../../styles/GridaToolTip";
import Popover from "@material-ui/core/Popover";
import { Button } from "@material-ui/core";
import $ from "jquery";

const themeManager: ThemeManager = ThemeManager.getInstance();

const basicStyle = {
  marginTop: "8px",
  float: "right",
  display: "block"
} as React.CSSProperties;

const neoStyle = {
  marginTop: "8px",
  float: "right",
  display: "none"
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

    return (
      // <div className="btn-group dropright" role="group">
      <React.Fragment>
        <Button type="button" id="basic_background" style={basicStyle} onClick={handleClick} aria-describedby={id}>
          <GridaToolTip open={true} placement="left" tip={{
              head: "Background",
              msg: "화면의 배경색을 선택합니다.",
              tail: "키보드 버튼 1로 선택 가능합니다"
            }} title={undefined}>
            {/* <div className="c2"> */}
              {/* <img src="/icons/icon_background_n.png" className="normal-image"></img>
              <img src="/icons/icon_background_p.png" className="hover-image"></img> */}
              <div>
                Basic
              </div>
            {/* </div> */}
          </GridaToolTip>
        </Button>
        <Button type="button" id="neo_background" style={neoStyle} onClick={handleClick} aria-describedby={id}>
          <GridaToolTip open={true} placement="left" tip={{
              head: "Background",
              msg: "화면의 배경색을 선택합니다.",
              tail: "키보드 버튼 1로 선택 가능합니다"
            }} title={undefined}>
            {/* <div className="c2"> */}
              {/* <img src="/icons/icon_background_n.png" className="normal-image"></img>
              <img src="/icons/icon_background_p.png" className="hover-image"></img> */}
              <div>
                Neo-prism
              </div>
            {/* </div> */}
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

          <a id="btn_bg_gd" className="dropdown-item" href="#" onClick={() => setBackground(1)}>
            <div className="c2">
              <span className="bg-dropmenu">Basic</span>
            </div>
          </a>

          <a id="btn_bg_avan" className="dropdown-item" href="#" onClick={() => setBackground(2)}>
            <div className="c2">
              <span className="bg-dropmenu">Neo-prism</span>
            </div>
          </a>
        </Popover>
        <div className="dropdown-menu p-0 border border-0 " aria-labelledby="btn_background">
          {/* <a className="dropdown-item" href="#"> */}

          
          {/* </a> */}
        {/* </div> */}
      </div>
      </React.Fragment>
    );
}