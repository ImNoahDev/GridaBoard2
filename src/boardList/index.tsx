import React, { useEffect, useState } from 'react';
import { Link, NavLink, Redirect, useHistory } from 'react-router-dom';
import { AppBar, Button, makeStyles, MuiThemeProvider } from '@material-ui/core';
import { turnOnGlobalKeyShortCut } from 'GridaBoard/GlobalFunctions';
import Cookies from 'universal-cookie';
import 'firebase/auth';
import 'firebase/database';
import firebase, { auth } from 'GridaBoard/util/firebase_config';
import { useSelector } from 'react-redux';
import GridaDoc from '../GridaBoard/GridaDoc';
import { InkStorage } from '../nl-lib/common/penstorage';
import * as neolabTheme from 'GridaBoard/theme';
import Header from './layout/Header';
import Leftside from './layout/Leftside';
import MainContent from './layout/MainContent';
const useStyle = makeStyles(theme => ({
  mainBackground: {
    width: '100%',
    height: '100%',
    background: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    maxHeight: 'calc(100% - 72px)',
  },
}));

const logOut = () => {
  auth.signOut();
  const cookies = new Cookies();
  cookies.remove('user_email');
};

const BoardList = () => {
  const cookies = new Cookies();
  const [theme, settheme] = useState(neolabTheme.theme);
  const [docsObj, setDocsObj] = useState({
    docs: [],
    category: [],
  });
  const [category, setCategory] = useState('recent');
  // const [userId, setUserId] = useState("");
  const userId = cookies.get('user_email');

  if (userId === undefined) {
    //로그인시 자동으로 넘기기
    return <Redirect to="/" />;
  }
  console.log(userId);

  const history = useHistory();

  var storage = firebase.storage();
  // var storageRef = storage.ref();

  // var pngRef = storageRef.child('thumbnail/thumb.png');

  const activeStyle = {
    color: 'green',
    fontSize: '2rem',
  };
  turnOnGlobalKeyShortCut(false);

  const database = firebase.database();
  const db = firebase.firestore();

  useEffect(() => {
    if (userId !== '') {
      db.collection(userId)
        .get()
        .then(async querySnapshot => {
          const newDocs = [];
          let newCategoryData = null;
          let isCategoryExist = false;

          querySnapshot.forEach(doc => {
            if (doc.id === 'categoryData') {
              newCategoryData = doc.data().data;
              isCategoryExist = true;
            } else {
              newDocs.push(doc.data());
              newDocs[newDocs.length - 1].key = newDocs.length - 1;
            }
          });

          if (!isCategoryExist) {
            await db
              .collection(userId)
              .doc('categoryData')
              .set({
                data: ['Unshelved'],
              });
            newCategoryData = ['Unshelved'];
          }

          setDocsObj({
            docs: newDocs,
            category: newCategoryData,
          });
        });
    }
  }, []);

  const categoryObj = {};
  for (let i = 0; i < docsObj.category.length; i++) {
    categoryObj[docsObj.category[i]] = 0;
  }
  for (let i = 0; i < docsObj.docs.length; i++) {
    let now = docsObj.docs[i];
    categoryObj[now.category] += 1;
  }
  const categoryKey = docsObj.category;

  const readThumbnailFromDB = () => {
    const userId = firebase.auth().currentUser.email;

    db.collection(userId)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log(doc.id, ' => ', doc.data());
          // setUrl(doc.data().thumb_downloadURL);
        });
      });
  };

  const getJSON = async url => {
    try {
      const response = await fetch(url);
      if (!response.ok)
        // check if response worked (no 404 errors etc...)
        throw new Error(response.statusText);

      const data = await response.json(); // get JSON from the response
      return data; // returns a promise, which resolves to this data value
    } catch (error) {
      return error;
    }
  };
  const routeChange = async idx => {
    const nowDocs = docsObj.docs[idx];
    const path = `/app`;
    await history.push(path);

    let url = nowDocs.thumb_downloadURL;
    getJSON(url);

    //firebase storage에 url로 json을 갖고 오기 위해서 CORS 구성이 선행되어야 함(gsutil 사용)
    fetch(nowDocs.grida_path)
      .then(response => response.json())
      .then(async data => {
        const pdfRawData = data.pdf.pdfInfo.rawData;
        const neoStroke = data.stroke;

        const pageInfos = data.pdf.pdfInfo.pageInfos;
        const basePageInfos = data.pdf.pdfInfo.basePageInfos;

        const rawDataBuf = new ArrayBuffer(pdfRawData.length * 2);
        const rawDataBufView = new Uint8Array(rawDataBuf);
        for (let i = 0; i < pdfRawData.length; i++) {
          rawDataBufView[i] = pdfRawData.charCodeAt(i);
        }
        const blob = new Blob([rawDataBufView], { type: 'application/pdf' });
        const url = await URL.createObjectURL(blob);

        const completed = InkStorage.getInstance().completedOnPage;
        completed.clear();

        const gridaArr = [];
        const pageId = [];

        for (let i = 0; i < neoStroke.length; i++) {
          pageId[i] = InkStorage.makeNPageIdStr(neoStroke[i][0]);
          if (!completed.has(pageId[i])) {
            completed.set(pageId[i], new Array(0));
          }

          gridaArr[i] = completed.get(pageId[i]);
          for (let j = 0; j < neoStroke[i].length; j++) {
            gridaArr[i].push(neoStroke[i][j]);
          }
        }

        await GridaDoc.getInstance().openGridaFile(
          { url: url, filename: nowDocs.doc_name },
          pdfRawData,
          neoStroke,
          pageInfos,
          basePageInfos
        );
      });
  };
  console.log(routeChange);

  const selectCategory = (select: string) => {
    console.log(select);
    setCategory(select);
  };

  const classes = useStyle();
  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.mainBackground}>
        <AppBar position="relative" color="transparent" elevation={0}>
          <Header />
        </AppBar>
        <div className={classes.main}>
          <Leftside selected={category} category={categoryObj} categoryKey={categoryKey} selectCategory={selectCategory} />
          <MainContent selected={category} category={categoryObj} docs={docsObj.docs} routeChange={routeChange} />
        </div>
      </div>
    </MuiThemeProvider>
  );
};

export default BoardList;

{
  /* <ul>
<li><NavLink exact to="/" activeStyle={activeStyle}>Home</NavLink></li>
<li><NavLink to="/app" activeStyle={activeStyle}>app</NavLink></li>
<li><Button onClick = {logOut}> 로그아웃 </Button></li>
</ul>
<hr/>


{docs.map((i) => {
return (
  <div key={i} style={{display: 'flex', justifyContent: "left", float: "left", flexDirection: "column", alignItems: "cneter", }}
  onClick={() => routeChange(i)}>
    <img src={i.thumb_downloadURL} style={{ width: "200px", height: "166px" }}  />
    {i.doc_name}
  </div>
)
})} */
}
