import * as Zlib from "zlib";
export async function fetchGzippedFile(url: string): Promise<string> {
  const header = {
    headers: {
      'Content-Encoding': 'gzip',
      "dataType": "text",
    },

  }

  let blob = undefined;
  const response = await fetch(url, header);
  try {
    blob = await response.blob();
  }
  catch (e) {
    console.log(response);
    console.log(e);
    throw (e);
  }

  if (!blob) { throw ("cannot get gzipped blob from URL"); }

  const buffer = await blob.arrayBuffer();
  const u8buf = new Uint8Array(buffer);

  return new Promise((resolve, reject) => {
    function gunzipCallback(decompressed) {
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
            reject("");
          }
          gunzipCallback(result);
        });
      } catch (e) {
        reject("");
      }
    }
  });
}