import $ from "jquery";
import JSZip from "jszip";

// const $ = jQuery;
// window.$ = window.jQuery = jQuery;

const NCODE_SIZE_IN_INCH = 8 * 7 / 600;
const POINT_72DPI_SIZE_IN_INCH = 1 / 72;

const point72ToNcode = (p) => {
  const ratio = NCODE_SIZE_IN_INCH / POINT_72DPI_SIZE_IN_INCH;
  return p / ratio;
}


/**
 *
 * @param {string} xml
 * @param {{filename:string, section:number, owner:number, book:number}} option
 */
function extractMarginInfo(xml, option) {
  const { filename, section, owner, book } = option;



  const $bookXml = $(xml).find("book");
  const title = $bookXml.find("title").text();
  const author = $bookXml.find("author").text();

  const name = `${author}_${title}_${section}_${owner}_${book}`;

  let Xmin_old = -1;
  let Ymin_old = -1;
  let Xmax_old = -1;
  let Ymax_old = -1;

  const result = [];

  const xmlData = $(xml).find("page_item");

  // $(xmlData).each(function () {
  xmlData.forEach(function (item) {
    // let ccc = $(this);
    const ccc = $(item);

    const x1 = parseFloat(ccc.attr("x1"));
    const x2 = parseFloat(ccc.attr("x2"));
    const y1 = parseFloat(ccc.attr("y1"));
    const y2 = parseFloat(ccc.attr("y2"));

    const crop_margin = ccc.attr("crop_margin");
    const margins = crop_margin.split(",");
    const l = parseFloat(margins[0]);
    const t = parseFloat(margins[1]);
    const r = parseFloat(margins[2]);
    const b = parseFloat(margins[3]);

    const page_no = parseInt(ccc.attr("number"));

    const Xmin = point72ToNcode(x1) + point72ToNcode(l);
    const Ymin = point72ToNcode(y1) + point72ToNcode(t);
    const Xmax = point72ToNcode(x2) - point72ToNcode(r);
    const Ymax = point72ToNcode(y2) - point72ToNcode(b);

    if (Xmin !== Xmin_old || Xmax !== Xmax_old || Ymin !== Ymin_old || Ymax !== Ymax_old) {
      // console.log(ccc.html());
      const obj = {
        name,
        section,
        owner,
        book,
        Xmin,
        Ymin,
        Xmax,
        Ymax,
        Mag: 1,
      }
      console.log(obj);
      result.push(obj);
      Xmin_old = Xmin;
      Xmax_old = Xmax;

      Ymin_old = Ymin;
      Ymax_old = Ymax;
      console.log(`${section}.${owner}.${book} ==> ${filename}/${page_no} ==> ${crop_margin}`);
    }
  });

  // ${xml}.find("")
  console.log(xml);

}


/**
 *
 * @param {string} zipurl
 * @param {{section:number, owner:number, book:number}} bookInfo
 */
function getZippedResouce(zipurl, bookInfo) {
  const { section, owner, book } = bookInfo;

  fetch(zipurl).then((response) => {
    if (response.ok) {
      response.blob().then((data) => {

        const zip = new JSZip();
        zip.loadAsync(data).then(function (contents) {
          // console.log( contents.files);
          Object.keys(contents.files).forEach(function (filename) {
            zip.file(filename).async('nodebuffer').then(function (content) {
              const n = filename.search(".nproj");
              if (n > 0) {
                const xml = new TextDecoder("utf-8").decode(content);
                extractMarginInfo(xml, { filename, section, owner, book });
              }
              // let dest = path + filename;
              // fs.writeFileSync(dest, content);
            });
          });
        });
        // console.log(data);
      });
    }

  });
}

export default class NoteServerClient {
  // constructor() {

  // }

  /**
   *
   * @param {{section:number, owner:number, book:number, page:number}} pageInfo
   */
  async getNoteInfo(pageInfo) {
    // const { section, owner, book } = pageInfo;

    const url = "http://nbs.neolab.net/v1/notebooks/attributes?device=android";
    const el: HTMLInputElement = document.getElementById('str') as HTMLInputElement;
    const s = encodeURIComponent(el.value);



    // $.getJSON(url + "?callback=?", data, (data) => { console.log(data); } );

    $.ajax({
      type: "GET",
      dataType: "json",
      url: url,
      data: { 's': s },
      jsonpCallback: "myCallback",
      // jsonpCallback: "callback",
      success: function (data) {
        // console.log(data);
        const arr = data.attributes;
        for (let i = 0; i < arr.length; i++) {
          // for (let i = 0; i < 2; i++) {
          const item = arr[i];

          const section = item.section_id;
          const owner = item.owner_id;
          const book = item.note_id;

          if (owner === 27 && book === 168) {
            const zipurl = item.resource.zipimage;
            getZippedResouce(zipurl, { section, owner, book });
          }

        }
        // page 정보
      },
      error: function (error) {
        console.log(error);
      },
      complete: function () {
        console.log("completed");
      },
    });


    //   let response;
    //   try {
    //     let origin = window.location.origin;
    //     const headers = { authorization: `Bearer` };

    //     response = await fetch("http://nbs.neolab.net/v1/notebooks/attributes?device=android", { headers });
    //   } catch (err) {
    //     console.error(err);
    //     return;
    //   }

    //   console.log("test 1 response.status : ", response.status);

    //   if (response.ok) {
    //     let jsonData = await response.json();

    //     for (let i = 0; i < jsonData.resultElements.length; i++) {
    //       let resultElement = jsonData.resultElements[i];
    //       console.log(resultElement);
    //     }
    //   }
    // }
  }
}