

import { IPrintingEvent, IPrintingReport, IPrintOption, IUnitString, IProgressCallbackFunction } from "./PrintDataTypes";

import NeoPdfDocument from "../NeoPdf/NeoPdfDocument";
import NeoPdfManager from "../NeoPdf/NeoPdfManager";
import { IPdfMappingDesc } from "../Coordinates";
import { MappingStorage, PdfDocMapper } from "../SurfaceMapper";

import { SheetRendererManager } from "../NcodeSurface/SheetRendererManager";
import { IPrintingSheetDesc } from "../NcodeSurface/SheetRenderer";
import { convertUnit, getExtensionName, getFilenameOnly, getNcodedPdfName, makeNPageIdStr, makePdfId, sleep, uuidv4 } from "../UtilFunc";
import { PageSizes, PDFDict, PDFDocument, PDFHexString, PDFName } from "pdf-lib";
import { saveAs } from "file-saver";
import printJS from "print-js";
import { _app_name, _lib_name, _version } from "../Version";
import { g_defaultPrintOption } from "../DefaultOption";


// https://stackoverflow.com/questions/9616426/javascript-print-iframe-contents-only/9616706
// ifame

// PdfJs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PdfJs.version}/pdf.worker.js`;
// var CMAP_URL = "./cmaps/";
// var CMAP_PACKED = true;

interface Props {
  /** 인쇄될 문서의 url, printOption.url로 들어간다. */
  url: string,
  filename: string,

  /** 인쇄 준비 상태를 업데이트하는 콜백 함수 */
  /** 기본값의 IPrintOption을 받아서, dialog를 처리하고 다시 돌려주는 콜백 함수 */
  printOptionCallback?: (arg: IPrintOption) => IPrintOption,
}




/**
 * Class
 */
export default class PrintNcodedPdfWorker {
  private progressPercent = 0;
  private pdf = undefined as NeoPdfDocument;
  // pagesOverview = [] as IPageOverview[];
  private mapping = undefined as PdfDocMapper;
  private printOption: IPrintOption;
  private status = "N/A";

  private numReports = 0;


  private url: string;
  private filename: string;

  /** 인쇄 준비 상태를 업데이트하는 콜백 함수 */
  private reportProgress?: (arg: IPrintingReport) => void;

  /** 기본값의 IPrintOption을 받아서, dialog를 처리하고 다시 돌려주는 콜백 함수 */
  private printOptionCallback?: (arg: IPrintOption) => IPrintOption;

  constructor(props: Props, reportProgress?: (arg: IPrintingReport) => void) {
    this.printOption = g_defaultPrintOption;
    this.url = props.url;
    this.filename = props.filename;
    this.reportProgress = reportProgress;
    this.printOptionCallback = props.printOptionCallback;
  }

  private setStatus = (status: string) => {
    this.status = status;
  }

  private setProgressPercent = (percent: number) => {
    this.progressPercent = percent;
  }


  private loadPdf = async (url: string, filename: string) => {
    if (url === undefined) return;

    const { printOption } = this;
    const loaded = await NeoPdfManager.getDocument({ url, filename });
    if (loaded) {
      // console.log(`[yyy] setPageOverview called`);
      printOption.url = url;
      printOption.filename = filename;

      // 디버깅용 화면 디스플레이를 위해
      const numTotalPages = loaded.numPages;
      printOption.direction = loaded.direction;

      console.log(`[NumPage] PDF page: ${url} - ${numTotalPages}`)
      printOption.targetPages = Array.from({ length: numTotalPages }, (_, i) => i + 1);

      this.pdf = loaded;
    }

    return loaded;
  }

