import React from "react";
import '../../styles/buttons.css';
import ThemeManager from "../../styles/ThemeManager";
import GridaToolTip from "../../styles/GridaToolTip";
import Popover from "@material-ui/core/Popover";
import { Button } from "@material-ui/core";

const themeManager: ThemeManager = ThemeManager.getInstance();

const backgroundStyle = {
  // marginTop: "11px",
  float: "right"
} as React.CSSProperties;

export default function BackgroundButton() {

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const setBackground = (background) => {
    if(background === 1) {
      themeManager.setT1();
    } else if(background === 2) {
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

    return (
      // <div className="btn-group dropright" role="group">
      <React.Fragment>
        <Button type="button" id="btn_background" style={backgroundStyle} onClick={handleClick} aria-describedby={id}>
          <GridaToolTip open={true} placement="left" tip={{
              head: "Background",
              msg: "화면의 배경색을 선택합니다.",
              tail: "키보드 버튼 1로 선택 가능합니다"
            }} title={undefined}>
            <div className="c2">
              <img src="/icons/icon_background_n.png" className="normal-image"></img>
              <img src="/icons/icon_background_p.png" className="hover-image"></img>
            </div>
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