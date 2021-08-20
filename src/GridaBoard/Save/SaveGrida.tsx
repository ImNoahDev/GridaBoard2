import { saveAs } from "file-saver";
import GridaDoc from "../GridaDoc";
import { InkStorage } from "nl-lib/common/penstorage";
import { makePdfDocument } from "./SavePdf";
import { IPageSOBP } from "../../nl-lib/common/structures";
import { MappingStorage } from "../../nl-lib/common/mapper";

const PDF_TO_SCREEN_SCALE = 6.72; // (56/600)*72

const inkSt = InkStorage.getInstance();

export async function saveGrida(gridaName: string) {

  const blob = await makeGridaBlob();
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

  const mappingData = MappingStorage.getInstance()._data; //인쇄한 경우
  const mappingTemporary = MappingStorage.getInstance()._temporary; //캘리브레이션한 경우

  const fingerprint = doc.getPdfFingerprintAt(0);
  
  let targetMapper = undefined;

  for (const doc of mappingTemporary.arrDocMap) {
    if (doc.fingerprint === fingerprint) {
      targetMapper = doc;
      break;
    }
  }

  for (const doc of mappingData.arrDocMap) {
    if (doc.fingerprint === fingerprint) {
      targetMapper = doc;
      break;
    }
  }

  const gridaJson = {
    "pdf" : pdf,
    "stroke" : strokeInfos,
    "gridaInfo" : gridaInfo,
    "mapper": targetMapper,
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


