import { Button, ClickAwayListener, Grow, makeStyles, MenuItem, MenuList, Paper, Popper, SvgIcon } from '@material-ui/core';
import React, { useState } from 'react';
import getText from 'GridaBoard/language/language';
import { ArrowDropDown, Add } from '@material-ui/icons';
import { useHistory } from 'react-router';
import GridaDoc from '../../../../GridaBoard/GridaDoc';
import { startNewGridaPage } from '../../../BoardListPageFunc';
import { IFileBrowserReturn, IPageSOBP } from '../../../../nl-lib/common/structures';
import ConvertFileLoad from '../../../../GridaBoard/Load/ConvertFileLoad';

const menuStyle = makeStyles(theme => ({
  headerButton: {
    width: '137px',
    height: '40px',
    backgroundColor: theme.palette.primary.main,
    borderRadius: '28px',
    alignItems: 'center',
    '& > button': {
      textTransform: 'initial',
      borderRadius: '60px',
      padding: 0,
      height: '100%',
      borderRight: 'initial !important',
      '&:first-child': {
        width: '90px',
        '& > span > svg': {
          marginRight: '10px',
        },
      },
      '&:last-child': {
        width: '46px',
        paddingright: '6px',
      },
    },
  },
  ButtonBorder : {
    border: "1px solid " + theme.custom.icon.mono[0],
  },
  headerButtonLiner: {
    width: '1px',
    minWidth: '1px',
    minHeight: '1px',
    height: '16px',
    background: theme.custom.white[25],
    borderRadius: '28px !important',
    borderRight: '0px !important',
  },
  buttonStyle: {
    padding: 0,
    minWidth: '0px',
    minHeight: '0px',
  },
  buttonFontStyle: {
    minWidth: '0px',
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '16.41px',
    fontSize: '14px',
    textAlign: 'right',
    letterSpacing: '0.25px',
    color: theme.palette.text.primary,
    '&:hover': {
      color: theme.palette.action.hover,
      fontWeight: 700,
    },
  },
  dropper : {
    marginTop: "8px",
    "& > div" : {
      borderRadius: '12px',
      width: "240px",
      padding: "8px",
      " & > ul":{
        padding: "0px !important",
        "& > li" : {
          height: "40px",
          padding: "8px 12px",
          borderRadius: "8px",
          fontFamily: "Roboto",
          fontStyle: "normal",
          fontWeight: "normal",
          fontSize: "14px",
          lineHeight: "16px",
          letterSpacing: "0.25px",
          "& > svg" : {
            marginRight: "8px",
            color : theme.custom.grey[4]
          }
        },
        "& > li:hover" : {
          fontWeight: "bold",
          background: theme.custom.icon.blue[3],
          color: theme.palette.primary.main,
          "& > svg" : {
            color: theme.palette.primary.main,
          }
        }
      }
    }
  }
}));
const MainNewButton = () => {
  const [open, setOpen] = useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const options = [getText('create_new_board'), getText('import_pdf_pptx')];
  const classes = menuStyle();
  const history = useHistory();

  const handlePdfOpen = async (event: IFileBrowserReturn, pageInfo?: IPageSOBP, basePageInfo?: IPageSOBP) => {
    console.log(event.url);
    if (event.result === 'success') {
      const doc = GridaDoc.getInstance();
      doc._pdfd = [];
      await doc.openPdfFile({ url: event.url, filename: event.file.name }, pageInfo, basePageInfo);
    } else if (event.result === 'canceled') {
      alert(getText('alert_fileOpenCancel'));
    }
  };

  const fileOpenHandler = () => {
    const input = document.querySelector('#fileForconvert') as HTMLInputElement;
    input.value = '';
    input.click();
  };

  const startGrida = async () => {
    await startNewGridaPage();

    //이거 하면 contents layer의 useEffect부터 불리고 거기서 이전 activePageNo로 로직이 수행돼서 에러나니까 페이지 바뀌기 전에 activePageNo을 미리 바꿔줘야함
    const path = `/app`;
    history.push(path); 

    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  console.log(open);
  return (
    <React.Fragment>
      <div ref={anchorRef}>
        <Button className={`${classes.headerButton} ${open? classes.ButtonBorder : ""}`} variant="contained" color="primary" onClick={handleToggle}>
          <div style={{ marginRight: '15px' }}>{<Add />}</div>
          <div style={{ marginRight: '16px' }}>{getText('word_New')}</div>
          <div className={classes.headerButtonLiner} style={{ marginRight: '5px' }} />
          <ArrowDropDown />
        </Button>
      </div>
      <Popper className={classes.dropper} open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal style={{ zIndex: 10 }} placement="bottom-end">
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {/* map으로 돌릴 경우 onClick에 모든 index가 한번씩 들어옴 */}
                  <MenuItem onClick={startGrida}>
                    <SvgIcon>
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18 10v10H6V4h6v6h6zm2-2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h8l6 6zm-6-3.172L17.172 8H14V4.828z"
                      />
                    </SvgIcon>
                    <span>{options[0]}</span>
                  </MenuItem>
                  <MenuItem onClick={fileOpenHandler}>
                    <SvgIcon>
                      <path
                        d="M14 12l-4-4v3H2v2h8v3l4-4zm6 6V6a2 2 0 00-2-2H6a2 2 0 00-2 2v3h2V6h12v12H6v-3H4v3a2 2 0 002 2h12a2 2 0 002-2z"
                      />
                    </SvgIcon>
                    <span>{options[1]}</span>
                    <ConvertFileLoad handlePdfOpen={handlePdfOpen} />
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
};

export default MainNewButton;
