/* eslint-disable no-unused-vars */
import React from 'react';
import { gapi } from 'gapi-script';
import { GoogleLogin } from 'react-google-login';
import * as PdfJs from "pdfjs-dist";

import { resolve } from 'path';

const FOLDER_ID = "root";

export default class Upload extends React.Component {
  
  mappingInfoUploadProcess = async () => {
    const self = this;
    let folderId;
    gapi.load('client', function () {
      gapi.client.load('drive', 'v2', async function () {
        const folderResponse = await gapi.client.drive.files.list({
          q: "mimeType = 'application/vnd.google-apps.folder'" //폴더만 걸러주는 filter
        })

        const folders = folderResponse.result.items;
        let isGridaFolderExist = false;

        if (folders && folders.length > 0) {
          for (let i = 0; i < folders.length; i++) {
            const folder = folders[i];
            if (folder.title === 'Grida') {
              isGridaFolderExist = true;
              // folderId = folderId;
            }
          }
        }

        if (isGridaFolderExist) {
          //mappingInfo.json 있는지 확인 후 없으면
          const fileResponse = await gapi.client.drive.files.list();
          const files = fileResponse.result.items;
          let isMappingFileExist = false;
          if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              if (file.title === 'mappingInfo.json') {
                const fileId = file.id;
                const getFileRequest = gapi.client.drive.files.get({
                  fileId: fileId,
                  alt: 'media'
                })
                let content = `
                  {"sobp" : {"s":3,"o":281,"b":123,"p":2},
                   "pdf_info" : {"file_name" : "filename","fp" : "finger print"}
                  }
                `; //여기에다가 새로운 content 내용을 받을거야
                getFileRequest.then(await function(response) {

                  const currentMappingObj = JSON.parse(response.body);
                  const newMappingObj = JSON.parse(content);

                  currentMappingObj.mapping_info.push(newMappingObj);
                  
                  content = JSON.stringify(currentMappingObj);
                  
                  const contentBlob = new Blob([content], {'type': 'application/json'});
                  self.updateMappingInfo(fileId, contentBlob, function(resp) {
                    console.log("updateMappingInfo callback called");
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
    const xhr = new XMLHttpRequest();
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
    const fileContent = `
    {"mapping_info":[
      {"sobp" : {"s":3,"o":281,"b":123,"p":1},
       "pdf_info" : {"file_name" : "filename","fp" : "finger print"}
      }
    ]}`; //sobp object와 pdf info를 object로 받아서 stringfy해준 뒤 fileContent에 삽입
    const file = new Blob([fileContent], {type: 'text/plain'});
    const metadata = {
        'name': 'mappingInfo.json', // Filename at Google Drive
        'mimeType': 'application/json', // mimeType at Google Drive
        'parents': [folderId], // Folder ID at Google Drive
    };
    
    const accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', file);
    
    const xhr = new XMLHttpRequest();
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
    const self = this;
    const access_token = gapi.auth.getToken().access_token;

    const request = gapi.client.request({
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

        let fileId = "";

        gapi.client.drive.files.list({
          'pageSize': 10,
          'fields': "*"
        }).then(function(response) {
          console.log(response);
          const files = response.result.items;
          console.log(response.result.items);
    
          if (files && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              if (file.title === 'hi.pdf') {
                console.log('file : ');
                console.log(file);
                fileId = file.id;
              }
            }
          }

          const request = gapi.client.drive.files.get({
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

  readPDF = () => {
    gapi.load('client', function () {
      gapi.client.load('drive', 'v2', async function () {
        const fileResponse = await gapi.client.drive.files.list();
        const files = fileResponse.result.items;

        if (files && files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileId = file.id;
            const getFileRequest = gapi.client.drive.files.get({
              fileId: fileId,
              alt: 'media',
            });

            if (file.mimeType === 'application/pdf') {
              console.log(getFileRequest);
              console.log(file.mimeType);

              getFileRequest.then(await function(response) {
                const docInitParams = { data: response.body };
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