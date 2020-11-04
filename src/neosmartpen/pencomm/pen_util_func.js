
// pen packet에 있는 escape code를 처리
export function unescapePacket(packet) {
  var len = packet.length;
  var unescapedBuf = new Uint8Array(len);

  var cnt = 0;
  for (var i = 0; i < len; i++) {
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
  var val = 0;
  for (var i = start + length - 1; i >= start; --i) {
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
