import React, {Component, useState, useEffect} from 'react';
import { gapi } from 'gapi-script';
import { GoogleLogin, GoogleLogout } from 'react-google-login';

const CLIENT_ID = '169738066451-5u100n2i6rko17jhmtpvq0bnjuedj7g4.apps.googleusercontent.com';

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

    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('user log out ');
    });
    auth2.disconnect();

  }

  handleLoginFailure (resp) {
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
          />
        }
      </div>
    )
  }
}
export default GoogleBtn;