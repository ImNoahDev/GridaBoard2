import React from 'react';
import { gapi } from 'gapi-script';
import { GoogleLogin } from 'react-google-login';
import * as PdfJs from "pdfjs-dist";

import { resolve } from 'path';

var FOLDER_ID = "root";

export default class Upload extends React.Component {
  
  mappingInfoUploadProcess = async () => {
    var self = this;
    var folderId;
    gapi.load('client', function () {
      gapi.client.load('drive', 'v2', async function () {
        const folderResponse = await gapi.client.drive.files.list({
          q: "mimeType = 'application/vnd.google-apps.folder'" //폴더만 걸러주는 filter
        })

        var folders = folderResponse.result.items;
        var isGridaFolderExist = false;

        if (folders && folders.length > 0) {
          for (var i = 0; i < folders.length; i++) {
            var folder = folders[i];
            if (folder.title === 'Grida') {
              isGridaFolderExist = true;
              folderId = folderId;
            }
          }
        }

        if (isGridaFolderExist) {
          //mappingInfo.json 있는지 확인 후 없으면
          const fileResponse = await gapi.client.drive.files.list();
          var files = fileResponse.result.items;
          var isMappingFileExist = false;
          if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (file.title === 'mappingInfo.json') {
                var fileId = file.id;
                var getFileRequest = gapi.client.drive.files.get({
                  fileId: fileId,
                  alt: 'media'
                })
                var content = `
                  {"sobp" : {"s":3,"o":281,"b":123,"p":2},
                   "pdf_info" : {"file_name" : "filename","fp" : "finger print"}
                  }
                `; //여기에다가 새로운 content 내용을 받을거야
                getFileRequest.then(await function(response) {

                  var currentMappingObj = JSON.parse(response.body);
                  var newMappingObj = JSON.parse(content);

                  currentMappingObj.mapping_info.push(newMappingObj);
                  
                  content = JSON.stringify(currentMappingObj);
                  
                  var contentBlob = new Blob([content], {'type': 'application/json'});
                  self.updateMappingInfo(fileId, contentBlob, function(resp) {
                  });
                }, function(error) {
                  console.error(error)
                })
                isMappingFileExist = true;
                break;
              } 
              if (!isMappingFileExist) {
                self.createNewMappingInfo(folderId);
              }
            }
          }
        }
        else if (!isGridaFolderExist) {
          await self.createGridaFolder();
        }
      });
    });
  }

  updateMappingInfo = (fileId, contentBlob, callback) => {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.onreadystatechange = function() {
      if (xhr.readyState != XMLHttpRequest.DONE) {
        return;
      }
      callback(xhr.response);
    };
    xhr.open('PATCH', 'https://www.googleapis.com/upload/drive/v3/files/' + fileId + '?uploadType=media');
    xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
    xhr.send(contentBlob);
  }

  createNewMappingInfo = async (folderId) => {
    var fileContent = `
    {"mapping_info":[
      {"sobp" : {"s":3,"o":281,"b":123,"p":1},
       "pdf_info" : {"file_name" : "filename","fp" : "finger print"}
      }
    ]}`; //sobp object와 pdf info를 object로 받아서 stringfy해준 뒤 fileContent에 삽입
    var file = new Blob([fileContent], {type: 'text/plain'});
    var metadata = {
        'name': 'mappingInfo.json', // Filename at Google Drive
        'mimeType': 'application/json', // mimeType at Google Drive
        'parents': [folderId], // Folder ID at Google Drive
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
        console.log('mapping info file id : ');
        console.log(xhr.response.id); // Retrieve uploaded file ID.
    };
    xhr.send(form);
  }

  createGridaFolder = async () => {
    var self = this;
    var access_token = gapi.auth.getToken().access_token;

    var request = gapi.client.request({
        'path': '/drive/v2/files/',
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token,             
        },
        'body':{
            "title" : "Grida",
            "mimeType" : "application/vnd.google-apps.folder",
        }
    });

    request.execute(await function(resp) { 
      self.createNewMappingInfo(resp.id);
    });
  }

  listFiles = () => {
    gapi.load('client', function () {
      gapi.client.load('drive', 'v2', function () {

        var fileId = "";

        gapi.client.drive.files.list({
          'pageSize': 10,
          'fields': "*"
        }).then(function(response) {
          console.log(response);
          var files = response.result.items;
          console.log(response.result.items);
    
          if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              if (file.title === 'hi.pdf') {
                console.log('file : ');
                console.log(file);
                fileId = file.id;
              }
            }
          }

          var request = gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media'
          })
          request.then(function(response) {
            console.log(response);
          }, function(error) {
            console.error(error)
          })
        });
      });
    });
  }

  readMappingInfo = () => {

    gapi.load('client', function () {
      gapi.client.load('drive', 'v2', async function () {
        const fileResponse = await gapi.client.drive.files.list();
        var files = fileResponse.result.items;

        if (files && files.length > 0) {
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.title === 'mappingInfo.json') {
              var fileId = file.id;
              var getFileRequest = gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
              })

              getFileRequest.then(await function(response) {
                var currentMappingObj = JSON.parse(response.body);
                var content = JSON.stringify(currentMappingObj);
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

  readPDF = () => {
    gapi.load('client', function () {
      gapi.client.load('drive', 'v2', async function () {
        const fileResponse = await gapi.client.drive.files.list();
        var files = fileResponse.result.items;

        if (files && files.length > 0) {
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fileId = file.id;
            var getFileRequest = gapi.client.drive.files.get({
              fileId: fileId,
              alt: 'media',
            });

            if (file.mimeType === 'application/pdf') {
              console.log(getFileRequest);
              console.log(file.mimeType);

              getFileRequest.then(await function(response) {
                var docInitParams = { data: response.body };
                PdfJs.getDocument(docInitParams).promise.then(function(pdf) {
                  console.log('finger : ');
                  console.log(pdf.fingerprint);
                });
              }, function(error) {
                console.error(error)
              })
            }
          }
        }
      });
    });
  }

  render() {
      return (
        <div>
        <button id="mapping_info_process" onClick={this.mappingInfoUploadProcess}>
          Upload Mapping Info
        </button>
        <button id="read_mapping_info" onClick={this.readMappingInfo}>
          Read Mapping Info
        </button>
        <button id="read_mapping_info" onClick={this.readPDF}>
          Read PDF
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