const xlsx = require( "xlsx" );
const fs = require("fs");
const url = "./src/GridaBoard/language/";
const excelFile = xlsx.readFile( url + "textData.xlsx" );
// const sheetName = excelFile.SheetNames[0];  
const sheetName = excelFile.SheetNames[0];
const firstSheet = excelFile.Sheets[sheetName];
const jsonData = xlsx.utils.sheet_to_json( firstSheet, { defval : "" } );
// console.log(jsonData[3]["__EMPTY_2"]); // tag 명
// console.log(jsonData[3]["__EMPTY_5"]); // 한글

const codes = ["ko", "en", "ja", "zh", "de", "es"]; //5, 6, 7, 8, 9, 10번에 각각 들어있음

let data = {};
codes.forEach((el)=>{
  data[el] = {};
})

for(let i = 3; i < jsonData.length; i++){
  let now = jsonData[i];
  for(let j = 0; j < codes.length; j++){
    let key = "__EMPTY_" + (j + 5);
    if(now[key] != ""){
      data[codes[j]][now["__EMPTY_2"]] = now[key];
    }
  }
}

fs.writeFileSync(url + "textData.json", JSON.stringify(data));

console.log("transform text xlsx to text json");