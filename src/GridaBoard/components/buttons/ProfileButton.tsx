import React, { useState } from 'react';
import { auth } from "GridaBoard/util/firebase_config";
import { Button, ClickAwayListener, Grow, makeStyles, MenuItem, MenuList, Paper, Popper } from '@material-ui/core';
import { KeyboardArrowDown } from "@material-ui/icons";
import { useHistory } from 'react-router-dom';
import { fbLogout } from '../../../boardList/BoardListPageFunc';

const useStyle = makeStyles(theme=>({
  menuItem: {
    minWidth: '130px',
  },
}))

const ProfileButton = () => {
  const [open, setOpen] = useState(false);
  const history = useHistory();

  const classes = useStyle();
  const anchorRef = React.useRef<HTMLDivElement>(null);
  
  let userId = "";
  if (auth.currentUser !== null) {
    userId = auth.currentUser.email;
  }

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };
  
  const logout = () => {
    fbLogout();
    routeChange();
  };

  const routeChange = () => {
    const path = `/`;
    history.push(path);
  }

  return (
    <React.Fragment>
        <div ref={anchorRef} onClick={handleToggle}>
          <Button style={{textTransform: 'none'}}>
            {userId}
            <KeyboardArrowDown/>
          </Button>
        </div>
        <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal style={{ zIndex: 10 }}>
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
              borderRadius: '12px',
              height: '48px',
              width: '180px',
            }}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  <MenuItem className={classes.menuItem} onClick={logout}>
                    <span style={{ marginLeft: '10px' }}>로그아웃</span>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
       </Popper>
    </React.Fragment>
  );
}

export default ProfileButton;