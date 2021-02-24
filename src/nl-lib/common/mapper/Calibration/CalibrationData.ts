import { IPageSOBP, IPdfPageDesc, IPoint, IPolygonArea } from "../../structures";
import CoordinateTanslater from "../CoordinateTanslater";
import { MappingItem } from "../MappingItem";
import { MappingStorage } from "../MappingStorage";
import PdfDocMapper from "../PdfDocMapper";

const DUMMY = 0;      // 이 코드는 sample에서만 필요

type CalibrationInputPtsType = {
  pageNo: number,
  pts: {
    nu: { p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, },
    pu: { p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, }
  }
}

/**
 * // 사용 방법
 *
 * // 2점의 펜 좌표와, 2점의 대응되는 PDF 좌표를 알고 있을 때 시작
 *
 * const worker = new CalibrationData();
 * worker.setFirstPage( ... );      // 2점의 펜 좌표와, 2점의 대응되는 PDF 좌표
 * const translaters = worker.getTranslaters( numPages );  // numPages는 PDF 페이지 수
 *
 * // 그 다음 등록
 * const msi = MappingStorage.getInstance();
 * msi.register(tempMapping);
 *
 */
class CalibrationData {

  pts = {
    nu: {
      p0: { x: undefined as number, y: undefined as number },
      p1: { x: undefined as number, y: undefined as number },
      p2: { x: undefined as number, y: undefined as number },
      p3: { x: undefined as number, y: undefined as number },
    },
    pu: {
      p0: { x: undefined as number, y: undefined as number },
      p1: { x: undefined as number, y: undefined as number },
      p2: { x: undefined as number, y: undefined as number },
      p3: { x: undefined as number, y: undefined as number },
    }
  }

  pdfPageDesc: IPdfPageDesc;
  pageInfos: IPageSOBP[];



  /**
   * 문서를 매핑 정보를 등록할, 최종의 Item을 한방에구한다
   *
   * usage:
   *    const worker = new CalibrationData();
   *    const mapper = worker.createDocMapperItemOneClick(
   *          nu, pu, pageInfos, filename, numPages, 1
   *    );
   *
   *    const msi = MappingStorage.getInstance();
   *    msi.register(mapper);
   *
   * @param numPages
   **/
  public createDocMapperItemOneStep = (
    nu: { p0: IPoint, p2: IPoint, },    // pen으로 부터 들어온 2점
    pu: { p0: IPoint, p2: IPoint, },    // PDF의 2점

    pageInfos: IPageSOBP[],

    pdfPageDesc: IPdfPageDesc,
    filename: string,           // PDF filename
    numPages: number,           // PDF 페이지 수
    pagesPerSheet = 1,  // 종이 1장에 인쇄된 페이지수, 캘리브레이션에서는 1만 유효
  ) => {

    this.setPdfDesc(pdfPageDesc);
    this.setNcodePageinfos(numPages, pageInfos)
    this.setFirstPage(nu, pu);      // 2점의 펜 좌표와, 2점의 대응되는 PDF 좌표

    const mapping = new PdfDocMapper(filename, pagesPerSheet);

    for (let i = 0; i < numPages; i++) {
      const pageNo = i + 1;
      const pdfPageDesc = { ...this.pdfPageDesc, pageNo };
      const pageInfo = this.pageInfos[pageNo - 1];

      // 아래 translater에는 PDF 정보와, pageInfo도 같이 들어 있게 된다.
      const translater = this.getTranslater(
        pageNo,
        pdfPageDesc,
        pageInfo,
        this.pts
      );
      mapping.append([translater]);
    }

    return mapping;
  }



