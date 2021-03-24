import React from "react";
import '../../styles/buttons.css';
import PenManager from "../../../nl-lib/neosmartpen/PenManager";
import { IconButton, makeStyles, SvgIcon, Theme, Tooltip, TooltipProps } from "@material-ui/core";
import { PEN_THICKNESS } from "../../../nl-lib/common/enums";
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';

const manager: PenManager = PenManager.getInstance();

const thicknessStyle = {
  marginLeft: "22px",
  padding: "8px",
  zIndex: 100
} as React.CSSProperties;

const thicknessDropStyle = {
  padding: "8px"
} as React.CSSProperties;

const useStylesBootstrap = makeStyles((theme: Theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: "11px"
  },
}));

function BootstrapTooltip(props: TooltipProps) {
  const classes = useStylesBootstrap();

  return <Tooltip arrow classes={classes} {...props} />;
}

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
    // width: "300px",
    // height: "48px",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
    borderRadius: "12px",
    zIndex: 10000,
    marginLeft: "20px"
  } as React.CSSProperties;

  return (
    <React.Fragment>
      <div>
        <BootstrapTooltip title="두께 [A ~ G]">
          <IconButton style={thicknessStyle} className="thicknessDropDown" onClick={handleClickThickness}>
            <SvgIcon id="svg_thickness" className="thicknessDropDown" >
              <path
                className="thicknessDropDown"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M23.149 6.906a3 3 0 01-.055 4.243l-6.158 6a3 3 0 01-4.243-.056L8.972 13.27l-3.85 3.85A3 3 0 11.878 12.88l6-6a3 3 0 014.27.028l3.749 3.85 4.008-3.906a3 3 0 014.243.055z"
              />
            </SvgIcon>
            {/* <KeyboardArrowDownRoundedIcon /> */}
          </IconButton>
        </BootstrapTooltip>

        <div id="thicknessDrop" className="btn-group" style={thicknessDropDownStyle}>
          <IconButton onClick={() => setThickness(PEN_THICKNESS.THICKNESS1)} style={thicknessDropStyle}>
            <SvgIcon id="svg_thickness_1">
              <path
                id="thickness_1"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.858 8.151a.5.5 0 01-.01.707l-6.157 6a.5.5 0 01-.707-.01L8.495 9.213l-5.641 5.642a.5.5 0 01-.708-.708l6-6a.5.5 0 01.712.005l5.493 5.642 5.8-5.651a.5.5 0 01.707.01z"
              />
            </SvgIcon>
          </IconButton>
          <IconButton onClick={() => setThickness(PEN_THICKNESS.THICKNESS2)} style={thicknessDropStyle}>
            <SvgIcon>
              <path
                id="thickness_2"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.574 7.453a1.5 1.5 0 01-.027 2.121l-6.158 6a1.5 1.5 0 01-2.122-.028l-4.781-4.91L3.56 15.56a1.5 1.5 0 01-2.122-2.122l6-6a1.5 1.5 0 012.136.015l4.795 4.925 5.083-4.953a1.5 1.5 0 012.121.027z"
              />
            </SvgIcon>
          </IconButton>
          <IconButton onClick={() => setThickness(PEN_THICKNESS.THICKNESS3)} style={thicknessDropStyle}>
            <SvgIcon>
            <path
              id="thickness_3"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M23.149 6.906a3 3 0 01-.055 4.243l-6.158 6a3 3 0 01-4.243-.056L8.972 13.27l-3.85 3.85A3 3 0 11.878 12.88l6-6a3 3 0 014.27.028l3.749 3.85 4.008-3.906a3 3 0 014.243.055z"
            />
            </SvgIcon>
          </IconButton>
          <IconButton onClick={() => setThickness(PEN_THICKNESS.THICKNESS4)} style={thicknessDropStyle}>
            <SvgIcon>
            <path
              id="thickness_4"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22.865 5.36c1.542 1.78 1.509 4.629-.073 6.363l-5.474 6c-.76.833-1.783 1.292-2.844 1.277-1.061-.016-2.073-.505-2.814-1.36l-2.365-2.733-2.467 2.775c-1.562 1.757-4.094 1.757-5.656 0-1.563-1.757-1.563-4.607 0-6.364l5.333-6C7.262 4.467 8.29 3.992 9.36 4c1.07.008 2.093.498 2.84 1.36l2.4 2.775 2.609-2.858c1.582-1.734 4.114-1.697 5.656.083z"
            />
            </SvgIcon>
          </IconButton>
          <IconButton onClick={() => setThickness(PEN_THICKNESS.THICKNESS5)} style={thicknessDropStyle}>
            <SvgIcon>
            <path
              id="thickness_5"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22.638 4.813c1.85 2.373 1.81 6.172-.088 8.484l-4.927 6c-.912 1.111-2.14 1.723-3.413 1.703-1.273-.021-2.487-.674-3.375-1.814l-1.28-1.644-1.36 1.7c-1.875 2.344-4.915 2.344-6.79 0-1.874-2.343-1.874-6.142 0-8.485l4.8-6C7.115 3.622 8.349 2.99 9.633 3c1.284.01 2.511.664 3.407 1.814l1.324 1.7 1.487-1.811c1.899-2.313 4.938-2.264 6.788.11z"
            />
            </SvgIcon>
          </IconButton>
        </div>
      </div>
    </React.Fragment>
  );
}