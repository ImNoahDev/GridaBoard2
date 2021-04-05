import React from 'react';
import { Button } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import { render } from "react-dom";
import getText from "../language/language";
import CloudConvert from 'cloudconvert';
import { setLoadingVisibility } from '../store/reducers/loadingCircle';
import GridaDoc from "../GridaDoc";


const CLOUDCONVERT_APIKEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZWY2MzlhMzFiMTRkMDkwMmJlMzE5ZmM3YmI3NzVlODhjNmE0NmU1NDYwZjY5ZTNmNTM3OTkzMjhiMWQwNDg0MDhiNzg4ZTJhYjAzMzk2MDciLCJpYXQiOiIxNjE3NTg5ODc0LjcxMTQxMSIsIm5iZiI6IjE2MTc1ODk4NzQuNzExNDE0IiwiZXhwIjoiNDc3MzI2MzQ3NC42NzEwNzgiLCJzdWIiOiI0OTUwMjk4OSIsInNjb3BlcyI6WyJ0YXNrLndyaXRlIiwidGFzay5yZWFkIl19.SD_Q-xL9vs66TdDIv5StDAsRkBBuhAnTukJ12MyWVnshWAnFcFOn7PcJ6m-RMOhtIFy5EQ2PQZ4NMzx8czyQ2LjBE4W8-so_b5ZoJ9skCiONxUYJiKzuRM6DUrqrCLFVetGG-yzujqwRyklT9X866FxlkrJADC5VsecgeLEdYOfKn-opC-KeX2iZ-OI8_00B09eGy8-NbNXZLwpewhslkTcXxPwfziC9KOEzKXlLfm-_qPVmD4uApsZXJT7l0Wo3yBqOZ2kxL6YDGXSMsIw4_dwOqXJojLYF4X0nUivvclwn8jIpBlIWLx9h7ALz6k37II0CQ2gzofmVcLWovd7x_2jqgczEEYe3J6qYa8NEFWufAyhSRZ-Cqe9dPtn20pDp98u1bAmrL5vXdZwi9NEomaL1WzFrLbWQViuNfp4eu65nwEljLMcBrerRAv4ROVRGBn_PH7PcIqh6ZfcCuWeSfKKvAAaXeFtHjMsVNOHpMNrjD4rnRxA1JRDiWaq2nu0Jk3h34y4NZKYEWvSAdc-COZf5AUIQaapp8Stb9TAa20OFlKljT2B_2B9wJmKitZibgHP6yXY1lzdgsdGtjC6uXtpKfKu2UAj9at7Skg_d7JeOyf8srZe5MGwY2D_gryvWMhnMHEu4C2zuJnYUJ1AkxyYC7q853_XzhEPJeuSyGwc";
const cloudConvert = new CloudConvert(CLOUDCONVERT_APIKEY);

interface Form {
  parameters: string[],
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

const ConvertFileLoad = () => {
  function fileOpenHandler() {
    // const selectedFile = await openFileBrowser();
    // console.log(selectedFile);
    const input = document.querySelector("#fileForconvert") as HTMLElement;
    input.click();
  }
  async function doFileConvert(){
    //converting을 기다려야 하기 때문에 로딩 서클 켜주기
    setLoadingVisibility(true);

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

  } false;
  async function setTask(res:HTMLAllCollection){
    //컨버팅 중
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
      setLoadingVisibility(false);
      console.log(job.tasks[0].result.files[0]);
      console.log(url);

      const doc = GridaDoc.getInstance();
      doc.openPdfFile({ url: url, filename: job.tasks[0].result.files[0].filename });
      return 1;
  }

  return (
    <Button className="load_drop_down" 
    onClick={fileOpenHandler}
    style={{
      width: "200px", height: "40px", padding: "4px 12px", justifyContent: "flex-start"
    }}>
      {getText("load_from_pdf")}(.etc)
      <input type="file" id="fileForconvert" style={{ display: "none" }} onChange={doFileConvert}/> 
      {/* getText("load_from_grida") */}
    </Button>);

}

export default ConvertFileLoad;