  /**
   * 문서를 매핑 정보를 등록할, 최종의 Item을 단계적으로 구한다
   * STEP 4,
   *
   * usage:
   *    const worker = new CalibrationData();
   *    worker.setNcodePageinfos(numPages, pageInfos);
   *    worker.setPdfDesc(pdfPageDesc);
   *
   *    worker.setFirstPage(nu, pu);      // 2점의 펜 좌표와, 2점의 대응되는 PDF 좌표
   *
   *    const mapper = worker.createDocMapperItemOneClick( filename, numPages, 1 );
   *
   *    const msi = MappingStorage.getInstance();
   *    msi.register(mapper);
   *
   * @param numPages
   **/
  public createDocMapperItem = (
    filename: string,           // PDF filename
    numPages: number,           // PDF 페이지 수
    pagesPerSheet = 1,  // 종이 1장에 인쇄된 페이지수, 캘리브레이션에서는 1만 유효
  ) => {

    if (!this.pageInfos || !this.pdfPageDesc
      || !this.pts.nu.p0 || !this.pts.nu.p2 || !this.pts.pu.p0 || !this.pts.pu.p2
    ) {
      throw new Error(
        "usage:\n" +
        "   const worker = new CalibrationData();\n" +
        "   worker.setNcodePageinfos(numPages, pageInfos);\n" +
        "   worker.setPdfDesc(pdfPageDesc);\n" +
        "\n" +
        "   worker.setFirstPage(nu, pu);\n" +
        "\n" +
        "   const mapper = worker.createDocMapperItemOneClick( filename, numPages, 1 );\n" +
        "\n" +
        "   const msi = MappingStorage.getInstance();\n" +
        "   msi.register(mapper);"
      )
    }
    const mapping = new PdfDocMapper(filename, pagesPerSheet);

    for (let i = 0; i < numPages; i++) {
      const pageNo = i + 1;
      const pdfPageDesc = { ...this.pdfPageDesc, pageNo };
      const pageInfo = this.pageInfos[pageNo - 1];

      // 아래 translater에는 PDF 정보와, pageInfo도 같이 들어 있게 된다.
      const translater = this.getTranslater(
        pageNo,
        pdfPageDesc,
        pageInfo,
        this.pts
      );
      mapping.append([translater]);
    }

    return mapping;
  }

  /**
   * STEP 1
   * @param numPages
   * @param pageInfos
   */

  public setNcodePageinfos = (numPages: number, pageInfos: IPageSOBP[]) => {
    if (pageInfos.length !== numPages) {
      throw new Error(`PageInfo array lenth(${pageInfos.length}) is not equal to "numPages${numPages}"`);
    }

    this.pageInfos = pageInfos;
  }


  /**
   * STEP 2
   * @param numPages
   * @param pageInfos
   */

  public setPdfDesc = (pdfPageDesc: IPdfPageDesc) => {
    this.pdfPageDesc = pdfPageDesc;

  }

  /**
   * STEP 4
   * @param numPages
   * @param pageInfos
   */

  public setFirstPage = (
    nu: { p0: IPoint, p2: IPoint, },
    pu: { p0: IPoint, p2: IPoint, }
  ) => {
    this.pts.nu.p0 = { ...nu.p0 };
    this.pts.nu.p2 = { ...nu.p2 };

    this.pts.pu.p0 = { ...pu.p0 };
    this.pts.pu.p2 = { ...pu.p2 };

    // 여기서 nu.p1, nu.p3와, 그것에 대응되는 pu.p1, pu.p3를 구한다
    // 구한 것을 p1, p3에 넣는다.

    const restPts = this.getP1andP3(nu, pu);

    this.pts.nu.p1 = { ...restPts.nu.p1 };
    this.pts.nu.p3 = { ...restPts.nu.p3 };

    this.pts.pu.p1 = { ...restPts.pu.p1 };
    this.pts.pu.p3 = { ...restPts.pu.p3 };
  }


  /**
   * 여기서, p1, p3를 구한다. 그리다보드 1의 코드를 참조할 것
   * @param nu
   * @param pu
   */
  private getP1andP3 = (
    nu: { p0: IPoint, p2: IPoint, },
    pu: { p0: IPoint, p2: IPoint, }
  ) => {

    // 아래 코드는 sample에서만 필요 (p1, p3의 더미 값)
    const pts = {
      nu: {
        p1: { x: DUMMY, y: DUMMY } as IPoint,
        p3: { x: DUMMY, y: DUMMY } as IPoint,
      },
      pu: {
        p1: { x: DUMMY, y: DUMMY } as IPoint,
        p3: { x: DUMMY, y: DUMMY } as IPoint,
      }
    }
    // 여기까지

    return pts;
  }


