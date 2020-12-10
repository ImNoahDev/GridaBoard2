import { INcodeToAreaStore, INcodePolygonsTable } from "./NcodeGps";
import { IPageSOBP, IPoint, INcodeSOBPxy } from "../DataStructure/Structures";
import { IMappingParams, } from "../Coordinates";
import { MappingItem } from "./MappingItem";
// import { restoreDashPattern } from "pdf-lib";

/**
 * public getMappingItem = (ncodeXy: INcodeSOBPxy): IMappingParams | null
 *
 * public addMappingArea = async (arg: IMappingParam)
 */
export class AreaToPosMapper {
  ncodeToPdfStorage: INcodeToAreaStore = {};
  mappingItems: INcodePolygonsTable = [];


  /**
   * polygon 내부에 있으면 true, 그렇지 않으면 false
   * @param pt
   * @param ploygon
   */
  private isPtInPolygon(pt: IPoint, ploygon: IPoint[]) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    const x = pt.x, y = pt.y;

    let inside = false;
    for (let i = 0, j = ploygon.length - 1; i < ploygon.length; j = i++) {
      const xi = ploygon[i][0], yi = ploygon[i][1];
      const xj = ploygon[j][0], yj = ploygon[j][1];

      const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }


  /**
   * Ncode xy 좌표에 mapping된 PDF 파일과 페이지가 있으면 mappingItem을 return
   * 없으면 null
   *
   * @param ncodeXy
   */
  public getMappingItem = (ncodeXy: INcodeSOBPxy): IMappingParams | null => {
    const pageInfo = ncodeXy as IPageSOBP;

    const pageObj = this.getPageObject(pageInfo);
    if (!pageObj) {
      return null;
    }

    const pt = ncodeXy as IPoint;
    const areas = pageObj.areas;
    const mappingItem = areas.filter(item => this.isPtInPolygon(pt, item.npageArea));

    if (mappingItem.length > 0) {
      return mappingItem[0];
    }

    return null;
  }


  /**
   * mapping data 저장소에 저장된 pageInfo 의 page가 있으면 pageObj 아니면 null
   * @param pageInfo
   */
  private getPageObject = (pageInfo: IPageSOBP): { areas: INcodePolygonsTable } | null => {
    const { section, owner, book, page } = pageInfo;

    const db = this.ncodeToPdfStorage;
    if (!Object.prototype.hasOwnProperty.call(db, "section")) return null;

    const sectionObj = db[section];
    if (!Object.prototype.hasOwnProperty.call(sectionObj, "owner")) return null;

    const ownerObj = sectionObj[owner];
    if (!Object.prototype.hasOwnProperty.call(ownerObj, "book")) return null;

    const bookObj = ownerObj[owner];
    if (!Object.prototype.hasOwnProperty.call(bookObj, "page")) return null;

    const pageObj = bookObj[page];
    return pageObj;
  }


  /**
   * mapping data 저장소에 저장된 pageInfo 의 page가 있으면 pageObj, 아니면 만들어서 return
   * @param pageInfo
   */
  private createPageObject = (pageInfo: IPageSOBP): { areas: INcodePolygonsTable } => {
    const { section, owner, book, page } = pageInfo;

    const db = this.ncodeToPdfStorage;
    if (!Object.prototype.hasOwnProperty.call(db, "section")) db[section] = {};

    const sectionObj = db[section];
    if (!Object.prototype.hasOwnProperty.call(sectionObj, "owner")) sectionObj[owner] = {};

    const ownerObj = sectionObj[owner];
    if (!Object.prototype.hasOwnProperty.call(ownerObj, "book")) ownerObj[book] = {};

    const bookObj = ownerObj[owner];
    if (!Object.prototype.hasOwnProperty.call(bookObj, "page")) bookObj[page] = { areas: [] };

    const pageObj = bookObj[page];
    return pageObj;
  }


  /**
   * mapping data 저장소에 mapping item을 저장
   * @param item
   */
  private push = (item: IMappingParams) => {
    // 벌크 배열에도 넣고
    this.mappingItems.push(item);

    // pageInfo 를 넣으면 바로 찾을 수 있도록도 넣자
    const pageObj = this.createPageObject(item.pageInfo);
    pageObj.areas.push(item);
  }


  /**
   * 4개점(또는 3개점)의 calibration 대상 점들을 넣으면 mapping item을 추가
   * @param arg
   */
  public addMappingArea = async (arg: MappingItem) => {
    // // 변환 행렬을 계산, NU to PU
    // const converter = new CoordinateTanslater();
    // converter.calc(arg);

    // // PDF가 차지하는 Ncode 영역을 계산
    // const page = await arg.pdfDoc.getPage(arg.pageNo);
    // const viewport = page.getViewport({ scale: 1 });
    // const pdfSize = { width: viewport.width, height: viewport.height };

    // const topLeft: IPoint = converter.PUtoNU({ x: 0, y: 0 });
    // const topRight: IPoint = converter.PUtoNU({ x: pdfSize.width, y: 0 });
    // const bottomRight: IPoint = converter.PUtoNU({ x: pdfSize.width, y: pdfSize.height });
    // const bottomLeft: IPoint = converter.PUtoNU({ x: 0, y: pdfSize.height });

    // /** PDF가 차지하는 Ncode 영역 */
    // const npageArea: IPolygonArea = [topLeft, topRight, bottomRight, bottomLeft];

    // const mappingItem: IMappingParams = {
    //   pageInfo: { ...arg.pageInfo },
    //   npageArea,

    //   pdfDesc: arg.pdfDesc,
    //   pageNo: arg.pageNo,
    //   h: converter.params
    // }

    // this.push(mappingItem);
  }
}