import { Button, ButtonGroup, ClickAwayListener, Grow, makeStyles, MenuItem, MenuList, Paper, Popper } from '@material-ui/core';
import React, { useState } from 'react';
import getText from "GridaBoard/language/language";
import { ArrowDropDown, Add } from '@material-ui/icons';


const menuStyle = makeStyles(theme =>({
  headerButton : {
    width: "137px",
    height: "40px",
    backgroundColor : theme.palette.primary.main,
    borderRadius: "28px",
    alignItems: "center",
    "& > button" : {
      textTransform: "initial",
      borderRadius: "60px",
      padding: 0,
      height: "100%",
      borderRight: "initial !important",
      "&:first-child" : {
        width: "90px",
        "& > span > svg" : {
          marginRight: "10px",
        }
      },
      "&:last-child" : {
        width: "46px",
        paddingright: "6px",
      }
    }
  },
  headerButtonLiner : {
    width: "1px",
    minWidth: "1px",
    minHeight: "1px",
    height: "16px",
    background: theme.custom.white[25],
    borderRadius: "28px !important",
    borderRight : "0px !important",
  },
  menuItem : {
    minWidth : "130px"
  }
}))

const MainNewButton = ()=>{
  const [open, setOpen] = useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const options = [getText("word_New"),"anything"];
  const classes = menuStyle();

  const handleClick = () => {
    console.info(`You clicked ${options[selectedIndex]}`);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <React.Fragment>
      <ButtonGroup className={classes.headerButton} variant="contained" disableElevation color="primary" ref={anchorRef} aria-label="split button">
        <Button onClick={handleClick}>
          {selectedIndex == 0 ? (<Add />) : ""}
          {options[selectedIndex]}
        </Button>
        <div className={classes.headerButtonLiner} />
        <Button
          color="primary"
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDown />
        </Button>
      </ButtonGroup>
      <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                  {options.map((option, index) => (
                    <MenuItem
                      className={classes.menuItem}
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}



export default MainNewButton