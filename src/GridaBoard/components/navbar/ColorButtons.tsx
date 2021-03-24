import React from 'react';
import '../../styles/main.css';
import GridaToolTip from '../../styles/GridaToolTip';
import PenManager from '../../../nl-lib/neosmartpen/PenManager';
import Button from '@material-ui/core/Button';
import { ButtonBase, Popover } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import $ from "jquery";

const manager: PenManager = PenManager.getInstance();

const colorStyle = {
  marginLeft: "24px",
} as React.CSSProperties;

const colorDropDownStyle = {
  display: "none",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "4px 4px",
  position: "absolute",
  width: "486px",
  height: "48px",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
  borderRadius: "12px",
  zIndex: 100,
  marginTop: "30px",
  marginLeft: "20px"
} as React.CSSProperties;

const groupStyle = {
  marginTop: "8px",
  marginLeft: "22px"
} as React.CSSProperties;

const ColorButtons = () => {

  // useEffect(() => {
  //   const colorStr = manager.color;
  //   const colorNum = Number(manager.getColorNum(colorStr));
  //   const toggleColorNum = colorNum !== -1 ? colorNum : DEFAULT_PEN_COLOR_NUM;
  //   manager.toggleColorRadioButton(toggleColorNum);
  // });

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeColor = (color: number) => {
    manager.setColor(color);
    handleClose();
  }

  function handleClickColor() {
    const color = document.getElementById("colorDrop");
    if (color.style.display == 'none') {
      color.style.display = 'block'
    } else {
      color.style.display = 'none'
    }
  }

  return (
    <React.Fragment>
      <div>
        <ButtonBase id="clr_3" type="button" className="color_btn select_color" style={colorStyle} onClick={handleClickColor}>
          <div id="select_color" className="color_icon color_3" style={{width: "18px", height: "18px"}}>
          </div>
        </ButtonBase>

        <div id="colorDrop" className="selected_color" style={colorDropDownStyle}>
          <ButtonBase id="clr_1" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(1)}>
            {/* <GridaToolTip open={true} placement="top" tip={{
                head: "RED",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 1로 선택 가능합니다"
              }} title={undefined}> */}
              <div className="color_icon color_1">
              </div>
            {/* </GridaToolTip> */}
          </ButtonBase>

          <ButtonBase id="clr_2" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(2)}>
            {/* <GridaToolTip open={true} placement="top" tip={{
                head: "YELLOW",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 2로 선택 가능합니다"
              }} title={undefined}> */}
              <div className="color_icon color_2">
              </div>
            {/* </GridaToolTip> */}
          </ButtonBase>
          <ButtonBase id="clr_3" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(3)}>
            {/* <GridaToolTip open={true} placement="top" tip={{
                head: "NAVY",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 3로 선택 가능합니다"
              }} title={undefined}> */}
              <div className="color_icon color_3">
              </div>
            {/* </GridaToolTip> */}
          </ButtonBase>
          <ButtonBase id="clr_4" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(4)}>
            {/* <GridaToolTip open={true} placement="top" tip={{
                head: "BLACK",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 4로 선택 가능합니다"
              }} title={undefined}> */}
              <div className="color_icon color_4">
              </div>
            {/* </GridaToolTip> */}
          </ButtonBase>
          <ButtonBase id="clr_5" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(5)}>
            {/* <GridaToolTip open={true} placement="top" tip={{
                head: "WHITE",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 5로 선택 가능합니다"
              }} title={undefined}> */}
              <div className="color_icon color_5">
              </div>
            {/* </GridaToolTip> */}
          </ButtonBase>
          <ButtonBase id="clr_6" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(6)}>
            {/* <GridaToolTip open={true} placement="top" tip={{
                head: "ORANGE",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 6로 선택 가능합니다"
              }} title={undefined}> */}
              <div className="color_icon color_6">
              </div>
            {/* </GridaToolTip> */}
          </ButtonBase>
          <ButtonBase id="clr_7" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(7)}>
            {/* <GridaToolTip open={true} placement="top" tip={{
                head: "GREEN",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 7로 선택 가능합니다"
              }} title={undefined}> */}
              <div className="color_icon color_7">
              </div>
            {/* </GridaToolTip> */}
          </ButtonBase>
          <ButtonBase id="clr_8" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(8)}>
            {/* <GridaToolTip open={true} placement="top" tip={{
                head: "BLUE",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 8로 선택 가능합니다"
              }} title={undefined}> */}
              <div className="color_icon color_8">
              </div>
            {/* </GridaToolTip> */}
          </ButtonBase>
          <ButtonBase id="clr_9" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(9)}>
            {/* <GridaToolTip open={true} placement="top" tip={{
                head: "PURPLE",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 9로 선택 가능합니다"
              }} title={undefined}> */}
              <div className="color_icon color_9">
              </div>
            {/* </GridaToolTip> */}
          </ButtonBase>
          <ButtonBase id="clr_0" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(0)}>
            {/* <GridaToolTip open={true} placement="top" tip={{
                head: "DARK GRAY",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 0로 선택 가능합니다"
              }} title={undefined}> */}
              <div className="color_icon color_0">
              </div>
            {/* </GridaToolTip> */}
          </ButtonBase>
        </div>
      </div>
      
      {/* <Popover
        style={{zoom: 1 / brZoom}}
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <div style={colorDropDownStyle}>
          <Button id="clr_1" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(1)}>
            <GridaToolTip open={true} placement="top" tip={{
                head: "RED",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 1로 선택 가능합니다"
              }} title={undefined}>
              <div className="color_icon color_1">
              </div>
            </GridaToolTip>
          </Button>

          <Button id="clr_2" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(2)}>
            <GridaToolTip open={true} placement="top" tip={{
                head: "YELLOW",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 2로 선택 가능합니다"
              }} title={undefined}>
              <div className="color_icon color_2">
              </div>
            </GridaToolTip>
          </Button>
          <Button id="clr_3" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(3)}>
            <GridaToolTip open={true} placement="top" tip={{
                head: "NAVY",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 3로 선택 가능합니다"
              }} title={undefined}>
              <div className="color_icon color_3">
              </div>
            </GridaToolTip>
          </Button>
          <Button id="clr_4" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(4)}>
            <GridaToolTip open={true} placement="top" tip={{
                head: "BLACK",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 4로 선택 가능합니다"
              }} title={undefined}>
              <div className="color_icon color_4">
              </div>
            </GridaToolTip>
          </Button>
          <Button id="clr_5" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(5)}>
            <GridaToolTip open={true} placement="top" tip={{
                head: "WHITE",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 5로 선택 가능합니다"
              }} title={undefined}>
              <div className="color_icon color_5">
              </div>
            </GridaToolTip>
          </Button>
          <Button id="clr_6" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(6)}>
            <GridaToolTip open={true} placement="top" tip={{
                head: "ORANGE",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 6로 선택 가능합니다"
              }} title={undefined}>
              <div className="color_icon color_6">
              </div>
            </GridaToolTip>
          </Button>
          <Button id="clr_7" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(7)}>
            <GridaToolTip open={true} placement="top" tip={{
                head: "GREEN",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 7로 선택 가능합니다"
              }} title={undefined}>
              <div className="color_icon color_7">
              </div>
            </GridaToolTip>
          </Button>
          <Button id="clr_8" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(8)}>
            <GridaToolTip open={true} placement="top" tip={{
                head: "BLUE",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 8로 선택 가능합니다"
              }} title={undefined}>
              <div className="color_icon color_8">
              </div>
            </GridaToolTip>
          </Button>
          <Button id="clr_9" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(9)}>
            <GridaToolTip open={true} placement="top" tip={{
                head: "PURPLE",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 9로 선택 가능합니다"
              }} title={undefined}>
              <div className="color_icon color_9">
              </div>
            </GridaToolTip>
          </Button>
          <Button id="clr_0" type="button" className="color_btn" style={groupStyle}
            onClick={() => changeColor(0)}>
            <GridaToolTip open={true} placement="top" tip={{
                head: "DARK GRAY",
                msg: "표시되는 펜의 색상을 선택합니다",
                tail: "키보드 버튼 0로 선택 가능합니다"
              }} title={undefined}>
              <div className="color_icon color_0">
              </div>
            </GridaToolTip>
          </Button>
        </div>
      </Popover> */}
    </React.Fragment>
  );
}
export default ColorButtons;