  public startPrint = async (url: string, filename: string) => {
    this.setStatus("loading");
    const pdf = await this.loadPdf(url, filename);
    if (!pdf) {
      this.setStatus("canceled. loading failed.");
      return;
    }

    this.setStatus("configuring");
    // 프로그레스 보고를 위한 초기화
    const progressCallback = this.progressCallback;

    const printOption = this.printOption;
    printOption.cancel = false;
    printOption.progressCallback = progressCallback;
    this.numReports = 0;

    // PrintPdfMain의 printTrigger를 +1 해 주면, 인쇄가 시작된다
    let pdfMapDesc = this.getAssociatedMappingInfo(printOption, pdf);
    printOption.needToIssueCode = !pdfMapDesc;

    // 기본 값으로는 모든 페이지를 인쇄하도록
    printOption.targetPages = Array.from({ length: pdf.numPages }, (_, i) => i + 1);

    // 기본 인쇄 옵션 외의 옵션을 이용자로부터 받는다
    if (this.printOptionCallback) {
      const result = this.printOptionCallback(printOption);
      if (result) this.printOption = result;
    }

    if (printOption.cancel) return;

    // Ncode가 필요하면 코드를 받아 온다, 여기서 받아오는 ncode page 수는 전체 PDF의 페이지 수
    printOption.needToIssueCode = printOption.needToIssueCode || printOption.forceToIssueNewCode;
    if (printOption.needToIssueCode) {
      pdfMapDesc = this.getNewNcode(printOption);
    }

    // 할당된 코드를 옵션에 세팅한다
    pdf.setNcodeAssigned(pdfMapDesc);
    printOption.pdfMappingDesc = pdfMapDesc;
    printOption.pageInfo = { ...pdfMapDesc.nPageStart };
    printOption.issuedNcodes = MappingStorage.makeAssignedNcodeArray(pdfMapDesc.nPageStart, pdf.numPages);


    // sheet에 해당하는 페이 번호들을 세팅하고
    this.setStatus("progress");
    const { targetPages, pagesPerSheet } = printOption;
    const pageNumsInSheets = this.genaratePageNumsInSheets(targetPages, pagesPerSheet);
    const tempMapping = this.resetPrintStatus();
    const numSheets = pageNumsInSheets.length;
    const sheets: IPrintingSheetDesc[] = new Array(numSheets);

    // 본격적으로 각 시트의 이미지를 만들어 놓는다
    this.setStatus("printing");
    const promises = [];
    for (let i = 0; i < numSheets; i++) {
      if (printOption.cancel) return;

      const pr = this.prepareSheet(i, pageNumsInSheets[i]);
      promises.push(pr);
      pr.then(sheet => {
        // sheets.push(sheet.sheetDesc);
        sheets[sheet.sheetIndex] = sheet.sheetDesc;

        // 임시 매핑 정보를 추가해서 넣는다, afterPrint에서 쓰인다
        tempMapping.append(sheet.mappingItems);
      });
    }

    await Promise.all(promises);

    // 캔버스 오브젝트로 그려진 객체를 각각의 PDF 페이지로 만든다.
    const pdfDoc = await this.createPdfDocument(printOption, sheets, printOption.progressCallback);
    if (progressCallback) progressCallback();
    await sleep(10);

    await this.setMetaData(pdfDoc, pdf, printOption);
    await sleep(10);
    const pdfBytes = await pdfDoc.save()

    // 저장 가능한 바이너리 구조를 만들어서
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    // const base64DataUri = await pdfDoc.saveAsBase64({ dataUri: true })
    await sleep(10);
    if (printOption.cancel) return;

    // 인쇄를 시작한다.
    const urlCreator = window.URL || window.webkitURL;
    const ncodedUrl = await new Promise(resolve => {
      const ret = urlCreator.createObjectURL(blob); resolve(ret);
    }) as string;
    this.printByPrintJs(ncodedUrl);

    // 저장 옵션이 켜져 있으면 저장한다
    if (this.printOption.downloadNcodedPdf) {
      // 파일 이름을 변경하고
      const fn = getNcodedPdfName(filename, printOption.pdfMappingDesc.nPageStart, pagesPerSheet);
      saveAs(blob, fn);
    }

    // completed
    console.log("[PrintPdfMain] Print!!!");
    this.setStatus("completed");

    // mapping 정보를 등록
    if (this.printOption.needToIssueCode) {
      const storage = MappingStorage.getInstance();
      storage.register(tempMapping);
    }

    return;
  }


  private createPdfDocument = async (printOption: IPrintOption, sheets: IPrintingSheetDesc[], progressCallback: IProgressCallbackFunction) => {
    const media = printOption.mediaSize;
    const paperWidth_pt = convertUnit(media.unit as IUnitString, media.width, "pt");
    const paperHeight_pt = convertUnit(media.unit as IUnitString, media.height, "pt");

    const pdfDoc = await PDFDocument.create();

    const numSheets = sheets.length;
    for (let i = 0; i < numSheets; i++) {
      if (printOption.cancel) return undefined;

      const sheet = sheets[i];
      if (progressCallback) progressCallback();
      await sleep(10);
      await this.addSheetToPdfPage(pdfDoc, sheet, paperWidth_pt, paperHeight_pt);

      console.log(`doc add image = ${i + 1}/${numSheets}`);
    }

    return pdfDoc;
  }

