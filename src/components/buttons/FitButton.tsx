import React from "react";
import '../../styles/buttons.css';
import { Popover } from '@material-ui/core';
import GridaToolTip from "../../styles/GridaToolTip";

export default function FitButton() {

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

    return (
      <React.Fragment>
        <div className="btn-group dropright" role="group">
          <button type="button" id="btn_fit" className="btn btn-neo btn-neo-vertical" data-toggle="dropdown"
            aria-haspopup="true" aria-expanded="false" onClick={handleClick} aria-describedby={id}>
            <GridaToolTip open={true} placement="left" tip={{
                head: "Fit",
                msg: "용지의 크기를 맞추는 여러 옵션 중 하나를 선택합니다.",
                tail: "Z 폭 맞춤, X 높이 맞춤, C 전체 페이지, V 100%"
              }} title={undefined}>
              <div className="c2">
                <img src="/icons/icon_ratio_n.png" className="normal-image"></img>
                <img src="/icons/icon_ratio_p.png" className="hover-image"></img>
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
            <a id="btn_fit_width" className="dropdown-item" href="#" onClick={handleClose}>
              <div className="c2">
                <img src="/icons/icon_fit_width_n.png" className="normal-image"></img>
                <img src="/icons/icon_fit_width_p.png" className="hover-image"></img>
                <span className="bg-dropmenu" data-l10n-id="page_scale_width">Fit to width</span>
              </div>
            </a>
            <a id="btn_fit_height" className="dropdown-item" href="#" onClick={handleClose}>
              <div className="c2">
                <img src="/icons/icon_fit_height_n.png" className="normal-image"></img>
                <img src="/icons/icon_fit_height_p.png" className="hover-image"></img>
                <span className="bg-dropmenu" data-l10n-id="page_scale_fit">Fit to height</span>
              </div>
            </a>
            <a id="btn_fit_canvas" className="dropdown-item" href="#" onClick={handleClose}>
              <div className="c2">
                <img src="/icons/icon_fit_canvas_n.png" className="normal-image"></img>
                <img src="/icons/icon_fit_canvas_p.png" className="hover-image"></img>
                <span className="bg-dropmenu" data-l10n-id="page_scale_auto">Fit to full page</span>
              </div>
            </a>
            <a id="btn_fit_paper" className="dropdown-item" href="#" onClick={handleClose}>
              <div className="c2">
                <img src="/icons/icon_fit_paper_n.png" className="normal-image"></img>
                <img src="/icons/icon_fit_paper_p.png" className="hover-image"></img>
                <span className="bg-dropmenu" data-l10n-id="page_scale_actual">Fit to 100%</span>
              </div>
            </a>
          </Popover>

          <div className="dropdown-menu p-0 border border-0 " aria-labelledby="btn_eraser">
            
          </div>
        </div>
      </React.Fragment>
    );
}