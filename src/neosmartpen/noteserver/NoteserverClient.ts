import jQuery from "jquery";
import JSZip from "jszip";

let $ = jQuery;
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



  let $bookXml = $(xml).find("book");
  let title = $bookXml.find("title").text();
  let author = $bookXml.find("author").text();

  let name = `${author}_${title}_${section}_${owner}_${book}`;

  let Xmin_old = -1;
  let Ymin_old = -1;
  let Xmax_old = -1;
  let Ymax_old = -1;

  let result = [];

  let xmlData = $(xml).find("page_item");

  // $(xmlData).each(function () {
  xmlData.forEach(function (item) {
    // let ccc = $(this);
    let ccc = $(item);

    let x1 = parseFloat(ccc.attr("x1"));
    let x2 = parseFloat(ccc.attr("x2"));
    let y1 = parseFloat(ccc.attr("y1"));
    let y2 = parseFloat(ccc.attr("y2"));

    let crop_margin = ccc.attr("crop_margin");
    let margins = crop_margin.split(",");
    let l = parseFloat(margins[0]);
    let t = parseFloat(margins[1]);
    let r = parseFloat(margins[2]);
    let b = parseFloat(margins[3]);

    let page_no = parseInt(ccc.attr("number"));

    let Xmin = point72ToNcode(x1) + point72ToNcode(l);
    let Ymin = point72ToNcode(y1) + point72ToNcode(t);
    let Xmax = point72ToNcode(x2) - point72ToNcode(r);
    let Ymax = point72ToNcode(y2) - point72ToNcode(b);

    if (Xmin !== Xmin_old || Xmax !== Xmax_old || Ymin !== Ymin_old || Ymax !== Ymax_old) {
      // console.log(ccc.html());
      let obj = {
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

        let zip = new JSZip();
        zip.loadAsync(data).then(function (contents) {
          // console.log( contents.files);
          Object.keys(contents.files).forEach(function (filename) {
            zip.file(filename).async('nodebuffer').then(function (content) {
              let n = filename.search(".nproj");
              if (n > 0) {
                let xml = new TextDecoder("utf-8").decode(content);
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

export default class NoteserverClient {
  constructor() {

  }

  /**
   *
   * @param {{section:number, owner:number, book:number, page:number}} pageInfo
   */
  async getNoteInfo(pageInfo) {
    const { section, owner, book } = pageInfo;

    let url = "http://nbs.neolab.net/v1/notebooks/attributes?device=android";
    let el: any = document.getElementById('str')
    let s = encodeURIComponent(el.value);



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
        let arr = data.attributes;
        for (let i = 0; i < arr.length; i++) {
          // for (let i = 0; i < 2; i++) {
          let item = arr[i];

          let section = item.section_id;
          let owner = item.owner_id;
          let book = item.note_id;

          if (owner === 27 && book === 168) {
            let zipurl = item.resource.zipimage;
            getZippedResouce(zipurl, { section, owner, book });
          }

        }
        // page 정보
      },
      error: function (error) {
        console.log(error);
      },
      complete: function () {

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