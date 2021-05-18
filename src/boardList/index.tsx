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
import { InkStorage } from '../nl-lib/common/penstorage';

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

    const activeStyle = {
        color: 'green',
        fontSize: '2rem'
    };
    turnOnGlobalKeyShortCut(false);

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

    const getJSON = async url => {
        try {
            const response = await fetch(url);
            if(!response.ok) // check if response worked (no 404 errors etc...)
            throw new Error(response.statusText);
        
            const data = await response.json(); // get JSON from the response
            return data; // returns a promise, which resolves to this data value
        } catch(error) {
            return error;
        }
    }

    const routeChange = async (i) =>{ 
        const path = `/app`; 
        await history.push(path);

        getJSON(url);

        //firebase storage에 url로 json을 갖고 오기 위해서 CORS 구성이 선행되어야 함(gsutil 사용)
        fetch(i.grida_path)
        .then(response => response.json())
        .then(async (data) => {
            const pdfRawData = data.pdf.pdfInfo.rawData;
            const neoStroke = data.stroke;

            const pageInfos = data.pdf.pdfInfo.pageInfos;
            const basePageInfos = data.pdf.pdfInfo.basePageInfos;

            const rawDataBuf = new ArrayBuffer(pdfRawData.length*2);
            const rawDataBufView = new Uint8Array(rawDataBuf);
            for (let i = 0; i < pdfRawData.length; i++) {
              rawDataBufView[i] = pdfRawData.charCodeAt(i);
            }
            const blob = new Blob([rawDataBufView], {type: 'application/pdf'});
            const url = await URL.createObjectURL(blob);

            const completed = InkStorage.getInstance().completedOnPage;
            completed.clear();
      
            const gridaArr = [];
            const pageId = []
      
            for (let i = 0; i < neoStroke.length; i++) {
      
              pageId[i] = InkStorage.makeNPageIdStr(neoStroke[i][0]);
              if (!completed.has(pageId[i])) {
                completed.set(pageId[i], new Array(0));
              }
      
              gridaArr[i] = completed.get(pageId[i]);
              for (let j = 0; j < neoStroke[i].length; j++){
                gridaArr[i].push(neoStroke[i][j]);
              }
            }

            await GridaDoc.getInstance().openGridaFile(
                { url: url, filename: i.doc_name }, pdfRawData, neoStroke, pageInfos, basePageInfos);
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