import "../types";

/**
 *
 * @param {TimebasedRenderStrokes} strokeStream
 * @return {StrokeTimeInfo}
 */

export const getStrokesTimeInfo = (strokeStream) => {
  // 전체 필기, 시작시간, 끝시간
  const whole_stroke_start_time = strokeStream.strokes[0].dotArray[0].time;

  const whole_last_stroke = strokeStream.strokes[strokeStream.strokes.length - 1];
  const whole_last_dot =
    whole_last_stroke.dotArray[whole_last_stroke.dotArray.length - 1];
  const whole_stroke_end_time = whole_last_dot.time;

  return {
    start: whole_stroke_start_time,
    end: whole_stroke_end_time,
    duration: whole_stroke_end_time - whole_stroke_start_time,
    strokes: strokeStream.strokes,
  };
};

const equalStroke = (a, b) => {
  return (
    a &&
    b &&
    a.section === b.section &&
    a.owner === b.owner &&
    a.book === b.book &&
    a.pageNum === b.pageNum
  );
};




/**
 *
 * @param {Array.<Array.<NeoStroke>>} strokes_chunks
 * @param {number} time_ms - relative time
 * @param {number} start_time - absoltute time
 */
export const findStrokesChunkAtTime = (strokes_chunks, time_ms, start_time) => {
  const found = strokes_chunks.filter(chunk => {
    const strokes = chunk;
    const start = strokes[0].startTime;
    const end = strokes[strokes.length - 1].endTime;

    const time_abs = time_ms + start_time;

    // console.log( `${start} <= ${time_abs} <= ${end}`);
    if (start <= time_abs && time_abs <= end) return true;
    return false;
  });

  if (found[0]) {
    const strokes = found[0];
    return {
      section: strokes[0].section,
      owner: strokes[0].owner,
      book: strokes[0].book,
      pageNum: strokes[0].pageNum,
    };
  }
  else {
    return null;
  }
}


/**
 *
 * @param {Array.<NeoStroke>} strokes
 * @return {Array.<Array.<NeoStroke>>} StrokeChunk
 */
export const chunkPageStrokes = (strokes) => {

  // prepare for return value
  const chunked = [];

  let prev = null;
  // 주어진 배열을 탐색
  for (const stroke of strokes) {
    const curr = {
      section: stroke.section,
      owner: stroke.owner,
      book: stroke.book,
      pageNum: stroke.pageNum,
    };

    // console.log(curr);

    const last = chunked[chunked.length - 1];
    if (!last || !equalStroke(prev, curr)) {
      chunked.push([stroke]);
      prev = { ...curr };
    } else {
      last.push(stroke);
    }
  }

  return chunked;
};


export const getTimeStr = (miliseconds, format = null) => {
  let sec = Math.floor(miliseconds / 1000);
  // let mili = miliseconds - sec * 1000;
  // let deci = Math.round(mili / 100);

  let mm = Math.floor(sec / 60);
  const hh = Math.floor(mm / 60);

  mm = mm - hh * 60;
  sec = sec - hh * 3600 - mm * 60;

  let mm_str = "0" + mm;
  let hh_str = "0" + hh;
  let ss_str = "0" + sec;
  ss_str = ss_str.substr(-2);
  mm_str = mm_str.substr(-2);
  hh_str = hh_str.substr(-2);

  if (!format) return `${hh_str}:${mm_str}:${ss_str}`;

  let ret_val = format.replace("hh", `${hh_str}`);
  ret_val = ret_val.replace("mm", `${mm_str}`);
  ret_val = ret_val.replace("ss", `${ss_str}`);

  return ret_val;

};
