/* eslint-disable no-unused-vars */
import { gapi } from 'gapi-script';
import * as PdfJs from "pdfjs-dist";
import { MappingStorage } from "./NcodePrintLib/SurfaceMapper";

const FOLDER_ID = "root";

export async function uploadMappingInfo(content) {
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
            folderId = folder.id;
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
              const fileRequest = gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
              })

              fileRequest.then(await function(response) {
                const currentMappingObj = JSON.parse(response.body);

                currentMappingObj.code.last = content.code.last;
                currentMappingObj.code.next = content.code.next;
                currentMappingObj.map = currentMappingObj.map.concat(content.map);

                const contentStr = JSON.stringify(currentMappingObj);
                const contentBlob = new Blob([contentStr], {'type': 'application/json'});
                updateMappingInfo(fileId, contentBlob, function(resp) {
                  console.log("updateMappingInfo callback");
                });
              }, function(error) {
                console.error(error)
              })
              isMappingFileExist = true;
              break;
            }
            if (!isMappingFileExist) {
              createNewMappingInfo(folderId, content);
            }
          }
        }
      }
      else if (!isGridaFolderExist) {
        createGridaFolder(content);
      }
    });
  });
}

export async function updateMappingInfo(fileId, contentBlob, callback) {
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

export async function createNewMappingInfo(folderId, content) {
  const mappingInfoObj = {
    "code" : {
      "last" : content.code.last,
      "next" : content.code.next,
    },
    "map" : content.map
  }

  const mappingInfoStr = JSON.stringify(mappingInfoObj);

  const file = new Blob([mappingInfoStr], {type: 'text/plain'});
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

export async function createGridaFolder(content) {
  const access_token = gapi.auth.getToken().access_token;
  gapi.client.request(await {
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
  }).execute(await function(resp) {
    createNewMappingInfo(resp.id, content); //resp.id는 folder id
  });
}

export async function readMappingInfo() {
  gapi.load('client', function () {
    gapi.client.load('drive', 'v2', async function () {
      const fileResponse = await gapi.client.drive.files.list();
      const files = fileResponse.result.files;

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.name === 'mappingInfo.json') {
            const fileId = file.id;
            const fileRequest = gapi.client.drive.files.get({
              fileId: fileId,
              alt: 'media'
            })

            fileRequest.then(await function(response) {
              MappingStorage.getInstance().setTestStorage(response.body);

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