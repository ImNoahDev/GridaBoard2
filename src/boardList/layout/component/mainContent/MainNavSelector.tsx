import React from 'react';
import { createStyles, IconButton, InputBase, MenuItem, Select, SvgIcon, withStyles } from '@material-ui/core';
import getText from "GridaBoard/language/language";

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

interface Props extends  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  listOrderChange ?: (event)=>void,
  listViewType ?: (val)=>void,
  orderBy ?: number
}

const MainNavSelector = (props : Props)=>{
  const {listOrderChange, listViewType, orderBy, ...rest } = props;

  const orderList = [{
    // name : "lastOpened",
    title : getText("boardList_lastOpened"),
    value : 0
  },{
    // name : "lastMake",
    title : "이름순?",
    value : 1
  }]

  const viewList = [{
    name: "grid",
    path : "M5 5H9V9H5V5ZM3 11V3H11V11H3ZM15 5H19V9H15V5ZM13 11V3H21V11H13ZM9 15H5V19H9V15ZM3 13V21H11V13H3ZM15 15H19V19H15V15ZM13 21V13H21V21H13Z"
  },{
    name: "list",
    path : "M3 4H21V6H3V4ZM3 11H21V13H3V11ZM21 18H3V20H21V18Z"
  }]
  return (
    <div>
      <Select
        onChange={listOrderChange}
        defaultValue={0}
        value={orderBy}
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
        {orderList.map(el=>(<MenuItem value={el.value} key={el.value}>{el.title}</MenuItem>))}
        
      </Select>
      <div>
        {viewList.map(el=>(<IconButton key={el.name} onClick={e=>listViewType(el.name)}>
          <SvgIcon>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d={el.path}
            />
          </SvgIcon>
        </IconButton>))}
        
        
      </div>
    </div>)
}

export default MainNavSelector;