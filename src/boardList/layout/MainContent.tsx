import { Button, ButtonGroup, Checkbox, ClickAwayListener, createStyles, Grow, IconButton, InputBase, makeStyles, MenuItem, MenuList, NativeSelect, Paper, Popper, Select, SvgIcon, withStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import getText from "GridaBoard/language/language";
import { ArrowDropDown, Add } from '@material-ui/icons';
const BootstrapInput = withStyles((theme) =>
  createStyles({
    root: {
      width : "160px",
      height : "40px",
      'label + &': {
        marginTop: theme.spacing(3),
      },
    },
    input: {
      borderRadius: 4,
      position: 'relative',
      backgroundColor: theme.palette.background.paper,
      border: '1px solid '+theme.custom.icon.mono[2],
      fontSize: 16,
      padding: '10px 26px 10px 12px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      // Use the system font instead of the default Roboto font.
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      '&:focus': {
        borderRadius: 4,
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
  }),
)(InputBase);

const useStyle = makeStyles(theme =>({
  wrap : {
    padding: "32px",
    display:"flex",
    position: "relative",
    flexDirection: "column",
    width: "100%"
  },
  header : {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom : "86px"
  },
  title : {
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: "32px",
    lineHeight: "37px",
    letterSpacing: "0.25px",
  },
  nav : {
    position: "relative",
    display: "flex",
    width: "100%",
    minHeight : "40px",
    marginBottom: "24px",
    justifyContent: "space-between",
    alignItems: "center",
    "& > div:first-child" : {
      display: "flex",
      alignItems: "center",
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "0.25px",
      color : theme.palette.text.secondary
    },
    "& > div:last-child" : {
      display: "flex",
      "& > div:first-child" : {
        marginRight: "24px"
      },
      "& > *:nth-child(2)":{
        "& > *" : {
          width: "40px",
          height  : "40px",
          marginLeft: "8px"
        },
        "& > *:first-child":{
          marginLeft: "0px"
        },
        "& > *:last-child":{
        },
      },
    }
  },
  gridContent : {
    position:"relative",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 246px)",
    gap: "24px",
    maxHeight : "calc(100% - 190px)",
    overflow: "hidden",
    overflowY : "auto",
    "& > .contentItem" : {
      position:"relative",
      display: "flex",
      flexDirection : "column",
      width : "246px",
      height: "196px",
      border : `1px solid ${theme.custom.icon.mono[2]}`,
      "& > div:first-child": {
        width: "244px",
        height: "135px",
        backgroundSize: "cover",
        backgroundPositionY: "center",
        backgroundPositionX: "center",
      },
      "& > div:nth-child(2)" : {
        flex : 1,
        padding : "12px 11px 11px",
        "& > div:first-child" : {
          width: "211px",
          height: "19px",
          fontFamily: "Roboto",
          fontStyle: "normal",
          fontWeight: "normal",
          fontSize: "16px",
          lineHeight: "19px",
          /* identical to box height */
          letterSpacing: "0.25px",
          overflow: "hidden !important",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }
      },
      "& .contentData" : {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        "&>div:nth-child(1)" :{
          fontFamily: "Roboto",
          fontStyle: "normal",
          fontWeight: "normal",
          fontSize: "11px",
          lineHeight: "13px",
          /* identical to box height */
          
          letterSpacing: "0.25px",
          
          /* White/text/secondary */
          
          color: theme.palette.text.secondary,
        },
        "&>div:nth-child(2)" :{
          width: "2px",
          height: "2px",
          background: theme.custom.icon.mono[2],
          margin : "5px"
        },
        "&>div:nth-child(3)" :{
          fontFamily: "Roboto",
          fontStyle: "normal",
          fontWeight: "normal",
          fontSize: "11px",
          lineHeight: "13px",
    
          letterSpacing: "0.25px",
    
          color: theme.palette.text.secondary,
    
        }
      }
    }
  },
  selected : {
    position:"absolute",
    width: "100%",
    height: "100%",
    border: `2px solid ${theme.palette.primary.main}`,
    pointerEvents: "none",
  },
}))

interface Props extends  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  test ?: string
  selected ?: string
  category ?: Object
  docs ?: Array<any>

  routeChange ?: (idx:number)=>void
}

const MainContent = (props : Props)=>{
  const {category, selected, docs, routeChange, ...rest} = props;
  const [selectedContent, setSelectedContent] = useState(-1);
  const classes = useStyle();
  let nowDocs = [];
  let title = "";
  let contentRef = React.useRef<HTMLDivElement>(null);

  useEffect(()=>{
    contentRef.current.scrollTop = 0;
  },[props.selected])


  if(["recent", "trash"].includes(selected)){
    title = getText("boardList_" + selected);
    if(selected == "recent"){
      nowDocs = [...docs];
      nowDocs.sort((a,b)=>b.last_modified.seconds - a.last_modified.seconds);
      console.log(nowDocs);
    }else{
      //삭제 정보 확인 필요
      console.log(123);
    }

  }else{
    if(selected === "none"){
      nowDocs = docs.filter(el=>el.category=="None");

      title = getText("boardList_unshelved").replace("%d", nowDocs.length.toString());
    }else{
      nowDocs = docs.filter(el=>el.category==selected);
      title = `${selected} (${nowDocs.length})`;
    }
  }
  
  const listOrderChange = (event)=>{
    console.log(event.target.value);
  }
  const listViewType = (val)=>{
    console.log(val);
  } 

  return (<div className={classes.wrap}>
    <div className={classes.header}>
      <div className={classes.title}>
        {title}
      </div>
      <NewButtons />
    </div>
    <div className={classes.nav}>
      <div>
        <Checkbox color="primary"/>{getText("word_select").replace("%d", "0")}
      </div>
      <NavSelector listOrderChange={listOrderChange} listViewType={listViewType}/>
    </div>
    <div className={classes.gridContent} ref={contentRef}>
    {nowDocs.map((el, idx) => {
    let times = new Date(el.date.seconds*1000);
    let category = el.category == "None" ? "" : el.category;
    return (
      <div key={idx} className="contentItem" /* onClick={() => routeChange(el.key)} */>
        <div style={{backgroundImage:`url(${el.thumb_downloadURL})`}} />
        <div>
          <div>{el.doc_name}</div>
          <div className="contentData">
            <div>
              {`${times.getFullYear()}/${times.getMonth()}/${times.getDate()}`}
            </div>
            {category === "" ? "" : (<div />)}
            {category === "" ? "" : (<div>{category}</div>)}
            
          </div>
        </div>
        {selectedContent === idx ? (<div className={classes.selected}/>) : ""}
      </div>
    )
    })} 

  </div>
  </div>);
}

export default MainContent;


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

const NewButtons = ()=>{
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



interface Props extends  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  listOrderChange ?: (event)=>void,
  listViewType ?: (val)=>void
}

const NavSelector = (props : Props)=>{
  const {listOrderChange, listViewType, ...rest } = props;
  return (
    <div>
      <Select
        onChange={listOrderChange}
        defaultValue={0}
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
          getContentAnchorEl: null,
        }}
        input={<BootstrapInput />}
      >
        <MenuItem value={0}>{getText("boardList_lastOpened")}</MenuItem>
        <MenuItem value={1}>123123</MenuItem>
      </Select>
      <div>
        <IconButton>
          <SvgIcon>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5 5H9V9H5V5ZM3 11V3H11V11H3ZM15 5H19V9H15V5ZM13 11V3H21V11H13ZM9 15H5V19H9V15ZM3 13V21H11V13H3ZM15 15H19V19H15V15ZM13 21V13H21V21H13Z"
            />
          </SvgIcon>
        </IconButton>
      </div>
    </div>)
}