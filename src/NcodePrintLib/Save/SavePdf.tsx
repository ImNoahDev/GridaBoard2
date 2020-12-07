import { saveAs } from "file-saver";
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// https://pdf-lib.js.org/

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

  firstPage.moveDown(25)
  firstPage.drawSvgPath(svgPath)

  firstPage.moveDown(200)
  firstPage.drawSvgPath(svgPath, { borderColor: rgb(0, 1, 0), borderWidth: 5 })

  firstPage.moveDown(200)
  firstPage.drawSvgPath(svgPath, { color: rgb(1, 0, 0) })

  firstPage.moveDown(200)
  firstPage.drawSvgPath(svgPath, { scale: 0.5 })


  const pdfBytes = await pdfDoc.save();
  console.log(pdfBytes);

  let blob = new Blob([pdfBytes]);
  saveAs(blob, saveName);

  console.log(firstPage);

}
