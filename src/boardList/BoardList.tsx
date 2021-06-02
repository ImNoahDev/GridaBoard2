import React, { useEffect, useState } from 'react';
import { Link, NavLink, Redirect, useHistory } from 'react-router-dom';
import { AppBar, Button, makeStyles, MuiThemeProvider } from '@material-ui/core';
import { turnOnGlobalKeyShortCut } from 'GridaBoard/GlobalFunctions';
import Cookies from 'universal-cookie';
import 'firebase/auth';
import 'firebase/database';
import firebase, { auth } from 'GridaBoard/util/firebase_config';
import { useDispatch, useSelector } from 'react-redux';
import GridaDoc from '../GridaBoard/GridaDoc';
import { InkStorage } from '../nl-lib/common/penstorage';
import * as neolabTheme from 'GridaBoard/theme';
import Header from './layout/Header';
import Leftside from './layout/Leftside';
import MainContent from './layout/MainContent';
import { setDate, setDocName, setIsNewDoc } from '../GridaBoard/store/reducers/docConfigReducer';
import { RootState } from '../GridaBoard/store/rootReducer';

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
console.log(logOut);


const BoardList = () => {
  const cookies = new Cookies();
  const [theme, settheme] = useState(neolabTheme.theme);
  const [docsObj, setDocsObj] = useState({
    docs: [],
    category: [],
  });
  const [category, setCategory] = useState('recent');
  const userId = cookies.get('user_email');

  
  const history = useHistory();
  const dispatch = useDispatch();

  const updateCount = useSelector((state: RootState) => state.appConfig.updateCount);

  turnOnGlobalKeyShortCut(false);

  const db = firebase.firestore();
  
  useEffect(() => {
    if (userId !== undefined) {
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
  }, [updateCount]);

  const categoryObj = {};
  for (let i = 0; i < docsObj.category.length; i++) {
    categoryObj[docsObj.category[i]] = 0;
  }
  for (let i = 0; i < docsObj.docs.length; i++) {
    let now = docsObj.docs[i];
    if (now.dateDeleted === 0) {
      categoryObj[now.category] += 1;
    }
  }

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
  
  const createCategory = async (categoryName)=>{
    await db
    .collection(userId)
    .doc('categoryData')
    .get()
    .then(async (res)=>{
      let data:Array<string> = res.data().data;
      if(data.includes(categoryName)){
        console.log("already had")
      }else{
        await db
          .collection(userId)
          .doc('categoryData')
          .set({
            data: [...data, categoryName],
          });

          setDocsObj({
            docs: docsObj.docs,
            category: [...docsObj.category, categoryName],
          });
      }
    })
  }

  const routeChange = async idx => {
    const nowDocs = docsObj.docs[idx];
    if (nowDocs.dateDeleted !== 0) {
      return;
    }
    const path = `/app`;
    await history.push(path);

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

      const doc = GridaDoc.getInstance();
      doc.pages = [];

      await doc.openGridaFile(
        { url: url, filename: nowDocs.doc_name },
        pdfRawData,
        neoStroke,
        pageInfos,
        basePageInfos
        );
        
        setDocName(nowDocs.doc_name);
        setIsNewDoc(false);

        const n_sec = nowDocs.created.nanoseconds.toString().substring(0,3);
        const sec = nowDocs.created.seconds.toString();
        const m_sec = sec + n_sec;
        setDate(m_sec);
    });
  };

  const selectCategory = (select: string) => {
    console.log(select);
    setCategory(select);
  };
  const classes = useStyle();
  
  if (userId === undefined) {
    //로그인으로 자동으로 넘기기
    return <Redirect to="/" />;
  }
  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.mainBackground}>
        <AppBar position="relative" color="transparent" elevation={0}>
          <Header />
        </AppBar>
        <div className={classes.main}>
          <Leftside selected={category} category={categoryObj} categoryKey={docsObj.category} selectCategory={selectCategory} createCategory={createCategory} />
          <MainContent selected={category} category={categoryObj} docs={docsObj.docs} routeChange={routeChange} />
        </div>
      </div>
    </MuiThemeProvider>
  );
};

export default BoardList;