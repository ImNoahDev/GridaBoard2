import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@material-ui/core';
import { turnOnGlobalKeyShortCut } from "../../GlobalFunctions";
import Cookies from 'universal-cookie';
import "firebase/auth";
import "firebase/database";
import firebase , { auth } from "../../util/firebase_config";

const logOut = ()=>{
    auth.signOut();
    const cookies = new Cookies();
    cookies.remove("user_email");
}

const About = () => {
    const activeStyle = {
        color: 'green',
        fontSize: '2rem'
    };
    turnOnGlobalKeyShortCut(false);
    const database = firebase.database();

    return (
        <div>About
            <ul>
                <li><NavLink exact to="/" activeStyle={activeStyle}>Home</NavLink></li>
                <li><NavLink to="/app" activeStyle={activeStyle}>app</NavLink></li>
                <li><Button onClick = {logOut}> 로그아웃 </Button></li>
            </ul>
            <hr/>
        </div>
    );
};

export default About;