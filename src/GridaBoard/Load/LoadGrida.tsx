import React from 'react';
import { openFileBrowser } from "../../nl-lib/common/neopdf/FileBrowser";
import { InkStorage } from '../../nl-lib/common/penstorage';
import GridaDoc from '../GridaDoc';
import { Button } from '@material-ui/core';
import GridaToolTip from "../../styles/GridaToolTip";
import $ from "jquery";

const LoadGrida = () => {
  async function fileOpenHandler() {
    const selectedFile = await openFileBrowser();
    console.log(selectedFile.result);

    if (selectedFile.result === "success") {
      let { url, file } = selectedFile;
      let jsonFile = null;
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = async function(e) {
        jsonFile = e.target.result;

        const gridaStruct = JSON.parse(jsonFile);
        const gridaRawData = gridaStruct.pdf.pdfInfo.rawData;
        const neoStroke = gridaStruct.stroke;
        const gridaPageInfo = gridaStruct.pdf.pdfInfo.pageInfo;

        // pdf의 url을 만들어 주기 위해 rawData를 blob으로 만들어 createObjectURL을 한다
        const rawDataBuf = new ArrayBuffer(gridaRawData.length*2);
        const rawDataBufView = new Uint8Array(rawDataBuf);
        for (let i = 0; i < gridaRawData.length; i++) {
          rawDataBufView[i] = gridaRawData.charCodeAt(i);
        }
        const blob = new Blob([rawDataBufView], {type: 'application/pdf'});
        url = await URL.createObjectURL(blob);

        const completed = InkStorage.getInstance().completedOnPage;
        completed.clear();

        let gridaArr = [];
        let pageId = []

        const pageInfo = {
          section: gridaPageInfo.s,
          owner: gridaPageInfo.o,
          book: gridaPageInfo.b,
          page: gridaPageInfo.p
        };

        for (let i = 0; i < neoStroke.length; i++) {

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
        doc.openGridaFile({ url: url, filename: file.name }, gridaRawData, neoStroke, pageInfo); 
      }
    } else {
        alert("file open cancelled");
    }
  }

  $(document).ready(function(){
    $('.load_drop_down').hover(
      function(event){
        $(this).addClass('hover');
        $(this).css("color", "rgba(104,143,255,1)");
        $(this).css("background", "rgba(232,236,245,1)");
      },
      function(){
        $(this).removeClass('hover');
        $(this).css("color", "rgba(18,18,18,1)");
        $(this).css("background", "rgba(255,255,255,0.9)");
      }
    );
  });

  return (
      <GridaToolTip open={true} placement="top-end" tip={{
        head: "Grida Load",
        msg: ".grida 파일을 로컬에서 불러옵니다.",
        tail: "키보드 버튼 ?로 선택 가능합니다"
      }} title={undefined}>
        <Button className="load_drop_down" onClick={fileOpenHandler} style={{
          width: "200px", height: "40px", padding: "4px 12px"
        }}>
          <span>데이터 불러오기(.grida)</span>
        </Button>
      </GridaToolTip> 
  );
}

export default LoadGrida;