  /**
   *
   * @param pageNo - PDF Page 번호
   * @param pdfPageDesc - PDF page descriptor
   * @param pageInfo - Ncode PageInfo
   * @param pts - 매핑되는 점들
   */
  private getTranslater = (
    pageNo: number,
    pdfPageDesc: IPdfPageDesc,

    pageInfo: IPageSOBP,

    pts: {
      nu: { p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, },
      pu: { p0: IPoint, p1: IPoint, p2: IPoint, p3: IPoint, }
    }
  ) => {

    const mapData = new MappingItem(pageNo);


    const { nu, pu } = pts;

    // Ncode 좌표 (펜으로 부터)
    const srcPoints: IPolygonArea = [nu.p0, nu.p1, nu.p2, nu.p3];

    // PDF 좌표 (캘리브레이션 마크가 찍힌 자리의 PU 좌표)
    const dstPoints: IPolygonArea = [pu.p0, pu.p1, pu.p2, pu.p3];


    /** NCode 좌표계 */
    mapData.setNcodeArea({
      pageInfo: pageInfo,
      basePageInfo: pageInfo,

      // 주1)
      // rect와 npageArea로 정의된 값은 이 class에서는 쓸모 없다.
      // setSrc4Points_ncode에 의해 다시 값이 정해진다.
      //
      // 이렇게 쓴 이유는, setNcodeArea가 회전 안된 직사각형에만 대응되는 함수여서,
      // 당연히 함수를 추가해서 수정해야 하지만, MappingItem class를 수정하지 않기 위해서
      rect: {
        unit: "nu",
        x: nu.p0.x,
        y: nu.p0.y,
        width: nu.p2.x - nu.p0.x,
        height: nu.p2.y - nu.p0.y,
      },
      npageArea: srcPoints,
      // 여기까지
    });
    // 위 주1의 rect, npageArea로 구해진 4개 점을 새로 세팅하도록 한다.
    mapData.setSrc4Points_ncode(srcPoints);


    /** PDF 좌표계 */
    mapData.setPdfArea({
      pdfPageInfo: { ...pdfPageDesc, pageNo },

      // 주1과 같은 이유
      rect: {
        unit: "pu",
        x: pu.p0.x,
        y: pu.p0.y,
        width: pu.p2.x - pu.p0.x,
        height: pu.p2.y - pu.p0.y,
      }
    });
    // 위 주1의 rect, npageArea로 구해진 4개 점을 새로 세팅하도록 한다.
    mapData.setDst4Points_pdf(dstPoints);


    const trans = new CoordinateTanslater();
    trans.calc(mapData);
    return trans
  }
}


function sampleCalibration_1(
  nu: { p0: IPoint, p2: IPoint, },    // pen으로 부터 들어온 2점
  pu: { p0: IPoint, p2: IPoint, },    // PDF의 2점
  pageInfos: IPageSOBP[],     // Ncode Page 정보들, numPages 만큼의 길이를 가져야 한다.
  filename: string,           // PDF filename
  numPages: number,           // PDF 페이지 수
  pdfPageDesc: IPdfPageDesc,
  pagesPerSheet = 1,  // 종이 1장에 인쇄된 페이지수, 캘리브레이션에서는 1만 유효
) {

  const worker = new CalibrationData();
  worker.setNcodePageinfos(numPages, pageInfos);
  worker.setPdfDesc(pdfPageDesc);

  worker.setFirstPage(nu, pu);      // 2점의 펜 좌표와, 2점의 대응되는 PDF 좌표
  const mapper = worker.createDocMapperItem(
    filename,
    numPages,
    pagesPerSheet,
  );

  // 그 다음 등록
  const msi = MappingStorage.getInstance();
  msi.register(mapper);
}


function sampleCalibration_OneStep(
  nu: { p0: IPoint, p2: IPoint, },    // pen으로 부터 들어온 2점
  pu: { p0: IPoint, p2: IPoint, },    // PDF의 2점
  pageInfos: IPageSOBP[],     // Ncode Page 정보들, numPages 만큼의 길이를 가져야 한다.

  pdfPageDesc: IPdfPageDesc,
  filename: string,           // PDF filename
  numPages: number,           // PDF 페이지 수
  pagesPerSheet = 1,  // 종이 1장에 인쇄된 페이지수, 캘리브레이션에서는 1만 유효
) {

  const worker = new CalibrationData();
  const mapper = worker.createDocMapperItemOneStep(
    nu, pu, pageInfos,
    pdfPageDesc,
    filename,
    numPages,
    pagesPerSheet,
  );

  // 그 다음 등록
  const msi = MappingStorage.getInstance();
  msi.register(mapper);
}
