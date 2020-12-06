export function compareObject(curr: Object, next: Object, header: string = "") {
  for (const [key, value] of Object.entries(next)) {
    if (curr[key] !== value) {
      console.log(`[${header}] state[${key}] was changed, from "${curr[key]} to "${value}"`);
    }
  }
}



export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    let r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}


export function getDocumentId(fingerprint: string, pagesPerSheet: number): string {
  return fingerprint + "/" + pagesPerSheet.toString();
}