  /**
   * 이 함수를 dialog로 수정함으로써 프린터 옵션을 바꿀 수 있다.
   */
  private getAssociatedMappingInfo = (printOption: IPrintOption, pdf: NeoPdfDocument) => {
    /** 코드 할당에 대한 기본 값을 써 주자 */
    const maps = MappingStorage.getInstance();
    const pdfMapDesc = maps.findAssociatedNcode(pdf.fingerprint, printOption.pagesPerSheet);

    /** 코드 할당에 대한 기본값 설정 */
    if (pdfMapDesc) {
      const pageInfo = pdfMapDesc.nPageStart;
      printOption.pageInfo = { ...pageInfo };
    }

    /** 기본 값으로는 모든 페이지를 인쇄하도록 */
    const numPages = pdf.numPages;
    printOption.targetPages = Array.from({ length: numPages }, (_, i) => i + 1);

    // 1,2 페이지만 인쇄
    // printOption.targetPages = Array.from({ length: 2 }, (_, i) => i + 1);
    // printOption.debugMode = 0;

    return pdfMapDesc;
  }

  private genaratePageNumsInSheets = (targetPages: number[], pagesPerSheet: number) => {
    const numPages = targetPages.length;
    const numSheets = Math.ceil(numPages / pagesPerSheet);

    const pageNumsInSheets: number[][] = new Array(numSheets);
    for (let i = 0; i < numSheets; i++) {
      pageNumsInSheets[i] = new Array(0);

      for (let j = 0; j < pagesPerSheet && (i * pagesPerSheet + j) < numPages; j++) {
        const pageNo = targetPages[i * pagesPerSheet + j];
        pageNumsInSheets[i].push(pageNo);
      }
      // pageNumsInSheets[i].push(numInSheet);
    }

    return pageNumsInSheets;
  }

  private getNewNcode = (printOption: IPrintOption) => {
    const { pagesPerSheet, hasToPutNcode, url, filename } = printOption;

    const { pdf } = this;

    const option: IPdfMappingDesc = {
      url,
      filename,
      fingerprint: pdf.fingerprint,
      id: makePdfId(pdf.fingerprint, pagesPerSheet as number),
      numPages: pdf.numPages,
    }
    const instance = MappingStorage.getInstance();
    const pdfMappingDesc = instance.issueNcode(option);
    return pdfMappingDesc;
  }

  private addSheetToPdfPage = async (pdfDoc, sheet, paperWidth_pt, paperHeight_pt) => {
    const cssStringToNumber = (css: string) => {
      return parseInt(css.substr(0, css.indexOf("px")));
    }

    const w = convertUnit("css" as IUnitString, cssStringToNumber(sheet.canvasDesc.css.width), "pt");
    const h = convertUnit("css" as IUnitString, cssStringToNumber(sheet.canvasDesc.css.height), "pt");
    const isLandscape = w > h;

    let pw, ph;
    if (isLandscape) { pw = paperHeight_pt; ph = paperWidth_pt; }
    else { pw = paperWidth_pt; ph = paperHeight_pt; }

    const x = (pw - w) / 2;
    const y = (ph - h) / 2;

    const pngUrl = sheet.canvas.toDataURL();
    // const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());
    // const pngImage = await pdfDoc.embedPng(pngImageBytes);
    const pngImage = await pdfDoc.embedPng(pngUrl);

    // const page = pdfDoc.addPage(PageSizes.A7);
    const page = pdfDoc.addPage([pw, ph]);
    page.drawImage(pngImage, {
      x, y, width: w, height: h,
      opacity: 1,
    })
  }

  private setMetaData = async (pdfDoc: PDFDocument, pdf: NeoPdfDocument, printOption: IPrintOption) => {
    const { pagesPerSheet } = printOption;
    const meta = await pdf.getMetadata();
    console.log(meta);

    const filename = getFilenameOnly(printOption.filename) + "." + getExtensionName(printOption.filename);
    const ncodeStr = makeNPageIdStr(printOption.pdfMappingDesc.nPageStart);

    pdfDoc.setTitle(meta.info.title ? meta.info.title : filename);
    pdfDoc.setAuthor('Gridaboard');
    pdfDoc.setSubject(`ncoded: ${ncodeStr}`);
    pdfDoc.setProducer(`${_lib_name} v${_version}`);
    pdfDoc.setCreator(`${_lib_name} v${_version} https://www.neolab.net/`);
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());

    pdfDoc.setKeywords(['Gridaboard', 'Ncode', 'Neosmartpen', 'NeoLAB', "Smartpen",
      `${pagesPerSheet}_pagesPerSheet`,
      `${makeNPageIdStr(printOption.pdfMappingDesc.nPageStart)}`]);

    this.setMetaInfoValue(pdfDoc, "mappingID", `${makePdfId(pdf.fingerprint, pagesPerSheet as number)}`);
    this.setMetaInfoValue(pdfDoc, "pagesPerSheet", `${pagesPerSheet}`);
    this.setMetaInfoValue(pdfDoc, "Ncode issused", ncodeStr);

