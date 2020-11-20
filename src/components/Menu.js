import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Button, Box } from "@material-ui/core";
import {
  //PenEvent,
    NoteserverClient
} from "../neosmartpen";





const getNoteInfo = (event) => {

  // let url = "http://nbs.neolab.net/v1/notebooks/attributes?device=android";


  let note_info = new NoteserverClient();
  note_info.getNoteInfo({});
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
