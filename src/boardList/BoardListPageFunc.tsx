import GridaDoc from 'GridaBoard/GridaDoc';
import { setActivePageNo } from '../GridaBoard/store/reducers/activePageReducer';
import { setDocName, setIsNewDoc } from '../GridaBoard/store/reducers/docConfigReducer';
import firebase, { auth } from 'GridaBoard/util/firebase_config';
import { IBoardData } from './structures/BoardStructures';
import { saveToDB } from '../GridaBoard/Save/SaveThumbnail';
import { MappingStorage } from '../nl-lib/common/mapper';
import { InkStorage } from '../nl-lib/common/penstorage';
import Cookies from 'universal-cookie';

export const startNewGridaPage = async () => {
  const doc = GridaDoc.getInstance();
  doc.pages = [];
  doc._pdfd = [];
  
  MappingStorage.getInstance().resetTemporary();
  InkStorage.getInstance().resetStrokes();

  const pageNo = await doc.addBlankPage();
  setActivePageNo(pageNo);
  setDocName('undefined');
  setIsNewDoc(true);
}

export const deleteAllFromTrash = async () => {
  const docArr = [];
  const db = firebase.firestore();
  const userId = firebase.auth().currentUser.email;

  //delete from db
  await db.collection(userId)
  .get()
  .then(async querySnapshot => {
    querySnapshot.forEach(doc => {
      if (doc.data().dateDeleted > 0) {
        docArr.push(doc.data())
      }
    });
  })


  //delete from storage
  const storageRef = firebase.storage().ref();

  let result = 0;

  for await (const el of docArr) {
    const m_sec = getTimeStamp(el.created);
    // const deletedDocId = `${userId}_${el.doc_name}_${m_sec}`;
    const deletedDocId = el.docId;

    await db.collection(userId)
    .doc(deletedDocId).delete().then(() => {
      result = 1;
    }).catch((error) => {
      console.error("error removing document: " , error);
      result = 0;
    });

      
    const thumbnailRef = storageRef.child(`thumbnail/${deletedDocId}.png`);
    thumbnailRef.delete().then(function() {
      // File deleted successfully
    }).catch(function(error) {
      // Uh-oh, an error occurred!
    });

    const gridaRef = storageRef.child(`grida/${deletedDocId}.grida`);
    gridaRef.delete().then(function() {
      // File deleted successfully
    }).catch(function(error) {
      // Uh-oh, an error occurred!
    });

  }

  return result;
}

export const deleteBoardFromLive = async (docItems: IBoardData[]) => {
  const userId = firebase.auth().currentUser.email;
  const db = firebase.firestore();

  let result = 0;

  for await (const docItem of docItems) {
    const docName = docItem.doc_name;
    const m_sec = getTimeStamp(docItem.created);
    // const docId = `${userId}_${docName}_${m_sec}`;
    const docId = docItem.docId;

    await db.collection(userId)
    .doc(docId)
    .update({
      dateDeleted : Date.now(),
    }).then(() => {
      result = 1;
    }).catch((error) => {
      console.error("error updating document: ", error);
      result = 0;
    });
  }
  return result;
}

export const deleteBoardsFromTrash = async (docItems: IBoardData[]) => {
  const db = firebase.firestore();
  const userId = firebase.auth().currentUser.email;

  let result = 0;

  for await (const docItem of docItems) {
    const docName = docItem.doc_name;
    if (docName === undefined) continue;
    const m_sec = getTimeStamp(docItem.created);
    // const docId = `${userId}_${docName}_${m_sec}`;
    const docId = docItem.docId;
  
    await db.collection(userId)
    .doc(docId)
    .delete()
    .then(() => {
      result = 1;
    }).catch((error) => {
      console.error("error delete document: ", error);
      result = 0;
    });
  }

  return result;
}

export const restoreBoardsFromTrash = async (docItems: IBoardData[]) => {
  const db = firebase.firestore();
  const userId = firebase.auth().currentUser.email;

  let result = 0;

  for await (const docItem of docItems) {
    const docName = docItem.doc_name;
    if (docName === undefined) continue;
    const m_sec = getTimeStamp(docItem.created);
    // const docId = `${userId}_${docName}_${m_sec}`;
    const docId = docItem.docId;
  
    await db.collection(userId)
    .doc(docId)
    .update({
      dateDeleted : 0,
    }).then(() => {
      result = 1;
    }).catch((error) => {
      console.error("error updating document: ", error);
      result = 0;
    });
  }

  return result;
}

export const copyBoard = async (docItem: IBoardData) => {
  const db = firebase.firestore();
  const userId = firebase.auth().currentUser.email;

  const docName = docItem.doc_name;
  const date = new Date();
  const timeStamp = date.getTime();
  const docId = `${userId}_${docName}_${timeStamp}`;
  
  const srcGridaPath = docItem.grida_path; //얘를 다운받아서 
  const srcThumbPath = docItem.thumb_path;

  let imageBlob;
  await fetch(srcThumbPath)
  .then(res => { return res.blob(); })
  .then(async data => {
    imageBlob = data;
  })

  await fetch(srcGridaPath)
  .then(res => res.json())
  .then(async data => {
    
    console.log('hihi');
    const gridaStr = JSON.stringify(data);
    const gridaBlob = new Blob([gridaStr], { type: 'application/json' });

    const storageRef = firebase.storage().ref();
    const gridaFileName = `${docId}.grida`;
    const gridaRef = storageRef.child(`grida/${gridaFileName}`);

    const gridaUploadTask = gridaRef.put(gridaBlob);
    await gridaUploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      function (snapshot) {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Grida Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
      },
      function (error) {
        switch (error.code) {
          case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
  
          case 'storage/canceled':
            // User canceled the upload
            break;
  
          case 'storage/unknown':
            // Unknown error occurred, inspect error.serverResponse
            break;
        }
      },
      async function () {
        gridaUploadTask.snapshot.ref.getDownloadURL().then(async function (downloadURL) {
          const grida_path = downloadURL;
  
          const thumbFileName = `${userId}_${docName}_${timeStamp}.png`;
          const pngRef = storageRef.child(`thumbnail/${thumbFileName}`);
  
          const thumbUploadTask = pngRef.put(imageBlob);
          await thumbUploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            function (snapshot) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Thumbnail Upload is ' + progress + '% done');
              switch (snapshot.state) {
                case firebase.storage.TaskState.PAUSED: // or 'paused'
                  console.log('Upload is paused');
                  break;
                case firebase.storage.TaskState.RUNNING: // or 'running'
                  console.log('Upload is running');
                  break;
              }
            },
            function (error) {
              switch (error.code) {
                case 'storage/unauthorized':
                  // User doesn't have permission to access the object
                  break;
  
                case 'storage/canceled':
                  // User canceled the upload
                  break;
  
                case 'storage/unknown':
                  // Unknown error occurred, inspect error.serverResponse
                  break;
              }
            },
            async function () {
              thumbUploadTask.snapshot.ref.getDownloadURL().then(async function (thumb_path) {
                saveToDB(docName, thumb_path, grida_path, date, true);
              });
            }
          );
        });
      }
    );
  })
}

export const getTimeStamp = (created: {nanoseconds: number, seconds: number}) => {
  const nano_sec = Number(created.nanoseconds) / 1000000;
  let nano_sec_str = nano_sec.toString();
  nano_sec_str = nano_sec_str.padStart(3,'0'); //firstore에서 nano는 3자리 채워서 들어감

  const sec = created.seconds.toString();
  return sec + nano_sec_str;
}

export const fbLogout = () => {
  auth.signOut();
  const cookies = new Cookies();
  cookies.remove('user_email');
};