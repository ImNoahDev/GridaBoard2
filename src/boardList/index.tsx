import React, { useEffect, useState } from 'react';
import { Link, NavLink, Redirect, useHistory } from 'react-router-dom';
import { Button, makeStyles } from '@material-ui/core';
import { turnOnGlobalKeyShortCut } from "GridaBoard/GlobalFunctions";
import Cookies from 'universal-cookie';
import "firebase/auth";
import "firebase/database";
import firebase , { auth } from "GridaBoard/util/firebase_config";
import { useSelector } from 'react-redux';
import GridaDoc from '../GridaBoard/GridaDoc';

const logOut = ()=>{
    auth.signOut();
    const cookies = new Cookies();
    cookies.remove("user_email");
}

const BoardList = () => {
    const [url, setUrl] = useState();
    const [docs, setDocs] = useState([]);
    const [userId, setUserId] = useState("");

    const history = useHistory();

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

    useEffect(() => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                // https://firebase.google.com/docs/reference/js/firebase.User
                setUserId(user.email);
            } else {
                // User is signed out
            }
        });
    }, []);

    useEffect(() => {
        if (userId !== "") {
            db.collection(userId).get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    console.log(doc.id, " => ", doc.data())
                    setDocs(docs => [...docs, doc.data()]);
                    setUrl(doc.data().thumb_downloadURL);
                });
            });
        }
    }, [userId])

    const readThumbnailFromDB = () => {
        const userId = firebase.auth().currentUser.email;

        db.collection(userId).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.id, " => ", doc.data())
                setUrl(doc.data().thumb_downloadURL);
            });
        });
    }

    const routeChange = async (i) =>{ 
        let path = `/app`; 
        await history.push(path);

        i.grida_path;
        
        const filename = "2P_test.pdf";
        const url = "./2P_test.pdf";

        const doc = GridaDoc.getInstance();
        doc.openPdfFile({ url, filename });
      }

    return (
        <div>BoardList
            <ul>
                <li><NavLink exact to="/" activeStyle={activeStyle}>Home</NavLink></li>
                <li><NavLink to="/app" activeStyle={activeStyle}>app</NavLink></li>
                <li><Button onClick = {logOut}> 로그아웃 </Button></li>
            </ul>
            <hr/>


            {/* <div>
                <Button style={{width: "250px", height: "40px", justifyContent: "left", display: 'flex',}} 
                onClick={() => readThumbnailFromDB()} >
                    Read Thumbnail From DB
                </Button>
            </div>
             */}
        
            {docs.map((i) => {
                return (
                        <div key={i} style={{display: 'flex', justifyContent: "left", float: "left", flexDirection: "column", alignItems: "cneter", }}
                        onClick={() => routeChange(i)}>
                            <img src={i.thumb_downloadURL} style={{ width: "200px", height: "166px" }}  />
                            {i.doc_name}
                        </div>
                )
            })}

        </div>
    );
};

export default BoardList;