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
        const gridaRawData = gridaStruct.pdf.pdfInfo.rawData;
        const neoStroke = gridaStruct.stroke;
        const gridaPageInfo = gridaStruct.pdf.pdfInfo.pageInfo;

        const pageInfo = {
          section: gridaPageInfo.s,
          book: gridaPageInfo.b,
          owner: gridaPageInfo.o,
          page: gridaPageInfo.p
        };

        const pageId = InkStorage.makeNPageIdStr(pageInfo);
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
        doc.openGridaFile({ url: url, filename: file.name }, gridaRawData, neoStroke, pageInfo); 
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
