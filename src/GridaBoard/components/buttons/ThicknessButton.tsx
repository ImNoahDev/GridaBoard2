import React from "react";
import '../../styles/buttons.css';
import PenManager from "../../../nl-lib/neosmartpen/PenManager";
import { IconButton, SvgIcon } from "@material-ui/core";
import { PEN_THICKNESS } from "../../../nl-lib/common/enums";

const manager: PenManager = PenManager.getInstance();

const thicknessStyle = {
  marginLeft: "8px"
} as React.CSSProperties;

export default function ThicknessButton () {

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const setThickness = (thickness: number) => {
    manager.setThickness(thickness);
    handleClose();
  }

  const handleClose = () => {
    setAnchorEl(null);
  };
  function handleClickThickness() {
    const thickness = document.getElementById("thicknessDrop");
    if (thickness.style.display == 'none') {
      thickness.style.display = 'block'
    } else {
      thickness.style.display = 'none'
    }
  }

  const thicknessDropDownStyle = {
    display: "none",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "4px 8px",
    position: "absolute",
    width: "300px",
    height: "48px",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
    borderRadius: "12px",
    zIndex: 10000,
    marginLeft: "20px"
  } as React.CSSProperties;

  return (
    <React.Fragment>
      <div>
        <IconButton style={thicknessStyle} className="thicknessDropDown" onClick={handleClickThickness}>
          <SvgIcon id="svg_thickness" className="thicknessDropDown" >
            <path
              className="thicknessDropDown"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M23.149 6.906a3 3 0 01-.055 4.243l-6.158 6a3 3 0 01-4.243-.056L8.972 13.27l-3.85 3.85A3 3 0 11.878 12.88l6-6a3 3 0 014.27.028l3.749 3.85 4.008-3.906a3 3 0 014.243.055z"
            />
          </SvgIcon>
        </IconButton>

        <div id="thicknessDrop" className="btn-group" style={thicknessDropDownStyle}>
          <IconButton onClick={() => setThickness(PEN_THICKNESS.THICKNESS1)}>
            <SvgIcon id="svg_thickness_1" style={{width: "32px", height: "18px"}}>
              <path
                id="thickness_1"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.858 8.151a.5.5 0 01-.01.707l-6.157 6a.5.5 0 01-.707-.01L8.495 9.213l-5.641 5.642a.5.5 0 01-.708-.708l6-6a.5.5 0 01.712.005l5.493 5.642 5.8-5.651a.5.5 0 01.707.01z"
              />
            </SvgIcon>
          </IconButton>
          <IconButton onClick={() => setThickness(PEN_THICKNESS.THICKNESS2)}>
            <SvgIcon style={{width: "32px", height: "18px"}}>
              <path
                id="thickness_2"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.574 7.453a1.5 1.5 0 01-.027 2.121l-6.158 6a1.5 1.5 0 01-2.122-.028l-4.781-4.91L3.56 15.56a1.5 1.5 0 01-2.122-2.122l6-6a1.5 1.5 0 012.136.015l4.795 4.925 5.083-4.953a1.5 1.5 0 012.121.027z"
              />
            </SvgIcon>
          </IconButton>
          <IconButton onClick={() => setThickness(PEN_THICKNESS.THICKNESS3)}>
            <SvgIcon style={{width: "32px", height: "18px"}}>
              <path
                id="thickness_3"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M23.149 6.906a3 3 0 01-.055 4.243l-6.158 6a3 3 0 01-4.243-.056L8.972 13.27l-3.85 3.85A3 3 0 11.878 12.88l6-6a3 3 0 014.27.028l3.749 3.85 4.008-3.906a3 3 0 014.243.055z"
              />
            </SvgIcon>
          </IconButton>
          <IconButton onClick={() => setThickness(PEN_THICKNESS.THICKNESS4)}>
            <SvgIcon style={{width: "32px", height: "18px"}}>
              <path
                id="thickness_4"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M25.723 5.36a4.5 4.5 0 01-.083 6.363l-6.157 6a4.5 4.5 0 01-6.365-.084l-2.66-2.732-2.776 2.775a4.5 4.5 0 01-6.364-6.364l6-6a4.5 4.5 0 016.406.043l2.702 2.774 2.934-2.858a4.5 4.5 0 016.363.083z"
              />
            </SvgIcon>
          </IconButton>
          <IconButton onClick={() => setThickness(PEN_THICKNESS.THICKNESS5)}>
            <SvgIcon style={{width: "32px", height: "18px"}}>
              <path
                id="thickness_5"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M30.184 4.813c2.467 2.373 2.414 6.172-.118 8.484l-6.568 6c-1.216 1.111-2.853 1.723-4.55 1.703-1.698-.021-3.317-.674-4.502-1.814l-1.707-1.644-1.814 1.7c-2.499 2.344-6.551 2.344-9.05 0-2.5-2.343-2.5-6.142 0-8.485l6.4-6C9.485 3.622 11.13 2.99 12.843 3c1.712.01 3.348.664 4.542 1.814l1.766 1.7 1.983-1.811c2.531-2.313 6.583-2.264 9.05.11z"
              />
            </SvgIcon>
          </IconButton>
        </div>
      </div>
    </React.Fragment>
  );
}