import React from 'react';
import '../../styles/main.css';
import GridaToolTip from '../../styles/GridaToolTip';
import PenManager from '../../nl-lib/common/neopen/PenManager';

const manager: PenManager = PenManager.getInstance();

const ColorButtons = () => {

  return (
    // <div className="color_bar neo_shadow float-left bottom_text color_bar">
    <React.Fragment>
      <div className="btn-group">
        <button id="clr_1" type="button" className="btn btn-neo color_btn othercolors"
          onClick={() => manager.setColor(1)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [RED]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 1로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_1">
            </div>
          </GridaToolTip>
        </button>

        <button id="clr_2" type="button" className="btn btn-neo color_btn"
          onClick={() => manager.setColor(2)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [YELLOW]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 2로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_2">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_3" type="button" className="btn btn-neo color_btn othercolors"
          onClick={() => manager.setColor(3)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [NAVY]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 3로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_3">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_4" type="button" className="btn btn-neo color_btn othercolors"
          onClick={() => manager.setColor(4)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [BLACK]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 4로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_4">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_5" type="button" className="btn btn-neo  color_btn othercolors"
          onClick={() => manager.setColor(5)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [LIGHT_GRAY]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 5로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_5">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_6" type="button" className="btn btn-neo  color_btn othercolors"
          onClick={() => manager.setColor(6)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [ORANGE]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 6로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_6">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_7" type="button" className="btn btn-neo  color_btn othercolors"
          onClick={() => manager.setColor(7)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [GREEN]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 7로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_7">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_8" type="button" className="btn btn-neo  color_btn othercolors"
          onClick={() => manager.setColor(8)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [BLUE]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 8로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_8">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_9" type="button" className="btn btn-neo  color_btn othercolors"
          onClick={() => manager.setColor(9)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [PURPLE]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 9로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_9">
            </div>
          </GridaToolTip>
        </button>
        <button id="clr_0" type="button" className="btn btn-neo color_btn othercolors"
          onClick={() => manager.setColor(0)}>
          <GridaToolTip open={true} placement="top" tip={{
              head: "Pen Color [DARK_GRAY]",
              msg: "표시되는 펜의 색상을 선택합니다",
              tail: "키보드 버튼 0로 선택 가능합니다"
            }} title={undefined}>
            <div className="color_icon color_0">
            </div>
          </GridaToolTip>
        </button>
      </div>
      {/* </div> */}
    </React.Fragment>
  );
}
export default ColorButtons;