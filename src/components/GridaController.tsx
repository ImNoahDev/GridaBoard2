import React, { Component } from 'react';

// const loadXMLDoc = () => {
//   var xmlhttp = new XMLHttpRequest();
//   xmlhttp.onreadystatechange = function() {
//     if (this.readyState == 4 && this.status == 200) {
//       myFunction(this);
//     }
//   };
//   // xmlhttp.open("GET", "cd_catalog.xml", true);
//   xmlhttp.open("GET", "note_1116.xml", true);
//   xmlhttp.send();
// }

// const myFunction = (xml) => {
//   var x = [], y = [], width = [], height = [], command = [], xmlDoc, txt, symbol;
//   xmlDoc = xml.responseXML;
//   txt = "";
//   symbol = xmlDoc.getElementsByTagName("symbol");
//   for(var i = 0; i < 100; i++) {
//     // x[i] = symbol[i].getAttribute("x");
//     // y[i] = symbol[i].getAttribute("y");
//     // width[i] = symbol[i].getAttribute("width");
//     // height[i] = symbol[i].getAttribute("height");

//     // if (x[i] === x[0] || y[i] === y[0] || width[i] === width[0] || height[i] === height[0]) {
//       command[i] = xmlDoc.getElementsByTagName("command")[i].getAttribute("param");
//       txt = txt + command[i] + '<br>';
//       document.getElementById("demo").innerHTML = txt;
//     // }
//   }
//   // x = xmlDoc.getElementsByTagName("symbol")[0].getAttribute("x");
//   // y = xmlDoc.getElementsByTagName("symbol")[0].getAttribute("y");
//   // width = xmlDoc.getElementsByTagName("symbol")[0].getAttribute("width");
//   // height = xmlDoc.getElementsByTagName("symbol")[0].getAttribute("height");
//   // if (x[] === "78.3807" || y === "135.495" || width === "27.494" || height === "26.2788") {
//     // command = xmlDoc.getElementsByTagName("command")[0].getAttribute("param");
//   // }
//   // y = x.getAttribute("param");
//   // for (i = 0; i< x.length; i++) {
//   //   // txt += y[i].childNodes[0].nodeValue + "<br>";
//   //   txt += x[i] + "<br>";
//   // } 
//   // txt = command;
//   // document.getElementById("demo").innerHTML = txt;
// }

class GridaController extends Component {
  static loadXMLDoc = () => {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        GridaController.myFunction(this);
      }
    };
    // xmlhttp.open("GET", "cd_catalog.xml", true);
    xmlhttp.open("GET", "note_1116.xml", true);
    xmlhttp.send();
  }
  
  static myFunction = (xml: any) => {
    var x = [], y = [], width = [], height = [], command = [], xmlDoc, txt, symbol;
    xmlDoc = xml.responseXML;
    txt = "";
    symbol = xmlDoc.getElementsByTagName("symbol");
    for(var i = 0; i < 100; i++) {
      // x[i] = symbol[i].getAttribute("x");
      // y[i] = symbol[i].getAttribute("y");
      // width[i] = symbol[i].getAttribute("width");
      // height[i] = symbol[i].getAttribute("height");
  
      // if (x[i] === x[0] || y[i] === y[0] || width[i] === width[0] || height[i] === height[0]) {
        command[i] = xmlDoc.getElementsByTagName("command")[i].getAttribute("param");
        txt = txt + command[i] + '<br>';
        document.getElementById("demo").innerHTML = txt;
      // }
    }
    // x = xmlDoc.getElementsByTagName("symbol")[0].getAttribute("x");
    // y = xmlDoc.getElementsByTagName("symbol")[0].getAttribute("y");
    // width = xmlDoc.getElementsByTagName("symbol")[0].getAttribute("width");
    // height = xmlDoc.getElementsByTagName("symbol")[0].getAttribute("height");
    // if (x[] === "78.3807" || y === "135.495" || width === "27.494" || height === "26.2788") {
      // command = xmlDoc.getElementsByTagName("command")[0].getAttribute("param");
    // }
    // y = x.getAttribute("param");
    // for (i = 0; i< x.length; i++) {
    //   // txt += y[i].childNodes[0].nodeValue + "<br>";
    //   txt += x[i] + "<br>";
    // } 
    // txt = command;
    // document.getElementById("demo").innerHTML = txt;
  }
  render() {
    return (
      <div>
        <button type="button" onClick={GridaController.loadXMLDoc}>grida board controller</button>

        <p id="demo"></p>
      </div>
    );
  }
}

export default GridaController;