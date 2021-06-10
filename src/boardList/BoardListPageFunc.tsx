import GridaDoc from 'GridaBoard/GridaDoc';
import { setActivePageNo } from '../GridaBoard/store/reducers/activePageReducer';
import { setIsNewDoc } from '../GridaBoard/store/reducers/docConfigReducer';
import firebase from 'GridaBoard/util/firebase_config';
import { IBoardData } from './structures/BoardStructures';
import { DeveloperBoardRounded, DoubleArrowRounded } from '@material-ui/icons';

export const addNewPage = async () => {
  const doc = GridaDoc.getInstance();
  doc.pages = [];

  const pageNo = await doc.addBlankPage();
  setActivePageNo(pageNo);

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

export const getTimeStamp = (created: {nanoseconds: number, seconds: number}) => {
  const nano_sec = Number(created.nanoseconds) / 1000000;
  let nano_sec_str = nano_sec.toString();
  nano_sec_str = nano_sec_str.padStart(3,'0'); //firstore에서 nano는 3자리 채워서 들어감

  const sec = created.seconds.toString();
  return sec + nano_sec_str;
}