import { CoordinateTanslater, IMappingParams, IPdfPageDesc } from "../Coordinates";
import { INcodeSOBPxy, IPageSOBP } from "../DataStructure/Structures";
import { isSamePage } from "../NcodeSurface";
import { IPdfDocDesc } from "../NeoPdf/NeoPdfDocument";

let _instance: MappingStorage = null;
const LOCAL_STORAGE_ID = "GridaBoard_codeMappingInfo_v2";

export default class MappingStorage {
  _arrMapped: IMappingParams[] = [];

  private constructor() {
  }

  static getInstance() {
    if (_instance) return _instance;

    _instance = new MappingStorage();
    return _instance;
  }

  register = (item: CoordinateTanslater) => {
    const params = item.mappingParams;

    let now = new Date();
    let timeStr =
      `${addZeros(now.getFullYear(), 2)}/` +
      `${addZeros(now.getMonth() + 1, 2)}/` +
      `${addZeros(now.getDate(), 2)} ` +
      `${addZeros(now.getHours(), 2)}:` +
      `${addZeros(now.getMinutes(), 2)}:` +
      `${addZeros(now.getSeconds(), 2)}.` +
      `${addZeros(now.getMilliseconds(), 4)}`;

    params.timeString = timeStr; // JSON.stringify(new Date());
    this._arrMapped.push(params);
  }

  /**
   * pen down시에 새로운 SOBP라면, 관련된 PDF가 있는지 찾을 때 쓰인다
   */
  findPdfPage = (ncodeXy: INcodeSOBPxy) => {
    // const pdfPageInfo: IPdfPageDesc = null;
    // const pdfDocInfo: IPdfDocDesc = null;

    // let found = -1;
    // for ( let i=0; i<this._arrMapped.length; i++ ) {
    //   const trans = this._arrMapped[i];
    //   if ( isSamePage(ncodeXy as IPageSOBP, trans.pageInfo) ) {
    //     found = i;
    //     break;
    //   }
    // }


    /** 원래는 폴리곤에 속했는지 점검해야 하지만, 현재는 같은 페이지인지만 점검한다  2020/12/06 */
    const found = this._arrMapped.find(trans => isSamePage(ncodeXy, trans.pageInfo));
    return found;
  }

  /**
   * Ncode가 발행된 적이 있는지를 점검하기 위해서 쓰인다.
   */
  findMappedNcode = (pdfId: string) => {
    const found = this._arrMapped.find(trans => pdfId === trans.pdfDesc.id);
    return found;
  }

  dump = (prefix: string) => {
    console.log(`[${prefix}]----------------------------------------------------------------------`);
    const str = JSON.stringify(this._arrMapped, null, "  ");
    const arr = str.split("\n");

    for (let i = 0; i < arr.length; i++) {
      console.log(`[${prefix}] ${arr[i]}`);
    }
    console.log(`[${prefix}]----------------------------------------------------------------------`);
  }



  storeMappingInfo = () => {
    if (storageAvailable("localStorage")) {
      const key = LOCAL_STORAGE_ID;
      const value = JSON.stringify(this._arrMapped);
      // console.log(`Pdf Ncode Info Saved   ${key}: ${value}`);
      localStorage.setItem(key, value);

      return true;
    }

    return false;
  }


  /**
   * app이 기동되면 반드시 처음에 load하자
   *
   * @return {boolean}
   */
  loadMappingInfo = () => {
    if (storageAvailable("localStorage")) {
      const key = LOCAL_STORAGE_ID;
      const value = localStorage.getItem(key);

      if (value) {
        this._arrMapped = JSON.parse(value);

        this._arrMapped.sort(function (a, b) {
          if (a.timeString < b.timeString) return 1;
          else if (a.timeString > b.timeString) return -1;
          else return 0;
        });

        // const debug = JSON.stringify(this._arrMapped);
        // console.log(`Pdf Ncode Info Loaded   ${key}: ${debug}`);
        return true;
      }
    }

    return false;
  }
}


function storageAvailable(type) {
  let storage;
  try {
    storage = window[type];
    let x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // Firefox를 제외한 모든 브라우저
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // 코드가 존재하지 않을 수도 있기 떄문에 이름 필드도 확인합니다.
        // Firefox를 제외한 모든 브라우저
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // 이미 저장된 것이있는 경우에만 QuotaExceededError를 확인하십시오.
      storage &&
      storage.length !== 0
    );
  }
}


function addZeros(num, digit) {
  // 자릿수 맞춰주기
  let zero = "";
  num = num.toString();
  if (num.length < digit) {
    for (let i = 0; i < digit - num.length; i++) {
      zero += "0";
    }
  }
  return zero + num;
}
