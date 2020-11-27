import React from 'react';
import { gapi } from 'gapi-script';
// import { drive, client } from 'gapi.client.drive';


// interface Status {
//   drive: any,
//   files: any
// }

// function createFile() {
//   var parentId = '';//some parentId of a folder under which to create the new folder
//   var fileMetadata = {
//     'name' : 'New Folder',
//     'mimeType' : 'application/vnd.google-apps.folder',
//     'parents': [parentId]
//   };
//   gapi.client.drive.files.create({
//     resource: fileMetadata,
//   }).then(function(response) {
//     switch(response.status){
//       case 200:
//         var file = response.result;
//         console.log('Created Folder Id: ', file.id);
//         break;
//       default:
//         console.log('Error creating the folder, '+response);
//         break;
//       }
//   });
// }


// function createNewFile() {
//   gapi.client.load('drive', 'v2', function() {
//       var request = gapi.client.request({
//           'path': '/drive/v2/files',
//           'method': 'POST',
//           'body':{
//               "title" : "test.txt",
//               "description" : "Some"
//           }
//       });
//       request.execute(function(resp) { console.log(resp); });
//   });
// }
// var file_metadata = {
//   'name': 'project_test',
//   'mimeType': 'application/vnd.google-apps.folder'
// }

// gapi.client.drive().create()
gapi.load('client', function () {
  gapi.client.load('drive', 'v2', function () {
      gapi.client.drive.files.create({
        "name": "settings.txt",
      }).execute();
  });
});

window.onload = function() {

  // var service = gapi.client.load('drive', 'v3');

  var request = {
    'client_id': '199553124799-fsa01ovuea7v855aglpjp000qd73h63q.apps.googleusercontent.com',
    'scope': 'https://www.googleapis.com/auth/drive'
  }
  gapi.load('client', function () {
    gapi.client.load('drive', 'v2', function () {
        gapi.client.drive.files.create({
          "name": "settings.txt",
        }).execute();
    });
  });
  // gapi.client.drive.files.create({
  //   "name": "settings.txt",
  // }).execute();
}


// function updateFileContent(fileId, contentBlob, callback) {
//   var xhr = new XMLHttpRequest();
//   xhr.responseType = 'json';
//   xhr.onreadystatechange = function() {
//     if (xhr.readyState != XMLHttpRequest.DONE) {
//       return;
//     }
//     callback(xhr.response);
//   };
//   xhr.open('PATCH', 'https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media');
//   xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
//   xhr.send(contentBlob);
// }

// var CLIENT_ID = '199553124799-fsa01ovuea7v855aglpjp000qd73h63q.apps.googleusercontent.com'; 
// var SCOPES = ['https://www.googleapis.com/auth/drive'];

// function checkAuth() {
//   gapi.auth.authorize(
//     {
//       'client_id': CLIENT_ID,
//       'scope': SCOPES.join(' '),
//       'immediate': true
//     }, handleAuthResult()
//   );
// }

// function handleAuthResult(authResult) {
//   if(authResult && !authResult.error) {
//     loadDriveApi();
//   } else {
//     console.error('failed');
//   }
// }

// function loadDriveApi() {
//   gapi.client.load('drive', 'v3', listFiles);
// }

// function listFiles() { 
//   var request = gapi.client.drive.files.list({ 
//     'pageSize': 10, 
//     'fields': "nextPageToken, files(id, name)"
//   }); 
  
//   request.execute(function(resp) { 
//     appendPre('Files:'); 
//     var files = resp.files; 
//     if (files && files.length > 0) { 
//       for (var i = 0; i < files.length; i++) { 
//         var file = files[i]; 
//         appendPre(file.name + ' (' + file.id + ')');
//       } 
//     } else { 
//       appendPre('No files found.');
//     } 
//   }); 
// } 

// function appendPre(message) { 
//   var pre = document.getElementById('output');
//    var textContent = document.createTextNode(message + '\n');
//     pre.appendChild(textContent); 
//   }
// function load() {
//   // CLIENT_ID is an id you will need to get through the google developer console
//   // DISCOVERY_DOCS is an array [], can be empty in most cases
//   // SCOPES list of scopes seperated by spaces, propably one of those: https://www.googleapis.com/auth/drive.appdata or https://www.googleapis.com/auth/drive.appdata or https://www.googleapis.com/auth/drive.file
//   drive.load("199553124799-fsa01ovuea7v855aglpjp000qd73h63q.apps.googleusercontent.com",  "https://www.googleapis.com/auth/drive").then(() => {
//       console.log("google client loaded");
//       create();
//   });
// }

// function isLoggedIn() {
//   if(drive.isLoggedIn()) {
//       console.log("user is logged in");
//       create();
//   } else {
//       console.log("user is NOT logged in");
//   }
// }

// function login() {
//   drive.login().then(() => {
//       console.log("login successfull");
//   })
// }

// function create() {
//   drive.create("test-file.json").then((data) => {
//       // file created
//       var fileMetadata = {
//             'name' : 'New Folder',
//             'mimeType' : 'application/vnd.google-apps.folder'
//           };
//       // the id of the file is in fileId
//       let fileId = data.result.id;
      
//       // push some content into the file
//       drive.update(fileId, "Test-Content")
//   });
// }

// function list() {
//   drive.list().then((data) => {
//       // all files where you have access to
//       let files = data.result.files;
      
//       // download the content of each file
//       files.forEach(file => {
//           drive.download(file.id).then((data) => {
//               file.content = data.body;
//           })
//       });
//   });
// }

// function deleteFile(id) {
//   drive.delete(id).then(() => {
//       // deletet file with given id
//   });
// }


class Upload extends React.Component {
  
  // constructor(props) {
  //   super(props);

  //   this.state = {
  //     load: []
  //   };

  //   this.createNewFile = this.createNewFile.bind(this);
  //   this.updateFileContent = this.updateFileContent.bind(this);
  // }

  // createNewFile = () => {
  //   gapi.client.load('drive', 'v2', function() {
  //       var request = gapi.client.request({
  //           'path': '/drive/v2/files',
  //           'method': 'POST',
  //           'body':{
  //               "title" : "test.txt",
  //               "description" : "Some"
  //           }
  //       });
  //       request.execute(function(resp) { console.log(resp); });
  //   });
  // }
  
  // updateFileContent = (fileId, contentBlob, callback) => {
  //   var xhr = new XMLHttpRequest();
  //   xhr.responseType = 'json';
  //   xhr.onreadystatechange = function() {
  //     if (xhr.readyState != XMLHttpRequest.DONE) {
  //       return;
  //     }
  //     callback(xhr.response);
  //   };
  //   xhr.open('PATCH', 'https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media');
  //   xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
  //   xhr.send(contentBlob);
  // }
  render() {
      return (
        <div>
            {/* <input id="files" type="file" name="files[]" multiple/> */}
            <button id="upload">Upload</button>
            {/* <div id="progress-wrp">
                <div className="progress-bar"></div>
                <div className="status">0%</div>
            </div> */}
        </div> 
      )
  }
}

export default Upload;