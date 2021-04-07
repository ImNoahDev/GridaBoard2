import React, { useState } from 'react';
import { Button, ButtonProps } from '@material-ui/core';
import { IFileBrowserReturn } from '../../nl-lib/common/structures';
import getText from "../language/language";
import CloudConvert from 'cloudconvert';
import { setLoadingVisibility } from '../store/reducers/loadingCircle';
import GridaDoc from "../GridaDoc";
import { InkStorage } from '../../nl-lib/common/penstorage';
// import {fileConvert} from "./LoadGrida";


const CLOUDCONVERT_APIKEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZWY2MzlhMzFiMTRkMDkwMmJlMzE5ZmM3YmI3NzVlODhjNmE0NmU1NDYwZjY5ZTNmNTM3OTkzMjhiMWQwNDg0MDhiNzg4ZTJhYjAzMzk2MDciLCJpYXQiOiIxNjE3NTg5ODc0LjcxMTQxMSIsIm5iZiI6IjE2MTc1ODk4NzQuNzExNDE0IiwiZXhwIjoiNDc3MzI2MzQ3NC42NzEwNzgiLCJzdWIiOiI0OTUwMjk4OSIsInNjb3BlcyI6WyJ0YXNrLndyaXRlIiwidGFzay5yZWFkIl19.SD_Q-xL9vs66TdDIv5StDAsRkBBuhAnTukJ12MyWVnshWAnFcFOn7PcJ6m-RMOhtIFy5EQ2PQZ4NMzx8czyQ2LjBE4W8-so_b5ZoJ9skCiONxUYJiKzuRM6DUrqrCLFVetGG-yzujqwRyklT9X866FxlkrJADC5VsecgeLEdYOfKn-opC-KeX2iZ-OI8_00B09eGy8-NbNXZLwpewhslkTcXxPwfziC9KOEzKXlLfm-_qPVmD4uApsZXJT7l0Wo3yBqOZ2kxL6YDGXSMsIw4_dwOqXJojLYF4X0nUivvclwn8jIpBlIWLx9h7ALz6k37II0CQ2gzofmVcLWovd7x_2jqgczEEYe3J6qYa8NEFWufAyhSRZ-Cqe9dPtn20pDp98u1bAmrL5vXdZwi9NEomaL1WzFrLbWQViuNfp4eu65nwEljLMcBrerRAv4ROVRGBn_PH7PcIqh6ZfcCuWeSfKKvAAaXeFtHjMsVNOHpMNrjD4rnRxA1JRDiWaq2nu0Jk3h34y4NZKYEWvSAdc-COZf5AUIQaapp8Stb9TAa20OFlKljT2B_2B9wJmKitZibgHP6yXY1lzdgsdGtjC6uXtpKfKu2UAj9at7Skg_d7JeOyf8srZe5MGwY2D_gryvWMhnMHEu4C2zuJnYUJ1AkxyYC7q853_XzhEPJeuSyGwc";
const cloudConvert = new CloudConvert(CLOUDCONVERT_APIKEY);
interface Form {
  parameters: Array<string>,
  url : string
}
interface Result {
  form : Form
}
interface Data {
  result : Result
}
interface cloudImportResponse {
  data : Data
}

interface Props extends ButtonProps {
  handlePdfOpen: (event: IFileBrowserReturn) => void,
  className: string
}
// 그리다 파일을 불러왔을때 이용
function fileConvert(selectedFile){
  if (selectedFile.result === "success") {
    const file = selectedFile.file;
    const reader = new FileReader();

    let url = selectedFile.url;
    let jsonFile = null;

    reader.readAsText(file);
    reader.onload = async function(e) {
      jsonFile = e.target.result;

      const gridaInfo = JSON.parse(jsonFile);
      const pdfRawData = gridaInfo.pdf.pdfInfo.rawData;
      const neoStroke = gridaInfo.stroke;

      const pageInfos = gridaInfo.pdf.pdfInfo.pageInfos;
      const basePageInfos = gridaInfo.pdf.pdfInfo.basePageInfos;

      // pdf의 url을 만들어 주기 위해 rawData를 blob으로 만들어 createObjectURL을 한다
      const rawDataBuf = new ArrayBuffer(pdfRawData.length*2);
      const rawDataBufView = new Uint8Array(rawDataBuf);
      for (let i = 0; i < pdfRawData.length; i++) {
        rawDataBufView[i] = pdfRawData.charCodeAt(i);
      }
      const blob = new Blob([rawDataBufView], {type: 'application/pdf'});
      url = await URL.createObjectURL(blob);

      const completed = InkStorage.getInstance().completedOnPage;
      completed.clear();

      const gridaArr = [];
      const pageId = []

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
      doc.openGridaFile({ url: url, filename: file.name }, pdfRawData, neoStroke, pageInfos, basePageInfos);
    }
  } else {
      alert("file open cancelled");
  }
  setLoadingVisibility(false);
}

