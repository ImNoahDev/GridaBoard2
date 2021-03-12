import React from "react";
import { IconButton, Popover } from "@material-ui/core";
import RotateButton from "../../components/buttons/RotateButton";
import GridaToolTip from "../../styles/GridaToolTip";
import HelpIcon from '@material-ui/icons/Help';;

const sideStyle = {
  display: "flex",
  flex: "none",
  flexDirection: "column"
} as React.CSSProperties;

const dropdownStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: "8px",
  position: "relative",
  width: "240px",
  height: "176px",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.25)",
  borderRadius: "12px",
} as React.CSSProperties;

const dropContentsStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "4px 12px",
  position: "static",
  width: "224px",
  left: "calc(50% - 224px / 2)",
  top: "8px",
  marginTop: "8px"
} as React.CSSProperties;

const RightSideLayer = () => {

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
    <div id="mainFrame" style={sideStyle}>
      <div id="rotate-box" style={{
        display: "flex",
        justifyContent: "flex-end",
        marginRight: 10,
        marginTop: 10,
        flexWrap: "wrap"
      }}>
        <RotateButton />
      </div>
      <GridaToolTip open={true} placement="top-start" tip={{
        head: "Helper",
        msg: "도움말 기능들을 보여줍니다.",
        tail: "키보드 버튼 ?로 선택 가능합니다"
      }} title={undefined}>
          <IconButton id="help_btn" onClick={handleClick} aria-describedby={id} style={{marginTop: "auto"}}>
            <HelpIcon fontSize="large" 
              style={{
              zIndex: 1500,
              padding: 0,
            }}/>
          </IconButton>
      </GridaToolTip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <div style={dropdownStyle}>
          <a href="#" style={{textDecoration: "none", color: "rgba(18,18,18,1)"}}>
            <div style={dropContentsStyle}>
              <a>고객센터</a>
            </div>
          </a>
          <a href="#" style={{textDecoration: "none", color: "rgba(18,18,18,1)"}}>
            <div style={dropContentsStyle}>
              <a>단축키 안내</a>
            </div>
          </a>
          <a href="#" style={{textDecoration: "none", color: "rgba(18,18,18,1)"}}>
            <div style={dropContentsStyle}>
              <a>튜토리얼</a>
            </div>
          </a>
          <a href="#" style={{textDecoration: "none", color: "rgba(18,18,18,1)"}}>
            <div style={dropContentsStyle}>
              <a>FAQ</a>
            </div>
          </a>
        </div>
      </Popover>
    </div>
  );
}

export default RightSideLayer;
