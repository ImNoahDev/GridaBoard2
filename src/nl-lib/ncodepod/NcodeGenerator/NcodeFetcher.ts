import * as Zlib from "zlib";
import { sprintf } from "sprintf-js";
import { getNPaperInfo } from "../../common/noteserver";
import { INoteServerItem_forPOD, IPageSOBP } from "../../common/structures";


/**
 * Class
 */
export default class NcodeFetcher {
  pageInfo: IPageSOBP;
  private codeText = "";

  // private fetchPromise: Promise<string> = Promise.resolve("");


  // constructor(pageInfo: IPageSOBP) {
  //   this.pageInfo = pageInfo;
  //   console.log(`[fetch] CONSTRUCTOR, Download NCODE: ${makeNPageIdStr(pageInfo)}`);
  //   const pr = this.fetchNcodeData(pageInfo);
  //   this.fetchPromise = pr;

  //   pr.then(txt => {
  //     console.log(`[fetch] CONSTRUCTOR, Download completed: ${makeNPageIdStr(pageInfo)}`);
  //     this.codeText = txt;
  //   });
  // }


  /**
   * 코드 정보를 받아온다
   * 코드 정보를 받아올 때 나중에는 x margin, y margin도 서버에서 받아오게 해야 한다 2020/11/26
   * @param pageInfo
   */

  // public getNcodeData = async (pageInfo: IPageSOBP) => {
  //   // glyph text를 받아 온다.
  //   let code_txt = "";
  //   if (Util.isSamePage(this.pageInfo, pageInfo)) {
  //     console.log(`[fetch] wait for: ${makeNPageIdStr(pageInfo)}`);
  //     code_txt = await this.fetchPromise;
  //     console.log(`[fetch] download completed: ${makeNPageIdStr(pageInfo)} len=${code_txt.length}`);
  //     this.codeText = code_txt;
  //   }
  //   else {
  //     console.log(`[fetch] Download new NCODE: ${makeNPageIdStr(pageInfo)}`);
  //     const promise = this.fetchNcodeData(pageInfo);
  //     this.fetchPromise = promise;
  //     code_txt = await this.fetchPromise;
  //     console.log(`[fetch] download NEW completed: ${makeNPageIdStr(pageInfo)} len=${code_txt.length}`);

  //     this.pageInfo = pageInfo;
  //     this.codeText = code_txt;
  //   }

  //   const result: INoteServerItem_forPOD = getNPaperInfo(pageInfo);
  //   result.glyphData = code_txt;

  //   return result;
  // }
  public getNcodeData = async (pageInfo: IPageSOBP) => {
    // glyph text를 받아 온다.
    const code_txt = await this.fetchNcodeData(pageInfo);
    this.pageInfo = pageInfo;
    this.codeText = code_txt;

    const result: INoteServerItem_forPOD = getNPaperInfo(pageInfo);
    result.glyphData = code_txt;

    return result;
  }


  private fetchNcodeData = async (pageInfo: IPageSOBP): Promise<string> => {
    const url = this.getRawCodeDataUrl(pageInfo);

    // const res = await axios.get('https://dog.ceo/api/breeds/list/all');
    // const blob = await res.blob();

    // const blob = await fetch(url).then(res => res.blob()).catch(reason => {
    //   console.log(reason);
    // });

    let success = false;
    let retryCount = 0;
    let blob = undefined;

    while (!success && retryCount < 3) {
      const rand = (new Date()).getTime();

      let urlRetry = url;
      if (retryCount > 0) {
        urlRetry = sprintf("%s?%d", url, rand);
      }

      console.log(`[fetch] ${pageInfo.section}.${pageInfo.owner}.${pageInfo.book}.${pageInfo.page} - URL ${urlRetry}`);
      const header = {
        headers: {
          'Content-Encoding': 'gzip',
          "dataType": "text",
        },

      }

      const response = await fetch(urlRetry, header);
      try {
        blob = await response.blob();
        success = true;
      }
      catch (e) {
        console.log(response);
        console.log(e);
        retryCount++;
      }
    }

    // const blob = await fetch(url).then(res => res.blob()).catch(reason => {
    //   console.log(reason);
    // });

    if (!blob) return "";
    const buffer = await blob.arrayBuffer();
    const u8buf = new Uint8Array(buffer);

    return new Promise((resolve, reject) => {
      function gunzipCallback(decompressed) {
        // console.log(decompressed);
        const txt = new TextDecoder("utf-8").decode(decompressed);
        resolve(txt);
      }

      if (blob != null) {
        try {
          // eslint-disable-next-line
          const gunzip = new Zlib.gunzip(u8buf, (err, result) => {
            // console.error(err);
            if (err) {
              console.log(err);
              resolve("");
            }
            gunzipCallback(result);
          });
        } catch (e) {
          resolve("");
        }
      }
    });
  }

  // private fetchNcodeData = async (pageInfo: IPageSOBP): Promise<string> => {
  //   return new Promise(async (resolve, reject) => {
  //     // console.log(`[fetch] ${pageInfo.section}.${pageInfo.owner}.${pageInfo.book}.${pageInfo.page}`);
  //     const url = this.getRawCodeDataUrl(pageInfo);

  //     const blob = await fetch(url).then((r) => {

  //       if (r.ok) {
  //         return r.blob();
  //       }

  //       resolve("");
  //     });

  //     function gunzipCallback(decompressed) {
  //       // console.log(decompressed);
  //       const txt = new TextDecoder("utf-8").decode(decompressed);
  //       resolve(txt);
  //     }

  //     if (blob != null) {
  //       try {
  //         const buffer = await blob.arrayBuffer();
  //         const u8buf = new Uint8Array(buffer);
  //         // eslint-disable-next-line
  //         const gunzip = new Zlib.gunzip(u8buf, (err, result) => {
  //           // console.error(err);
  //           if (err) {
  //             console.log(err);
  //             resolve("");
  //           }
  //           gunzipCallback(result);
  //         });
  //       } catch (e) {
  //         resolve("");
  //       }
  //     }
  //   });
  // }



  private getAbsoluteURL = (base: string, relative: string): string => {
    const stack = base.split("/");
    const parts = relative.split("/");

    stack.pop(); // remove current file name (or empty string)

    // (omit if "base" is the current folder without trailing slash)
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === ".") continue;
      if (parts[i] === "..") stack.pop();
      else stack.push(parts[i]);
    }
    return stack.join("/");
  }


  private getRawCodeDataUrl = (pageInfo: IPageSOBP): string => {

    const { section, owner, book, page } = pageInfo;

    const ncode_idx = "s" + section + "-o" + owner + "-b" + book + "-p" + page;
    const dir_name = "s" + section + "-o" + owner + "-b" + book;

    const filename = "./ncode_data/" + dir_name + "/" + ncode_idx + ".code.gz";
    const doc_url = document.location.href;
    const url = this.getAbsoluteURL(doc_url, filename);

    return url;
  }
}



