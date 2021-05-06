import React, {useState} from 'react';
import { Redirect } from "react-router-dom";
import Menu from "./Menu";
import { Button } from '@material-ui/core';
import { turnOnGlobalKeyShortCut } from "../../GlobalFunctions";
// import {useCookies} from 'react-cookie';
import Cookies from 'universal-cookie';


const baseUri = "https://apis.neolab.net";
const googldClientID = "z9eoij9euvfeu07tvgrzwpk7x4uyhj9k@117.application.neolab.net";
const googleClientSecret = "oqDU0a2FfWZvD7AFrdQA4zmpp81MzAEk";
const getTockenSuccess = (tokenData, setLogined) => {
  const cookies = new Cookies();
  // var a = cookies.getAll();

  cookies.set("loginToken", JSON.stringify(tokenData), {
    maxAge: tokenData.expires_in
  });
  cookies.set("access_token", tokenData.access_token, {
    maxAge: tokenData.expires_in
  });
  const prifileUri = "/profile/v1/me";


  const xhr = new XMLHttpRequest();

  xhr.open("GET", baseUri + prifileUri, true);
  xhr.setRequestHeader("Authorization", "Bearer " + tokenData.access_token);
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4) {
      const response = xhr.response;
      let data = JSON.parse(response);

      cookies.set("user_id", data.id, {
        maxAge: tokenData.expires_in
      });
      cookies.set("user_name", data.name, {
        maxAge: tokenData.expires_in
      });
      setLogined(true);
    }
  }
  xhr.send();
}

const loginWithGoogleGetTocken = (code, setLogined) => {
  //로그인 완료
  //토큰 받기 및 토큰 저장등을 여기서 해야 함
  //await으로 하면 될듯
  const oauthToken = "/oauth/token";

  const xhr = new XMLHttpRequest();

  xhr.open("POST", baseUri + oauthToken, true);
  xhr.setRequestHeader("accept", "application/json");
  xhr.setRequestHeader("Authorization", btoa(`${googldClientID}:${googleClientSecret}`));
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4) {
      const response = xhr.response;
      let data = JSON.parse(response);
      getTockenSuccess(data, setLogined);
    }
  }
  xhr.send(`code=${code}&client_id=${googldClientID}&client_secret=${googleClientSecret}&grant_type=authorization_code&redirect_uri=http://127.0.0.1:3000/loginCheck`);
}
const loginWithGoogle = (setLogined) => {
  const googldClientID = "z9eoij9euvfeu07tvgrzwpk7x4uyhj9k@117.application.neolab.net";
  // const secretKey = "oqDU0a2FfWZvD7AFrdQA4zmpp81MzAEk";
  // const authorizationRequest = `${baseUri}/login_social/${googldClientID}?redirect_uri=${window.location.href}loginCheck`;
  // const authorizationRequest = `${baseUri}/login_social/${googldClientID}?redirect_uri=http://127.0.0.1:3000/loginCheck`;
  const authorizationRequest = `${baseUri}/oauth/authorize?response_type=code&client_id=${googldClientID}&scope=storage.read profile.read profile.write storage.write neostudio.read storage.admin.read userdata.write userdata.read storage.admin.write&redirect_uri=http://127.0.0.1:3000/loginCheck`;
  const popup = open(authorizationRequest, "_blank", "width = 500, height = 800, top = 0, left = 0, location = no");

  function receiveMessage(event) {
    //origin 체크
    if (event.origin !== window.location.origin)
      return;

    //모든 postMessage가 들어오기때문에 login 데이터인지 체크
    if (event.data.constructor !== String || event.data.indexOf("login/") === -1)
      return;


    popup.close();

    let code = event.data.substr(6); //   login/~~~~~~으로 들어오도록 하였기 때문에 빼준다

    loginWithGoogleGetTocken(code, setLogined);
  }
  window.addEventListener("message", receiveMessage);

  const interval = setInterval(function () {
    //팝업 종료 자동 감지
    //onbeforeunload로 하려 했으나, popup내부가 계속 바뀌어 이벤트가 증발함
    if (popup.closed) {
      clearInterval(interval);
      window.removeEventListener("message", receiveMessage);
    }
  }, 500);
}


const Home = () => {
  turnOnGlobalKeyShortCut(false);
  const cookies = new Cookies();
  const [logined, setLogined] = useState(false);
  const access_token = cookies.get("access_token");

  if(access_token !== undefined || logined){
    //로그인시 자동으로 넘기기
    return (<Redirect to="/about" />);
  }

  return (
    <div>
      <Menu />
      <div> <img id = "test" /> </div>
      <div>home</div>
      <Button onClick = {
        (e) => {
          loginWithGoogle(setLogined)
        }
      }> 구글 로그인 </Button>
    </div>
  );
};

export default Home;