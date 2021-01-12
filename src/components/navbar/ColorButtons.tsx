import React, { useEffect } from 'react';
import '../../styles/main.css';
import GridaToolTip from '../../styles/GridaToolTip';
import PenManager, { DEFAULT_PEN_COLOR_NUM } from '../../nl-lib/neosmartpen/PenManager';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';

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

const groupStyle = {
  padding: "0px",
  margin: "0px",
  border: "0px",
  minWidth: "24px"
}

const ColorButtons = () => {

  useEffect(() => {
    manager.toggleColorRadioButton(DEFAULT_PEN_COLOR_NUM);
  });

  return (
    // <div className="color_bar neo_shadow float-left bottom_text color_bar">
    <React.Fragment>
      <div className="btn-group">
        <Button id="clr_1" type="button" className="color_btn" style={groupStyle}
          onClick={() => manager.setColor(1)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [RED]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 1로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_1">
            </div>
          </GridaToolTip>
        </Button>

        <Button id="clr_2" type="button" className="color_btn" style={groupStyle}
          onClick={() => manager.setColor(2)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [YELLOW]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 2로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_2">
            </div>
          </GridaToolTip>
        </Button>
        <Button id="clr_3" type="button" className="color_btn" style={groupStyle}
          onClick={() => manager.setColor(3)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [NAVY]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 3로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_3">
            </div>
          </GridaToolTip>
        </Button>
        <Button id="clr_4" type="button" className="color_btn" style={groupStyle}
          onClick={() => manager.setColor(4)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [BLACK]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 4로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_4">
            </div>
          </GridaToolTip>
        </Button>
        <Button id="clr_5" type="button" className="color_btn" style={groupStyle}
          onClick={() => manager.setColor(5)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [LIGHT_GRAY]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 5로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_5">
            </div>
          </GridaToolTip>
        </Button>
        <Button id="clr_6" type="button" className="color_btn" style={groupStyle}
          onClick={() => manager.setColor(6)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [ORANGE]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 6로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_6">
            </div>
          </GridaToolTip>
        </Button>
        <Button id="clr_7" type="button" className="color_btn" style={groupStyle}
          onClick={() => manager.setColor(7)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [GREEN]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 7로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_7">
            </div>
          </GridaToolTip>
        </Button>
        <Button id="clr_8" type="button" className="color_btn" style={groupStyle}
          onClick={() => manager.setColor(8)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [BLUE]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 8로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_8">
            </div>
          </GridaToolTip>
        </Button>
        <Button id="clr_9" type="button" className="color_btn" style={groupStyle}
          onClick={() => manager.setColor(9)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [PURPLE]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 9로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_9">
            </div>
          </GridaToolTip>
        </Button>
        <Button id="clr_0" type="button" className="color_btn" style={groupStyle}
          onClick={() => manager.setColor(0)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [DARK_GRAY]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 0로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_0">
            </div>
          </GridaToolTip>
        </Button>
      </div>
      {/* </div> */}
    </React.Fragment>
  );
}
export default ColorButtons;