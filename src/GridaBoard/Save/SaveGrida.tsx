import { saveAs } from "file-saver";
import { degrees, PDFDocument } from 'pdf-lib';
import GridaDoc from "../GridaDoc";
import { InkStorage } from "nl-lib/common/penstorage";
import { fabric } from "fabric";
import { isSamePage } from "../../nl-lib/common/util";
import { PlateNcode_1, PlateNcode_2 } from "../../nl-lib/common/constants";
import { adjustNoteItemMarginForFilm, getNPaperInfo } from "../../nl-lib/common/noteserver";
import { store } from "../client/pages/GridaBoard";
import { makePdfDocument, addStrokesOnPage } from "./SavePdf";
import { IPageSOBP } from "../../nl-lib/common/structures";

const PDF_TO_SCREEN_SCALE = 6.72; // (56/600)*72

const inkSt = InkStorage.getInstance();

export async function saveGrida(gridaName: string) {

  const blob = makeGridaBlob();
  saveAs(blob, gridaName);
}

export async function makeGridaBlob() {

  const doc = GridaDoc.getInstance();
  const docPages = doc.pages;

  const strokeInfos = [];

  const pdfDoc = await makePdfDocument();
  
  // addStrokesOnPage(pdfDoc);

  for (const [key, NeoStrokes] of inkSt.completedOnPage.entries()) {
    strokeInfos.push(NeoStrokes)
  }
    
  //하나의 pdf로 완성됨 pdfDocument에 새로운 그리다 전체 pdf가 포함되어있음
  let newRawData;
  const pdfBytes = await pdfDoc.save();
  const arrayBuffer = new Uint8Array(pdfBytes);
  for (let i = 0; i < arrayBuffer.length; i++) {
    newRawData += String.fromCharCode(arrayBuffer[i]);
  }


  const pageInfos = [];
  const basePageInfos = [];

  getPageInfosFromDoc(pageInfos, basePageInfos);

  const pdf = {
    pdfInfo : {
      pageInfos: pageInfos,
      basePageInfos : basePageInfos,
      rawData: newRawData
    }
  };

  const gridaInfo = {
    gridaDate :  new Date(),
    id : "asdf",
    pwd : "qwer"
  }

  const gridaJson = {
    "pdf" : pdf,
    "stroke" : strokeInfos,
    "gridaInfo" : gridaInfo
  };

  console.log(gridaJson);

  const mappingInfoStr = JSON.stringify(gridaJson);

  const blob = new Blob([mappingInfoStr], { type: 'application/json' });

  return blob;
}

export async function getPageInfosFromDoc(pageInfos: IPageSOBP[], basePageInfos: IPageSOBP[]) {

  const docPages = GridaDoc.getInstance().pages;

  for (const page of docPages)
  {
    pageInfos.push({
      section: page.pageInfos[0].section, 
      owner:  page.pageInfos[0].owner, 
      book: page.pageInfos[0].book,
      page: page.pageInfos[0].page
    });

    basePageInfos.push({
      section:  page.basePageInfo.section,
      owner: page.basePageInfo.owner, 
      book: page.basePageInfo.book, 
      page: page.basePageInfo.page
    });
  }
}


