import { saveAs } from "file-saver";
import { PDFDocument, rgb } from 'pdf-lib';
import GridaDoc from "../GridaDoc";
import { InkStorage } from "../../nl-lib/common/penstorage";
import { drawPath } from "../../nl-lib/common/util";

const PDF_TO_SCREEN_SCALE = 6.72; // (56/600)*72

// https://pdf-lib.js.org/

const inkSt = InkStorage.getInstance();

export async function saveGrida(gridaName: string) {

  const doc = GridaDoc.getInstance();
  const docPages = doc.pages;

  let strokeSection = null;
  let strokeOwner = null;
  let strokeBook = null;
  let strokePage = null;

  let pdfInfo = null;

  let strokeInfo = null;

  let pdfUrl, pdfDoc = undefined;

  // let gridaDate = null;

  for (const page of docPages) //병렬처리
  {
    if (page.pdf === undefined) {
      //ncode page일 경우
      if (pdfDoc === undefined) {
        pdfDoc = await PDFDocument.create();
        await pdfDoc.addPage();
      } else {
        const lastPrevPageNo = pdfDoc.getPages().length-1;
        const lastPrevPage = await pdfDoc.getPages()[lastPrevPageNo];
        const {width, height} = await lastPrevPage.getSize();
        await pdfDoc.addPage([width, height]);
      }
    } 
    //pdf인 경우 
    else if (pdfUrl !== page.pdf.url) {
      pdfUrl = page.pdf.url;
      const existingPdfBytes = await fetch(page.pdf.url).then(res => res.arrayBuffer());
      let pdfDocSrc = await PDFDocument.load(existingPdfBytes);

      console.log(existingPdfBytes)

      // const bufViewInt16 = new Int16Array(existingPdfBytes).join();

      // const bufViewInt32 = new Int32Array(existingPdfBytes).join();

      // const bufViewInt8 = new Int8Array(existingPdfBytes).join();

      // const bufViewUint8 = new Uint8Array(existingPdfBytes).join();

      // pdfInfo = bufViewInt16 + bufViewInt32 + bufViewInt8 + bufViewUint8;

      const arrayBuffer = new Uint8Array(existingPdfBytes);
      pdfInfo = String.fromCharCode.apply(null, arrayBuffer);

      // await decodeURIComponent(s);

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
      } 
      else {
        pdfDoc = pdfDocSrc;
      }
    } else {
      continue;
    }

  const sortStringKeys = (a, b) => a[0] > b[0] ? 1 : -1;
  const sortedCompletedOnPage = new Map([...inkSt.completedOnPage].sort(sortStringKeys));

  const pages = pdfDoc.getPages();

  let i = 0;
  for (const [key, NeoStrokes] of sortedCompletedOnPage.entries()) {

    for (const docPage of docPages) {
      //page info를 grida doc의 그것과 비교해서 어떤 pdf doc에 stroke를 그릴지 결정
      const { section, book, owner, page } = docPage.basePageInfo;
      const pageId = InkStorage.makeNPageIdStr({ section, book, owner, page });

      strokeSection = section;
      strokeOwner = owner;
      strokeBook = book;
      strokePage = page;
      
      if (pageId === key) {
        i = docPage.pageNo;
      }
    }

    const page = pages[i];
    const pageHeight = page.getHeight();

    for (let j = 0; j < NeoStrokes.length; j++) {
      const thickness = NeoStrokes[j].thickness;
      const dotArr = NeoStrokes[j].dotArray;
      const rgbStrArr = NeoStrokes[j].color.match(/\d+/g);

      let opacity = 1;
      if (NeoStrokes[j].brushType === 1) {
        opacity = 0.3;
      }

      const pointArray = [];
      for (let k = 0; k < dotArr.length; k++) {
        const dot = dotArr[k];
        const x = dot.x * PDF_TO_SCREEN_SCALE;
        const y = dot.y * PDF_TO_SCREEN_SCALE;

        pointArray.push({ x, y, f: dot.f });
      }
      const strokeThickness = thickness / 64;
      const pathData = drawPath(pointArray, strokeThickness);

      strokeInfo = NeoStrokes;

      page.moveTo(0, pageHeight);
      page.drawSvgPath(pathData, {
        color: rgb(
          Number(rgbStrArr[0]) / 255,
          Number(rgbStrArr[1]) / 255,
          Number(rgbStrArr[2]) / 255
        ),
        opacity: opacity,
        scale: 1
      });
    }
  }

  const pdfSection = page.pageInfos[0].section;
  const pdfOwner = page.pageInfos[0].owner;
  const pdfBook = page.pageInfos[0].book;
  const pdfPage = page.pageInfos[0].page;

  const gridaDate = new Date();

  const gridaJson = {
    "pdf" : {
      "pdfInfo" : {
        "pageInfo" : {"s" : pdfSection, "o" : pdfOwner, "b" : pdfBook, "p" : pdfPage},
        "rawData" : pdfInfo,
      }
    },
    "stroke" : {
      "pageInfo" : {"s" : strokeSection, "o" : strokeOwner, "b" : strokeBook, "p" : strokePage},
      "strokeInfo" : strokeInfo
    },
    "gridaInfo" : {
      "gridaDate" : gridaDate,
      "id" : "asdf",
      "pwd" : "asdf"
    }
  };

  const mappingInfoStr = JSON.stringify(gridaJson);

  const blob = new Blob([mappingInfoStr], { type: 'application/json' });
  saveAs(blob, gridaName);
  
 }
 
}


