import React from 'react';
import { gapi } from 'gapi-script';
import $ from 'jquery';
import superagent from 'superagent';
import { request } from 'http';
import { GoogleLogin } from 'react-google-login';
// import { create } from 'domain';
// import { create } from 'googleapis';

// gapi.client.drive.files.create({
//     "name": "settings.txt",
//   }).execute();
// function createFile() {
//   gapi.load('client', function () {
//     gapi.client.load('drive', 'v2', function () {
//         gapi.client.drive.files.create({
//           "name": "settings.txt",
//         }).execute();
//     });
//   });
// }
    // function createFile() {
    //   window.gapi.load('client', function () {
    //     window.gapi.client.load('drive', 'v2', function () {
    //         gapi.client.drive.files.create({
    //           "name": "settings.txt",
    //         }).execute();
    //     });
    //   });
    // }
    // var clientId =
    //   '199553124799-fsa01ovuea7v855aglpjp000qd73h63q.apps.googleusercontent.com';
  
    // // redirect_uri of the project
  
    // var redirect_uri = 'http://localhost:3000/';
  
    // // scope of the project
  
    // var scope = 'https://www.googleapis.com/auth/drive';
  
    // // the url to which the user is redirected to
  
    // var url = '';

    // function signIn(clientId, redirect_uri, scope, url) {
    //   // the actual url to which the user is redirected to
  
    //   url =
    //     'https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=' +
    //     redirect_uri +
    //     '&prompt=consent&response_type=code&client_id=' +
    //     clientId +
    //     '&scope=' +
    //     scope +
    //     '&access_type=offline';
  
    //   // this line makes the user redirected to the url
  
    //   window.location = url;
    // };
  
  //   function createNewFile() {
  //     gapi.client.load('drive', 'v3', function() {
  //         gapi.client.request({
  //             'path': '/drive/v3/files',
  //             'method': 'POST', function () {
  //               gapi.client.files.create({
  //                 "name": "test",
  //                 "uploadType": "multipart",
  //                 "mimeType": "text/plain"
  //               })
  //             }
  //             // 'body':{
  //             //     "name" : "test.txt",
  //                 // "description" : "Some"
  //             // }
  //         }).execute();
  //         // request.execute(function(resp) { console.log(resp); });
  //     });
  // }

function createFile() {
  var parentId = '';//some parentId of a folder under which to create the new folder
  var fileMetadata = {
    'name' : 'New Folder',
    'mimeType' : 'application/vnd.google-apps.folder',
    'parents': [parentId]
  };
  gapi.client.load('drive', 'v3', function() {
    gapi.client.request({
      'path': '/drive/v3/files',
      'method': 'POST', function () {
        gapi.client.files.create({
          resource: fileMetadata,
        })
      }
    }).execute();
  })
  // gapi.client.drive.files.create({
  //   resource: fileMetadata,
  // }).then(function(response) {
  //   switch(response.status){
  //     case 200:
  //       var file = response.result;
  //       console.log('Created Folder Id: ', file.id);
  //       break;
  //     default:
  //       console.log('Error creating the folder, '+response);
  //       break;
  //     }
  // });
}
  // function createNewFile() {
  //   gapi.client.drive.files.create({ "name" : "savefile.txt" }).execute();
  // }

    //   function createNewFile() {
    //   window.gapi.load('client', function () {
    //     window.gapi.client.load('drive', 'v2', function () {
    //         gapi.client.drive.files.create({
    //           "name": "settings.txt",
    //         }).execute();
    //     });
    //   });
    // }
//   function gd_uploadFile(name, contentType, data, callback) {
//     const boundary = '-------314159265358979323846';
//     const delimiter = "\r\n--" + boundary + "\r\n";
//     const close_delim = "\r\n--" + boundary + "--";

//     contentType = contentType || "text/html";
//     var metadata = {
//         name: name,
//         'mimeType': contentType
//     };

//     var multipartRequestBody =
//         delimiter +  'Content-Type: application/json\r\n\r\n' +
//         JSON.stringify(metadata) +
//         delimiter +
//         'Content-Type: ' + contentType + '\r\n';

//     //Transfer images as base64 string.
//     if (contentType.indexOf('image/') === 0) {
//         var pos = data.indexOf('base64,');
//         multipartRequestBody += 'Content-Transfer-Encoding: base64\r\n' + '\r\n' +
//             data.slice(pos < 0 ? 0 : (pos + 'base64,'.length));
//     } else {
//         multipartRequestBody +=  + '\r\n' + data;
//     }
//     multipartRequestBody += close_delim;

//     if (!callback) { callback = function(file) { console.log("Update Complete ", file) }; }

//     superagent.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart').
//         set('Content-Type', 'multipart/form-data;  boundary="' + boundary + '"').
//         set('Authorization', 'Bearer ' + gapi.auth.getToken().access_token).
//         send(multipartRequestBody).
//         end(function () {
//             console.log(arguments);
//         });
// }

// //On upload
// $('#file')[0].onchange = function () {
//     var file = $('#file')[0].files[0];
//     if (file && file.type === 'image/jpeg') {
//         var reader = new FileReader();
//         reader.onloadend = function () {
//             var data = reader.result;
//             gd_uploadFile('img.jpg', 'image/jpeg', data, function () {
//                 console.log(arguments);
//             });
//         }
//         reader.readAsDataURL(file);
//     }
// };

class Upload extends React.Component {
  
  responseGoogle=(response) =>{
    console.log(response);
    console.log(response.profileObj);
    console.log(request);
    console.log(gapi.client.files.create);
  }
  
  render() {
    
      return (
        // <div>
        //     {/* <input id="files" type="file" name="files[]" multiple/> */}
        //     <button id="upload" onClick={createNewFile}>Upload</button>
        //     {/* <div id="progress-wrp">
        //         <div className="progress-bar"></div>
        //         <div className="status">0%</div>
        //     </div> */}
        // </div> 
        // <form>
        //     <span>Upload: </span><input id="file" type="file" name="myFile" />
        // </form>
        <div onClick={createFile}>
          <GoogleLogin 
            clientId="199553124799-fsa01ovuea7v855aglpjp000qd73h63q.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={this.responseGoogle}
            onFailure={this.responseGoogle}
            cookiePolicy={'single_host_origin'}
          />
        </div>
      )
  }
}

export default Upload;