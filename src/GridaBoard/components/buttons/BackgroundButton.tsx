import React from "react";
import '../../styles/buttons.css';
import ThemeManager from "../../styles/ThemeManager";
import GridaToolTip from "../../styles/GridaToolTip";
import { Button } from "@material-ui/core";
import $ from "jquery";
import Icon from '@material-ui/core/Icon';

const themeManager: ThemeManager = ThemeManager.getInstance();

const basicStyle = {
  display: "block",
  marginRight: "20px"
} as React.CSSProperties;

const neoStyle = {
  display: "none",
  marginRight: "20px"
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

  const handleClose = () => {
    setAnchorEl(null);
  };

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

  function handleClickBackground() {
    const background = document.getElementById("backgroundDrop");
    if (background.style.display == 'none') {
      background.style.display = 'block'
    } else {
      background.style.display = 'none'
    }
  }

  const dropdownStyle = {
    display: "none",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "8px",
    position: "absolute",
    width: "140px",
    height: "100px",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
    borderRadius: "12px",
    zindex: 500,
    marginRight: "110px",
    marginTop: "140px"
  } as React.CSSProperties;

  return (
    <React.Fragment>
      <div>
        <Button variant="outlined" type="button" id="basic_background" className="backgroundDropDown" style={basicStyle} onClick={handleClickBackground}>
          {/* <GridaToolTip open={true} placement="left" tip={{
              head: "Background",
              msg: "화면의 배경색을 선택합니다.",
              tail: "키보드 버튼 1로 선택 가능합니다"
            }} title={undefined}> */}
              <span className="backgroundDropDown">
                Basic
              </span>
          {/* </GridaToolTip> */}
        </Button>
        <Button variant="outlined" type="button" id="neo_background" className="backgroundDropDown" style={neoStyle} onClick={handleClickBackground}>
          {/* <GridaToolTip open={true} placement="left" tip={{
              head: "Background",
              msg: "화면의 배경색을 선택합니다.",
              tail: "키보드 버튼 1로 선택 가능합니다"
            }} title={undefined}> */}
              <span className="backgroundDropDown">
                Neo-prism
              </span>
          {/* </GridaToolTip> */}
        </Button>   
      </div>

      <div id="backgroundDrop" className="backgroundDropDown" style={dropdownStyle}>
        <Button className="background_drop_down" onClick={() => setBackground(1)} style={{
          width: "120px", height: "40px", padding: "4px 12px", zIndex: 5000
        }}>
          <span className="bg-dropmenu" style={{marginLeft: "-58px"}}>Basic</span>
        </Button>
        <Button className="background_drop_down" onClick={() => setBackground(2)} style={{
          width: "120px", height: "40px", padding: "4px 12px", zIndex: 5000
        }}>
          <span className="bg-dropmenu" style={{marginLeft: "-20px"}}>Neo-prism</span>
        </Button>
      </div>  
    </React.Fragment> 
  );
}