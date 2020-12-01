import React from 'react';
import { gapi } from 'gapi-script';
import $ from 'jquery';
import { GoogleLogin } from 'react-google-login';
// import { create } from 'domain';
// import { create } from 'googleapis';
 
export default class Upload extends React.Component {
  
  createMappingInfo = () => {
    var fileContent = '{ "sobp" : { "s":3, "o":281, "b":123, "p":1 }'; // As a sample, upload a text file. 
    var file = new Blob([fileContent], {type: 'text/plain'});
    var metadata = {
        'name': 'maapingInfo.json', // Filename at Google Drive
        'mimeType': 'application/json', // mimeType at Google Drive
        'parents': ['1OWwxwAbzYVV4XQHH4JpOF8tlXWzjFRNo'], // Folder ID at Google Drive
    };
    
    var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.

    var form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', file);
    
    var xhr = new XMLHttpRequest();
    xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.responseType = 'json';
    xhr.onload = () => {
        console.log(xhr.response.id); // Retrieve uploaded file ID.
    };
    xhr.send(form);
  }

  responseGoogle=(response) =>{
    console.log('responese : ' + response);
    console.log(response.profileObj);
  }
  
  render() {
      return (
        <div>
        <button id="upload" onClick={this.createMappingInfo}>
          Upload Mapping Info to Drive
        </button>
          <GoogleLogin 
            clientId="169738066451-5u100n2i6rko17jhmtpvq0bnjuedj7g4.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={this.responseGoogle}
            onFailure={this.responseGoogle}
            cookiePolicy={'single_host_origin'}
          />
        </div>
      )
  }
}