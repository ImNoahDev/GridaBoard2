import { IMappingParams, IPdfPageDesc } from "../Coordinates";
// import * as PdfJs from "pdfjs-dist";


/**
 * 하나의 PDF 파일을 열었을 때, ncode to position을 처리하기 위한 것
 */
export type INcodePdfDescriptor = {
  pdfInfo: IPdfPageDesc;

  mappingTable: IMappingParams[],
}


/**
 * PDF 파일의 ncode 좌표 처리를 위한 단일 객체
 * 하나의 PDF 파일에는
 */
export type IPdfTable = {
  [pdfId: string]: INcodePdfDescriptor;
}


/**
 * Ncode에 mapping된 영역들의 저장소 타입
 */
export type INcodePolygonsTable = IMappingParams[];

/**
 * section.owner.book.page에서 바로 PDF 정보를 가져오기 위한 storage type
 */
export interface INcodeToAreaStore extends Object {
  [section: number]: {
    [owner: number]: {
      [book: number]: {
        [page: number]: {
          areas: INcodePolygonsTable,
        }
      }
    }
  }
}


