import React, { useEffect } from 'react';
import '../../styles/main.css';
import GridaToolTip from '../../styles/GridaToolTip';
import PenManager, { DEFAULT_PEN_COLOR_NUM } from '../../nl-lib/neosmartpen/PenManager';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';
import { Popover } from '@material-ui/core';
import $ from "jquery";

const manager: PenManager = PenManager.getInstance();

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    display: 'inline-flex',
    // flexDirection: 'column',
    // alignItems: 'center',
    height: '36px',
    verticalAlign: 'middle',
    // '& > *': {
    //   margin: theme.spacing(1),
    // },
  },
}));

const colorStyle = {
  padding: "0px",
  margin: "0px",
  border: "0px",
  // minWidth: "24px",
  width: "18px",
  height: "18px",
  marginTop: "16px",
  // lineHeight: "36px",
  float: "left",
  marginLeft: "27px"
} as React.CSSProperties;

const colorDropDownStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "4px 8px",
  position: "relative",
  width: "488px",
  height: "48px",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
  borderRadius: "12px"
} as React.CSSProperties;

const groupStyle = {
  padding: "0px",
  // margin: "0px",
  border: "0px",
  marginLeft: "-16px",
  paddingLeft: "12px"
  // minWidth: "24px"
  // position: "static",
  // width: "24px",
  // height: "24px",
  // left: "8px",
  // top: "8px",
  // background: "rgba(229,229,229,1)"
} as React.CSSProperties;

const ColorButtons = () => {

  // useEffect(() => {
  //   const colorStr = manager.color;
  //   const colorNum = Number(manager.getColorNum(colorStr));
  //   const toggleColorNum = colorNum !== -1 ? colorNum : DEFAULT_PEN_COLOR_NUM;
  //   manager.toggleColorRadioButton(toggleColorNum);
  // });

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeColor = (color: number) => {
    if (color === 1) {
      $('.select_color').removeAttr('id');
      $('.select_color').attr('id', 'clr_1');
      $('#select_color').removeAttr('class');
      $('#select_color').attr('class', 'color_icon color_1');
    } else if (color === 2) {
      $('.select_color').removeAttr('id');
      $('.select_color').attr('id', 'clr_2');
      $('#select_color').removeAttr('class');
      $('#select_color').attr('class', 'color_icon color_2');
    } else if (color === 3) {
      $('.select_color').removeAttr('id');
      $('.select_color').attr('id', 'clr_3');
      $('#select_color').removeAttr('class');
      $('#select_color').attr('class', 'color_icon color_3');
    } else if (color === 4) {
      $('.select_color').removeAttr('id');
      $('.select_color').attr('id', 'clr_4');
      $('#select_color').removeAttr('class');
      $('#select_color').attr('class', 'color_icon color_4');
    } else if (color === 5) {
      $('.select_color').removeAttr('id');
      $('.select_color').attr('id', 'clr_5');
      $('#select_color').removeAttr('class');
      $('#select_color').attr('class', 'color_icon color_5');
    } else if (color === 6) {
      $('.select_color').removeAttr('id');
      $('.select_color').attr('id', 'clr_6');
      $('#select_color').removeAttr('class');
      $('#select_color').attr('class', 'color_icon color_6');
    } else if (color === 7) {
      $('.select_color').removeAttr('id');
      $('.select_color').attr('id', 'clr_7');
      $('#select_color').removeAttr('class');
      $('#select_color').attr('class', 'color_icon color_7');
    } else if (color === 8) {
      $('.select_color').removeAttr('id');
      $('.select_color').attr('id', 'clr_8');
      $('#select_color').removeAttr('class');
      $('#select_color').attr('class', 'color_icon color_8');
    } else if (color === 9) {
      $('.select_color').removeAttr('id');
      $('.select_color').attr('id', 'clr_9');
      $('#select_color').removeAttr('class');
      $('#select_color').attr('class', 'color_icon color_9');
    } else {
      $('.select_color').removeAttr('id');
      $('.select_color').attr('id', 'clr_0');
      $('#select_color').removeAttr('class');
      $('#select_color').attr('class', 'color_icon color_0');
    }
    manager.setColor(color);
    handleClose();
  }

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    // <div className="color_bar neo_shadow float-left bottom_text color_bar">
    <React.Fragment>
      <Button id="clr_3" type="button" className="color_btn select_color" style={colorStyle} onClick={handleClick} aria-describedby={id}>
        <div id="select_color" className="color_icon color_3">
        </div>
      </Button>
      <Popover
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
      </Popover>
      {/* </div> */}
    </React.Fragment>
  );
}
export default ColorButtons;