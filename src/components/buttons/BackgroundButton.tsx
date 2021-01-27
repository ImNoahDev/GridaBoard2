import React from "react";
import '../../styles/buttons.css';
import ThemeManager from "../../styles/ThemeManager";
import GridaToolTip from "../../styles/GridaToolTip";
import Popover from "@material-ui/core/Popover";

const themeManager: ThemeManager = ThemeManager.getInstance();

export default function BackgroundButton() {

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const setBackground = (background) => {
    if(background === 1) {
      themeManager.setT1();
    } else if(background === 2) {
      themeManager.setT2();
    } else if(background === 3) {
      themeManager.setT3();
    } else {
      themeManager.setT4();
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
      <div className="btn-group dropright" role="group">
        <button type="button" id="btn_background" className="btn btn-neo btn-neo-vertical"
          data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onClick={handleClick} aria-describedby={id}>
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
        </button>
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
              <img src="/icons/icon_bg_gd01_n.png" className="normal-image"></img>
              <img src="/icons/icon_bg_gd01_p.png" className="hover-image"></img>
              <span className="bg-dropmenu">Gurodong</span>
            </div>
          </a>

          <a id="btn_bg_avan" className="dropdown-item" href="#" onClick={() => setBackground(2)}>
            <div className="c2">
              <img src="/icons/icon_bg_gd02_n.png" className="normal-image"></img>
              <img src="/icons/icon_bg_gd02_p.png" className="hover-image"></img>
              <span className="bg-dropmenu">Aubergine</span>
            </div>
          </a>

          <a id="btn_bg_white" className="dropdown-item" href="#" onClick={() => setBackground(3)}>
            <div className="c2">
              <img src="/icons/icon_bg_wh_n.png" className="normal-image"></img>
              <img src="/icons/icon_bg_wh_p.png" className="hover-image"></img>
              <span className="bg-dropmenu">White</span>
            </div>
          </a>

          <a id="btn_bg_black" className="dropdown-item" href="#" onClick={() => setBackground(4)}>
            <div className="c2">
              <img src="/icons/icon_bg_bk_n.png" className="normal-image"></img>
              <img src="/icons/icon_bg_bk_p.png" className="hover-image"></img>
              <span className="bg-dropmenu">Black</span>
            </div>
          </a>
        </Popover>
        <div className="dropdown-menu p-0 border border-0 " aria-labelledby="btn_background">
          {/* <a className="dropdown-item" href="#"> */}

          
          {/* </a> */}
        </div>
      </div>
    );
}