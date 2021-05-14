import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button, makeStyles } from '@material-ui/core';
import { turnOnGlobalKeyShortCut } from "GridaBoard/GlobalFunctions";
import Cookies from 'universal-cookie';
import "firebase/auth";
import "firebase/database";
import firebase , { auth } from "GridaBoard/util/firebase_config";

const logOut = ()=>{
    auth.signOut();
    const cookies = new Cookies();
    cookies.remove("user_email");
}

const BoardList = () => {
    const [url, setUrl] = useState();

    var storage = firebase.storage();
    var storageRef = storage.ref();
  
    var pngRef = storageRef.child('thumbnail/thumb.png');

    const activeStyle = {
        color: 'green',
        fontSize: '2rem'
    };
    turnOnGlobalKeyShortCut(false);

    const database = firebase.database();
    const db = firebase.firestore();

    const readThumbnailFromDB = () => {
        const userId = firebase.auth().currentUser.email;

        db.collection(userId).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.id, " => ", doc.data())
                setUrl(doc.data().thumb_downloadURL); //이걸 배열형태로 해야하는데???
            });
        });
    }

    return (
        <div>BoardList
            <ul>
                <li><NavLink exact to="/" activeStyle={activeStyle}>Home</NavLink></li>
                <li><NavLink to="/app" activeStyle={activeStyle}>app</NavLink></li>
                <li><Button onClick = {logOut}> 로그아웃 </Button></li>
            </ul>
            <hr/>

            <div>
                <Button style={{width: "250px", height: "40px", justifyContent: "left", display: 'flex',}} 
                onClick={() => readThumbnailFromDB()} >
                    Read Thumbnail From DB
                </Button>
            </div>
            
            <div style={{display: 'flex', justifyContent: "left", float: "left", flexDirection: "column", alignItems: "cneter", }}>
                <img src={url} style={{ width: "200px", height: "166px" }}  />
                doc_name1
                2021/05/14 
            </div>

            <div style={{display: 'flex', justifyContent: "left", float: "left", flexDirection: "column", alignItems: "cneter", }}>
                <img src={url} style={{ width: "200px", height: "166px" }}  />
                doc_name2
            </div>


        </div>
    );
};

export default BoardList;