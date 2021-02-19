import React from 'react';
import { openFileBrowser } from "../../nl-lib/common/neopdf/FileBrowser";
import { InkStorage } from '../../nl-lib/common/penstorage';
import GridaDoc from '../GridaDoc';

const LoadGrida = () => {
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
        const gridaRawData = gridaStruct.pdf.pdfInfo.rawData;
        const neoStroke = gridaStruct.stroke;
        const gridaPageInfo = gridaStruct.pdf.pdfInfo.pageInfo;

        const completed = InkStorage.getInstance().completedOnPage;
        completed.clear();

        let gridaArr = [];
        let pageInfo = []
        let pageId = []

        for (let i = 0; i < neoStroke.length; i++) {

          pageInfo[i] = {
            section: gridaPageInfo.s,
            book: gridaPageInfo.b,
            owner: gridaPageInfo.o,
            page: gridaPageInfo.p
          };
          gridaPageInfo.p++;

          pageId[i] = InkStorage.makeNPageIdStr(neoStroke[i][0]);
          if (!completed.has(pageId[i])) {
            completed.set(pageId[i], new Array(0));
          }

          gridaArr[i] = completed.get(pageId[i]);
          for (let j = 0; j < neoStroke[i].length; j++){
            gridaArr[i].push(neoStroke[i][j]);
          } 
        }

        const doc = GridaDoc.getInstance();
        doc.openGridaFile({ url: url, filename: file.name }, gridaRawData, neoStroke, pageInfo[0]); 
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
