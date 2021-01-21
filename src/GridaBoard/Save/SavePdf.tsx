import { saveAs } from "file-saver";
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Swal from 'sweetalert2'

import GridaDoc from "../GridaDoc";

import { InkStorage } from "../../nl-lib/common/penstorage";
import { drawPath } from "../../nl-lib/common/util";


const PDF_TO_SCREEN_SCALE = 6.72; // (56/600)*72

// https://pdf-lib.js.org/

const inkSt = InkStorage.getInstance();
export async function savePDF(url: string, saveName: string) {

  const filename = saveName;

  const doc = GridaDoc.getInstance();
  const docPages = doc.pages;

  let pdfUrl, pdfDoc = undefined;

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
    else {
      //pdf인 경우 
      if (pdfUrl !== page.pdf.url) {
        pdfUrl = page.pdf.url;
        const existingPdfBytes = await fetch(page.pdf.url).then(res => res.arrayBuffer());
        let pdfDocSrc = await PDFDocument.load(existingPdfBytes);

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

    for (const docPage of docPages) {
      //page info를 grida doc의 그것과 비교해서 어떤 pdf doc에 stroke를 그릴지 결정
      const { section, book, owner, page } = docPage.basePageInfo;
      const pageId = InkStorage.makeNPageIdStr({ section, book, owner, page });
      
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

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, filename);
}

export async function addGraphicAndSavePdf(url: string, saveName: string) {

  const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

  const pdfDoc = await PDFDocument.load(existingPdfBytes)
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const pages = pdfDoc.getPages()
  const firstPage = pages[0]
  const { height } = firstPage.getSize()
  firstPage.drawText('This text was added with JavaScript!', {
    x: 5,
    y: height / 2 + 300,
    size: 50,
    font: helveticaFont,
    color: rgb(0.95, 0.1, 0.1),
    rotate: degrees(-45),
  })


  const svgPath =
    'M 0,20 L 100,160 Q 130,200 150,120 C 190,-40 200,200 300,150 L 400,90'

  firstPage.moveTo(100, firstPage.getHeight() - 5)

  firstPage.drawSvgPath(svgPath)



  const pdfBytes = await pdfDoc.save();
  console.log(pdfBytes);

  const blob = new Blob([pdfBytes]);
  saveAs(blob, saveName);

  console.log(firstPage);

}
