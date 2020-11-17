
/**
 * pen packet에 있는 escape code를 처리
 * @param packet 
 */
export function unescapePacket(packet: Uint8Array): Uint8Array {
  const len = packet.length;
  const unescapedBuf = new Uint8Array(len);

  let cnt = 0;
  for (let i = 0; i < len; i++) {
    if (packet[i] === 0x7d) {
      unescapedBuf[cnt++] = packet[i + 1] ^ 0x20;
      i++;
    } else {
      unescapedBuf[cnt++] = packet[i];
    }
  }

  return unescapedBuf.subarray(0, cnt);
}

/**
 * return little endian value from start with length
 * @param data - byte array
 * @param start 
 * @param length 
 */
export function intFromBytes(data: Uint8Array, start: number, length: number): number {
  let val = 0;
  for (let i = start + length - 1; i >= start; --i) {
    val += data[i];
    if (i > start) {
      val = val << 8;
    }
  }
  return val;
}

/*

export async function sleep(ms: number) {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}


/**
 * 
 * @param val - integer number
 * @param padding - how many hex digits
 */
export function decimalToHex(val: number, padding: number) {
  let hex = Number(val).toString(16);
  padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

  while (hex.length < padding) {
    hex = "0" + hex;
  }

  return hex.toUpperCase();
}