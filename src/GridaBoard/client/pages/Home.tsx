import React, {useState} from 'react';
import { Redirect } from "react-router-dom";
import Menu from "./Menu";
import { Button } from '@material-ui/core';
import { turnOnGlobalKeyShortCut } from "../../GlobalFunctions";
// import {useCookies} from 'react-cookie';
import Cookies from 'universal-cookie';
import "firebase/firestore";
import "firebase/auth";
import { signInWithGoogle, auth } from "../../util/firebase_config";

const Home = () => {
  turnOnGlobalKeyShortCut(false);
  const cookies = new Cookies();
  const [logined, setLogined] = useState(false);
  const userEmail = cookies.get("user_email");
  // auth.currentUser

  if(userEmail !== undefined || logined){
    //로그인시 자동으로 넘기기
    return (<Redirect to="/about" />);
  }
  // console.log(auth.currentUser);
  // console.log(auth);
  auth.onAuthStateChanged(user => {
    // user.email
    if(user !== null){
      console.log("logined", user);
      user.getIdTokenResult().then(function(result){
        console.log(new Date(result.expirationTime));
        cookies.set("user_email", user.email, {
          expires: new Date(result.expirationTime)
        });
  
        setLogined(true);
      });

    }
  })

  return (
    <div>
      <Menu />
      <div> <img id = "test" /> </div>
      <div>home</div>
      <Button onClick = {
        (e) => {
          signInWithGoogle();
          // loginWithGoogle(setLogined)
        }
      }> 구글 로그인 </Button>
    </div>
  );
};

export default Home;