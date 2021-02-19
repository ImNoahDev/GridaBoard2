import { saveAs } from "file-saver";
import { degrees, PDFDocument } from 'pdf-lib';
import GridaDoc from "../GridaDoc";
import { InkStorage } from "../../nl-lib/common/penstorage";
import { fabric } from "fabric";

const PDF_TO_SCREEN_SCALE = 6.72; // (56/600)*72

const inkSt = InkStorage.getInstance();

export async function saveGrida(gridaName: string) {

  const doc = GridaDoc.getInstance();
  const docPages = doc.pages;

  let strokeInfos = [];

  let pdfUrl, pdfDoc = undefined;

  let pdfSection = [];
  let pdfOwner = [];
  let pdfBook = [];
  let pdfPage = [];

  let cnt = 0;
  let infoCnt = 0;

  for (const page of docPages) //병렬처리
  {
    pdfSection[cnt] = page.pageInfos[0].section;
    pdfOwner[cnt] = page.pageInfos[0].owner;
    pdfBook[cnt] = page.pageInfos[0].book;
    pdfPage[cnt] = page.pageInfos[0].page

    cnt++;

    if (page.pdf === undefined) {
      //ncode page일 경우
      if (pdfDoc === undefined) {
        pdfDoc = await PDFDocument.create();
      } 
      const pdfPage = await pdfDoc.addPage();
      if (page._rotation === 90 || page._rotation === 270) {
        const tmpWidth = pdfPage.getWidth();
        pdfPage.setWidth(pdfPage.getHeight());
        pdfPage.setHeight(tmpWidth);
      }
    } else {
      //pdf인 경우
      if (pdfUrl !== page.pdf.url) {
        pdfUrl = page.pdf.url;
        const existingPdfBytes = await fetch(page.pdf.url).then(res => res.arrayBuffer());
        let pdfDocSrc = await PDFDocument.load(existingPdfBytes); // 다시 저장하면 여기서 오류
  
        if (pdfDoc !== undefined) {
          //ncode 페이지가 미리 생성돼서 그 뒤에다 붙여야하는 경우
          const srcLen = pdfDocSrc.getPages().length;
          let totalPageArr = [];
          for (let i = 0; i<srcLen; i++) {
            totalPageArr.push(i);
          }
  
          const copiedPages = await pdfDoc.copyPages(pdfDocSrc, totalPageArr);
  
          for (const copiedPage of copiedPages) {
            await pdfDoc.addPage(copiedPage);
          }
        } else {
          pdfDoc = pdfDocSrc;
        }
      } else {
        continue;
      }
    }
  }

  //this.completedOnPage에는 페이지 순서대로 stroke array가 들어가는게 아니기 때문에 key값(sobp)으로 정렬
  const sortStringKeys = (a, b) => a[0] > b[0] ? 1 : -1;
  const sortedCompletedOnPage = new Map([...inkSt.completedOnPage].sort(sortStringKeys));

  const pages = pdfDoc.getPages();
  let i = 0;

  for (const [key, NeoStrokes] of sortedCompletedOnPage.entries()) {

    strokeInfos[infoCnt] = NeoStrokes;

    infoCnt++;

    let rotation = 0;
    let isPdf = true;

    for (const docPage of docPages) {
      //page info를 grida doc의 그것과 비교해서 어떤 pdf doc에 stroke를 그릴지 결정
      const { section, book, owner, page } = docPage.basePageInfo;
      const pageId = InkStorage.makeNPageIdStr({ section, book, owner, page });
      
      if (pageId === key) {
        i = docPage.pageNo;
        rotation = docPage._rotation

        if (docPage._pdf === undefined) {
          isPdf = false;
        }
      }
    }
    
    const page = pages[i];

    for (let j = 0; j < NeoStrokes.length; j++) {
      const dotArr = NeoStrokes[j].dotArray;

      let canvasCenterSrc = new fabric.Point(page.getHeight()/2, page.getWidth()/2)
      let canvasCenterDst = new fabric.Point(page.getWidth()/2, page.getHeight()/2)
      const radians = fabric.util.degreesToRadians(-rotation)

      if (rotation === 0) {
        canvasCenterDst = canvasCenterSrc;
      } else if (rotation === 180) {
        canvasCenterSrc = canvasCenterDst;
      }

      const pointArray = [];

      if (isPdf) {
        for (let k = 0; k < dotArr.length; k++) {
          const dot = dotArr[k];
          const pdf_xy = { x: dot.x * PDF_TO_SCREEN_SCALE, y: dot.y * PDF_TO_SCREEN_SCALE};

          // 1. subtractEquals
          pdf_xy.x -= canvasCenterSrc.x;
          pdf_xy.y -= canvasCenterSrc.y;
          
          // 2. rotateVector
          var v = fabric.util.rotateVector(pdf_xy, radians);

          // 3. addEquals
          v.x += canvasCenterDst.x;
          v.y += canvasCenterDst.y;

          pointArray.push({ x: v.x, y: v.y, f: dot.f });
        }
        page.setRotation(degrees(rotation));
        
      } else { //ncode page 일 때
        for (let k = 0; k < dotArr.length; k++) {
          const dot = dotArr[k];
          const pdf_xy = { x: dot.x * PDF_TO_SCREEN_SCALE, y: dot.y * PDF_TO_SCREEN_SCALE};

          pointArray.push({ x: pdf_xy.x, y: pdf_xy.y, f: dot.f });
        }
      }
    }
  }
  
  //하나의 pdf로 완성됨 pdfDocument에 새로운 그리다 전체 pdf가 포함되어있음
  let newRawData;
  const pdfBytes = await pdfDoc.save();
  const arrayBuffer = new Uint8Array(pdfBytes);
  for (let i = 0; i < arrayBuffer.length; i++) {
    newRawData += String.fromCharCode(arrayBuffer[i]);
  }

  const gridaDate = new Date();

  let pdf = {
    pdfInfo : {
      pageInfo: { "s": pdfSection[0], "o": pdfOwner[0], "b": pdfBook[0], "p": pdfPage[0] },
      rawData: newRawData
    } 
  };

  let stroke = strokeInfos;

  let gridaInfo = {
    gridaDate : gridaDate,
    id : "asdf",
    pwd : "qwer"
  }

  const gridaJson = {
    "pdf" : pdf,
    "stroke" : stroke,
    "gridaInfo" : gridaInfo
  };

  console.log(gridaJson);

  const mappingInfoStr = JSON.stringify(gridaJson);

  const blob = new Blob([mappingInfoStr], { type: 'eapplication/json' });
  saveAs(blob, gridaName);
  
}
 



