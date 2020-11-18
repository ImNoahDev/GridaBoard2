import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Button, Box } from "@material-ui/core";
import {
  //PenEvent,
  NeoSmartpen, NeopenInterface, InkStorage, paperInfo, NoteserverClient, PenEventName
} from "../neosmartpen";



let penHandler = null;
let pen = [];
let storage = InkStorage.getInstance();


const getNoteInfo = (event) => {

  // let url = "http://nbs.neolab.net/v1/notebooks/attributes?device=android";


  let note_info = new NoteserverClient();
  note_info.getNoteInfo({});
};


const handleGotoResult = (event) => {
  // penHandler = new PenTest();
  let new_pen = new NeoSmartpen();

  // let filter = { mac: new_pen.getMac()) };
  // let inkStorage = InkStorage.getInstance();
  // inkStorage.addEventListener(PenEventName.ON_PEN_DOWN, this.onLivePenDown.bind(this), filter);
  // inkStorage.addEventListener(PenEventName.ON_PEN_PAGEINFO, this.onLivePenPageInfo.bind(this), filter);
  // inkStorage.addEventListener(PenEventName.ON_PEN_MOVE, this.onLivePenMove.bind(this), filter);
  // inkStorage.addEventListener(PenEventName.ON_PEN_UP, this.onLivePenUp.bind(this), filter);
  // inkStorage.addEventListener(PenEventName.ON_CONNECTED, () => { pen.push(new_pen); }, filter);


  new_pen.connect();
  pen.push(new_pen);
  
};

const Menu = () => {
  const activeStyle = {
    color: "green",
    fontSize: "2rem"
  };

  return (
    <div>
      <ul>
        <li> <Link to="/">Home</Link> </li>
        <li> <Link to="/about">About</Link> </li>
        <li> <Link to="/about/foo">About Foo</Link> </li>
        <li><Link to="/posts">Posts</Link></li>
      </ul>

      <ul>
        <li> <NavLink exact to="/" activeStyle={activeStyle}> Home </NavLink> </li>
        <li> <NavLink exact to="/about" activeStyle={activeStyle}> About </NavLink> </li>
        <li> <NavLink to="/about/foo" activeStyle={activeStyle}> About Foo </NavLink> </li>
        <li><NavLink to="/posts" activeStyle={activeStyle}>Posts</NavLink></li>
      </ul>

      <Button variant="outlined" color="primary" onClick={(event) => getNoteInfo(event)} >
        <Box fontSize={16} fontWeight="fontWeightBold" >공책 정보 가져오기</Box>
      </Button>
    </div>
  );
};

export default Menu;