const ConvertFileLoad = (props: Props) => {
  const [canConvert, setCanConvert] = useState(true);
  const { handlePdfOpen , className} = props;
  function fileOpenHandler() {
    // const selectedFile = await openFileBrowser();
    // console.log(selectedFile);
    const input = document.querySelector("#fileForconvert") as HTMLInputElement;
    input.value = "";
    input.click();
  }
  function inputChange(){
    const inputer = document.getElementById("fileForconvert") as HTMLInputElement;
    const fileName = inputer.files[0].name.split(".");
    const fileType = fileName[fileName.length-1];
    
    const result = {
      result : "success",
      file : null,
      url : null
    };
    setLoadingVisibility(true);
    if(fileType == "pdf" || fileType == "grida"){
      result.file = inputer.files[0];
      result.url = URL.createObjectURL(result.file);
      if(fileType == "pdf"){
        handlePdfOpen(result as IFileBrowserReturn);
        setLoadingVisibility(false);
      }else if(fileType == "grida"){
        fileConvert(result as IFileBrowserReturn);
      }
    }else{
      doFileConvert();
    }
  }
  async function doFileConvert(){
    if(!canConvert) return ;
    
    //converting을 기다려야 하기 때문에 로딩 서클 켜주기

    //cloudconvert에 업로드 할 수 있는 위치 및 시그니처 받기
    const res = await fetch("https://api.cloudconvert.com/v2/import/upload", {
        method: "POST",
        headers : {
            "Authorization" : "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNDNiZDVkZGIxNDMyNzAyNWQ0MzExMjJlYWY3ODc2M2FiNTZmMTJhNzBlYWQ4ZjgzM2YzNGYxODZhNTU4ZWM1MDkwM2Q3MmY5NWIyMWM1MGIiLCJpYXQiOiIxNjE3MjYxMDQ4LjY1NTQ4OCIsIm5iZiI6IjE2MTcyNjEwNDguNjU1NDkwIiwiZXhwIjoiNDc3MjkzNDY0OC42MTcwNDUiLCJzdWIiOiI0OTUwMjk4OSIsInNjb3BlcyI6WyJ0YXNrLnJlYWQiLCJ0YXNrLndyaXRlIl19.WgvnklhnmULiHZp5HKuWNlJcaahq7FJbJBMc9T9PqIMSxAovBEi4ikSPMHw4Q1E_ZGkc63Pmp5QZm5oERAWnEILWWu5IQRXDTf7BDWfvPpX0uetiBhqyzPD2WEqwWoLAN6Vc5p0PHcMOkmKDJzNBIyZf7Rrm17wQ0j5CgmwMcc6gO_grnrwTR1-w71rlsPI7YXTc1pTFp0nUgmGDqHOxqdq_u_zeO2HCxoaPqda5kHfEVyTuAjQGG1nyHbkT_tDB1pmk1j-nVShMgDJ5OQl1Rx_81qWHnla3JEHAo4j03JY3SAXkRQjJGtIi_EvbV7CKDItPuhpWiyxGR-aUMsIUPba03EsyMzudFlBQfviITl-bUqGNDBRMWUyGuR2X8i1hETCDIfyIJCdJuxcXPXtj8jxFXQG7fODc4all6KKwYqxqgz91iE8vwmAuUSsfpwMv__VQLpUqMbk_z0wNFCz2hZ4NdcDB52IqIPJcqCV32WKOkNRRpn6cVZy-6wboaU0oYnv1YvlnnZ1NTjykO8Hu8Sxs1yDmJmSous17g9i01vysA5XcT1HqIGV0Q7eCzov73ICZ_Sa-tbavLyrxUwWtSEhAPLAaTPCkRKW47oyaMdA9AaFIoxbPfD6eIBla11P3IKbQgAWmSefa-UWp8lPq2HkQBmRKHItdgejtTW7sfx0",
            "Content-type": "application/json"
        }
    });

    const responJson:cloudImportResponse = await res.json();

    //전송할 form 데이터 생성
    const inputer = document.getElementById("fileForconvert") as HTMLInputElement;
    const formData = new FormData();

    for(const key in responJson.data.result.form.parameters){
        formData.set(key, responJson.data.result.form.parameters[key]);
    }
    formData.set("file", inputer.files[0]);

    const xhr = new XMLHttpRequest();
    
    xhr.open("POST" , responJson.data.result.form.url , true);
    xhr.onreadystatechange = () => {
        if(xhr.readyState == 4){
          const response: HTMLAllCollection = xhr.responseXML.all;
          //전송 완료
          //TODO : 예외처리 해줘야 함
          //어떤 예외처리?? 모르겠음 찾아봐야함 분명 문제 생길듯
          setTask(response);
        }
    }
    xhr.send(formData);

  } 
  async function setTask(res:HTMLAllCollection){
    //컨버팅 중
      try{
        let job = await cloudConvert.jobs.create({
            "tasks": {
                "task-1": {
                    "operation": "convert", 
                    "input": [res[3].textContent.split("/")[0]],
                    "output_format": "pdf"
                },
                "export-1": {
                    "operation": "export/url",
                    "input": [
                        "task-1"
                    ],
                    "inline": false,
                    "archive_multiple_files": false
                }
            }
        });
        job = await cloudConvert.jobs.wait(job.id);
        
        const url = job.tasks[0].result.files[0].url;
        console.log(url);
  
        const doc = GridaDoc.getInstance();
        doc.openPdfFile({ url: url, filename: job.tasks[0].result.files[0].filename });
      }catch(e){
        /** 
         * 422 (invalid data)
         * 429 (too many requests)
         * 500 (internal server error)
         * 503 (temporary unavailable)
         */
        //에러 로그 출력
        switch(e.response.status){
          case 422 : {
            //잘못된 파일 => 컨버트 할 수 없는 파일
            //input type으로 한번 걸렀으나, alert 처리 해주면 좋을듯
            alert("wrong file type!!");
            break;
          }
          case 429 : {
            //요청이 너무 많음 => 일시 사용 불가로 변환해주어야 함
            setCanConvert(false);
            setTimeout(()=>{
                setCanConvert(true);
            } ,60000); //60초
            break ;
          }
          case 500 : {
            //클라우드 컨버트 서버 오류 => 답이 없음
            break ;
          }
          case 503 : {
            //일시적으로 사용할 수 없음 => 요건 어떤 상황인지 잘 모르겠음
            break ;
          }
        }
      }
      setLoadingVisibility(false);
      return 1;
  }

  return (
    <Button className={`${className}`}
    onClick={fileOpenHandler}>
      {getText("load_file")}
      <input type="file" id="fileForconvert" style={{ display: "none" }} onChange={inputChange} accept=".3FR,.ABW,.AI,.ARW,.AVIF,.AZW,.AZW3,.AZW4,.BMP,.CBC,.CBR,.CBZ,.CDR,.CGM,.CHM,.CR2,.CR3,.CRW,.CSV,.DCR,.DJVU,.DNG,.DOC,.DOCM,.DOCX,.DOT,.DOTX,.DPS,.DWG,.DXF,.EMF,.EPS,.EPUB,.ERF,.ET,.FB2,.GIF,.HEIC,.HTM,.HTML,.HTMLZ,.HWP,.ICO,.JFIF,.JPEG,.JPG,.KEY,.LIT,.LRF,.LWP,.MD,.MOBI,.MOS,.MRW,.NEF,.NUMBERS,.ODD,.ODP,.ODS,.ODT,.ORF,.PAGES,.PDB,.PDF,.PEF,.PML,.PNG,.POT,.POTX,.PPM,.PPS,.PPSX,.PPT,.PPTM,.PPTX,.PRC,.PS,.PSD,.RAF,.RAW,.RB,.RST,.RTF,.RW2,.SDA,.SDC,.SDW,.SK,.SK1,.SNB,.SVG,.SVGZ,.TCR,.TEX,.TIF,.TIFF,.TXT,.TXTZ,.VSD,.WEBP,.WMF,.WPD,.WPS,.X3F,.XCF,.XLS,.XLSM,.XLSX,.XPS,.ZABW, .grida"/> 
      {/* getText("load_from_grida") */}
    </Button>);

}

export default ConvertFileLoad;