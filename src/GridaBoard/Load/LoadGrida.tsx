import React from 'react';
import { openFileBrowser } from "../../nl-lib/common/neopdf/FileBrowser";
import { InkStorage } from '../../nl-lib/common/penstorage';
import GridaDoc from '../GridaDoc';

const LoadGrida = () => {

  let gridaRawData, neoStroke, gridaPageInfo, gridaInfo;
  
  async function fileOpenHandler() {
    const selectedFile = await openFileBrowser();
    console.log(selectedFile.result);

    if (selectedFile.result === "success") {
      const { url, file } = selectedFile;
      let jsonFile = null;
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function(e) {
        jsonFile = e.target.result;

        const gridaStruct = JSON.parse(jsonFile);
        gridaRawData = gridaStruct.pdf.pdfInfo.rawData;
        neoStroke = gridaStruct.stroke;
        gridaPageInfo = gridaStruct.pdf.pdfInfo.pageInfo;

        let gridaSection, gridaOwner, gridaBook, gridaPage;

        if (neoStroke !== null) {
          for (let i = 0; i < neoStroke.length; i++) {
            gridaSection = neoStroke[i].section;
            gridaOwner = neoStroke[i].owner;
            gridaBook = neoStroke[i].book;
            gridaPage = neoStroke[i].page;
          }
        } else {
          for (let i = 0; i < gridaPageInfo.length; i++) {
            gridaSection = gridaPageInfo.section;
            gridaOwner = gridaPageInfo.owner;
            gridaBook = gridaPageInfo.book;
            gridaPage = gridaPageInfo.page;
          }
        }

        gridaInfo = {
          section: gridaSection,
          book: gridaBook,
          owner: gridaOwner,
          page: gridaPage
        };

        const pageId = InkStorage.makeNPageIdStr(gridaInfo);
        const completed = InkStorage.getInstance().completedOnPage;

        if (!completed.has(pageId)) {
          completed.set(pageId, new Array(0));
        }

        const gridaArr = completed.get(pageId);

        if(neoStroke !== null) {
          for (let i = 0; i < neoStroke.length; i++) {
            gridaArr.push(neoStroke[i]);
          }
        }
        const doc = GridaDoc.getInstance();
        doc.openGridaFile({ url: url, filename: file.name }, gridaRawData, neoStroke, gridaInfo); 
      }
    } else {
        alert("file open cancelled");
    }
  }

  return (
      <button onClick={fileOpenHandler}>
        그리다 로드
      </button>
  );
}

export default LoadGrida;
