
const excelToJson = require('convert-excel-to-json');
const fs = require("fs");
const url = "./src/GridaBoard/language/";

const codes = ["ko", "en", "ja", "zh", "de", "es"]; //5, 6, 7, 8, 9, 10번에 각각 들어있음

const excelFile = excelToJson({
  source: fs.readFileSync(url + "textData.xlsx" ), // fs.readFileSync return a Buffer
  columnToKey: {
    B: 'tag',
    C: 'key',
    F: codes[0],
    G: codes[1],
    H: codes[2],
    I: codes[3],
    J: codes[4],
    K: codes[5],
  }
});


let data = {};
codes.forEach((el)=>{
  data[el] = {};
})
let table = excelFile.string;
let startI = 0;
for(let i = 0; i < table.length;i++){
  if(table[i].tag == "tag"){
    startI = i;
    break ;
  }
}

for(let i = startI; i < table.length; i++){
  let now = table[i];
  for(let j = 0; j < codes.length; j++){
    let key = codes[j];
    if(now[key] != undefined){
      data[key][now.key] = now[key];
    }
  }
}

fs.writeFileSync(url + "textData.json", JSON.stringify(data));

console.log("transform text xlsx to text json");