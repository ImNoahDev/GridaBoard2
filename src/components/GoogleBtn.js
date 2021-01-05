/*global chrome*/
import React, {Component, useState, useEffect} from 'react';
import { gapi } from 'gapi-script';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
// import { MappingStorage } from "../ncodepod/SurfaceMapper/MappingStorage";

const API_KEY = "AIzaSyCaphl32v2wLhrjuoWJjD_gXmhPTOWLZvs";
const CLIENT_ID = '169738066451-5u100n2i6rko17jhmtpvq0bnjuedj7g4.apps.googleusercontent.com';
const SCOPE = "https://www.googleapis.com/auth/drive";
const DISCOVERY = "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";

class GoogleBtn extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLogined:false,
      accessToken:''
    };

    this.login = this.login.bind(this);
    this.handleLoginFailure = this.handleLoginFailure.bind(this);
    this.logout = this.logout.bind(this);
    this.handleLogoutFailure = this.handleLogoutFailure.bind(this);
  }

  componentDidMount() {
    // var self = this;
    // gapi.load('auth2', function() {
    //   var gauth = gapi.auth2.init({
    //       client_id: {CLIENT_ID}
    //   });

    //   gauth.then(function(){
    //     console.log('gauth init success');
    //       if (gauth.isSignedIn.get()) {
    //         self.setState({isLogined : true});
    //         console.log('로그인 상태');
    //       } else {
    //         self.setState({isLogined : false});
    //         console.log('로그아웃 상태');
    //       }
    //     }, function(){
    //     console.error('gauth init fail');
    //   });
    // });

    // google api client init
    gapi.load("client:auth2", () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPE,
        discoveryDocs: [DISCOVERY],
      }).then(
        console.log("google api client init complite")
      );
    });
  }

  componentDidUpdate() {
    // if (this.state.isLogined) {
    //   this.readMappingInfo();
    // }
  }

  readMappingInfo = () => {
    gapi.load('client', function () {
      gapi.client.load('drive', 'v2', async function () {
        const fileResponse = await gapi.client.drive.files.list();
        const files = fileResponse.result.items;

        if (files && files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.title === 'mappingInfo.json') {
              const fileId = file.id;
              const getFileRequest = gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
              })

              getFileRequest.then(await function(response) {
                const currentMappingObj = JSON.parse(response.body);
                const content = JSON.stringify(currentMappingObj);
                console.log(content);
              }, function(error) {
                console.error(error)
              })
              break;
            }
          }
        }
      });
    });
  }

  login (resp) {
    if(resp.accessToken) {
      this.setState(state => ({
        isLogined: true,
        accessToken: resp.accessToken
      }));
    }
  }

  logout (resp) {
    this.setState(state => ({
      isLogined: false,
      accessToken: ''
    }));

    const auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('user log out ');
    });
    auth2.disconnect();
  }

  handleLoginFailure (resp) {
    console.log('why login fail?');
  }
  handleLogoutFailure (resp) {
    console.log('why logout fail?');
  }

  render () {
    return (
      <div>
        {this.state.isLogined ?
          <GoogleLogout
          clientId = {CLIENT_ID}
          buttonText = 'Logout'
          onLogoutSuccess={this.logout}
          onFailure={this.handleLogoutFailure}
          ></GoogleLogout>:
          <GoogleLogin
            clientId = {CLIENT_ID}
            buttonText="Login"
            onSuccess={this.login}
            onFailure={this.handleLoginFailure}
            cookiePolicy={'single_host_origin'}
            responseType='code,token'
            prompt='select_account'
          />
        }
      </div>
    )
  }
}
export default GoogleBtn;