    // addMetadataToDoc(pdfDoc, {
    //   author: _app_name,
    //   title: meta.info.title ? meta.info.title : filename,
    //   subject: `ncoded: ${ncodeStr}`,
    //   keywords: ['Gridaboard', 'Ncode', 'Neo smartpen', 'NeoLAB', `${pagesPerSheet} pages per sheet`, `${makeNPageIdStr(printOption.pdfMappingDesc.nPageStart)}`],
    //   producer: `${_lib_name} v${_version}`,
    //   creatorTool: `${_lib_name} v${_version} (https://www.neolab.net)`,
    //   documentCreationDate: new Date(),
    //   documentModificationDate: new Date(),
    //   metadataModificationDate: new Date(),
    //   ncodeStart: ncodeStr,
    //   pagesPerSheet: `${pagesPerSheet}`,
    //   mappingID: `${makePdfId(pdf.fingerprint, pagesPerSheet as number)}`,
    // });
  }

  private getInfoDict(pdfDoc: PDFDocument): PDFDict {
    const existingInfo = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Info);
    if (existingInfo instanceof PDFDict) return existingInfo;

    const newInfo = pdfDoc.context.obj({});
    pdfDoc.context.trailerInfo.Info = pdfDoc.context.register(newInfo);

    return newInfo;
  }

  private setMetaInfoValue = (pdfDoc: PDFDocument, key: string, value: string) => {
    const pdfKey = PDFName.of(key);
    this.getInfoDict(pdfDoc).set(pdfKey, PDFHexString.fromText(value));
  }

  private printByPrintJs = (ncodedUrl: string) => {
    printJS({
      printable: ncodedUrl,
      type: 'pdf',
      onError: function (error) {
        alert('Error found => ' + error.message)
      },
      showModal: false,
    });

  }

  private printByIFrame = (ncodedUrl: string) => {
    const uuid = uuidv4();
    const iframe = document.createElement("iframe");
    const name = `print_pdf_${uuid}`;
    iframe.name = name;
    iframe.setAttribute('style', 'height:0;width:0;border:0;border:none;visibility:hidden;');
    iframe.src = ncodedUrl;
    // iframe.height = "0";

    iframe.onload = () => {
      const wnd = iframe.contentWindow;

      if (wnd.matchMedia) {
        const mediaQueryList = wnd.matchMedia('print');
        mediaQueryList.addListener(function (mql) {
          if (mql.matches) {
            console.log("beforePrint();");
          } else {
            console.log("afterPrint();");
          }
        });
      }

      iframe.contentWindow.addEventListener('afterprint', (evt) => {
        document.body.removeChild(iframe)
      });
      window.frames[name].focus()
      window.frames[name].print()
    };

    document.body.appendChild(iframe);
  }

  private onFrameAfterPrint = (e) => {
    const ele = document.getElementsByName("print");
    const len = ele.length;
    const parentNode = ele[0].parentNode;
    for (let i = 0; i < len; i++) {
      parentNode.removeChild(ele[0]);
    }
  }

  private prepareSheet = async (sheetIndex: number, pageNums: number[]) => {
    const { pdf, printOption } = this;

    const rendererManager = SheetRendererManager.getInstance();
    const sheetDesc = await rendererManager.getPreparedSheet(pdf, pageNums, printOption, printOption.progressCallback);

    const ret: IPrintingEvent = { sheetIndex, pageNums, completion: 100, mappingItems: sheetDesc.mappingItems, sheetDesc }
    return ret;
  }


  resetPrintStatus = () => {
    const { filename, printOption } = this;
    this.setProgressPercent(0);
    const map = new PdfDocMapper(filename, printOption.pagesPerSheet);
    this.mapping = map;

    return map;
  }

  progressCallback = (event?: { status: string }) => {
    /** Event 카운트를 증가 */
    this.numReports++;

    const { targetPages, pagesPerSheet } = this.printOption;
    const numPages = targetPages.length;
    const numSheets = Math.ceil(numPages / pagesPerSheet);

    const maxCount = (numPages * 4) + (numSheets * 4) + numSheets + 1;
    // const percent = (eventCount / maxCount) * 100;
    let percent = (this.numReports / maxCount) * 100;

    if (event && event.status === "completed") {
      console.log(`[COUNT] count=${this.numReports - 1}/${maxCount} numPages=${numPages} numSheets=${numSheets}`);
      percent = 100;
    }

    this.setProgressPercent(percent);
    if (!event || !event.status) {
      this.reportProgress({ status: "imtermidate", totalCompletion: percent });
    }
    else {
      this.reportProgress({ status: event.status, totalCompletion: percent });
    }
  }


  cancelPrint = () => {
    this.printOption.cancel = true;
    console.log("cancel signaled");
  }
}


