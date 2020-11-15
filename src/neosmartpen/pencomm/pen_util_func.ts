
// pen packet에 있는 escape code를 처리
export function unescapePacket(packet) {
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

export function intFromBytes(data, start, length) {
  let val = 0;
  for (let i = start + length - 1; i >= start; --i) {
    val += data[i];
    if (i > start) {
      val = val << 8;
    }
  }
  return val;
}

export async function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}


export function decimalToHex(d, padding) {
    let hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex.toUpperCase();
}