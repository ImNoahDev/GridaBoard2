import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

// View
import KerisBottom from "./replaybar/KerisBottom";
import ReplayContaineriner, { PLAYSTATE } from "./pageviewer/StorageRenderer";
// import KerisRight from "./KerisRight";

import { findStrokesChunkAtTime, getTimeStr } from "./StrokeInfo";

// import Paper from "@material-ui/core/Paper"

// Page Data
// import defaultData from "./3_27_1089_stroke.json";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
    width: "100%",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    alignItems: "stretch",
    // margin: "100px",
    // marginleft: "100px",
  },

  container: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    flex: "1 1",
    order: 1,
  },

  navi: {
    flex: "0 0 140px",
    bottom: 0,
    order: 1,
  },

  main: {
    order: 3,
    overflow: "hidden",
  },

  spacer: {
    flex: "0 0 2px",
    order: 2,
    backgroundColor: "rgba(200,200,200,1)",
  },

  right: {
    flex: "0 0 200px",
    order: 3,
    backgroundColor: "rgba(200,200,200,1)",
  },
}));

const getPlayTime = (strokeStream) => {
  // 전체 필기, 시작시간, 끝시간
  const whole_start_time = strokeStream.strokes[0].dotArray[0].time;

  const last_stroke = strokeStream.strokes[strokeStream.strokes.length - 1];
  const last_dot = last_stroke.dotArray[last_stroke.dotArray.length - 1];
  const whole_end_time = last_dot.time;

  return {
    start: whole_start_time,
    end: whole_end_time,
    duration: whole_end_time - whole_start_time + 1,
    strokes: strokeStream.strokes,
  };
};

export default function KerisMain(props) {
  const classes = useStyles();

  const [caption, setCaption] = useState(getTimeStr(0));
  const [scale, setscale] = useState(100);
  const [scaleType, setscaleType] = useState(1); // 1: ScaleTo: Height, 2 ScaleTo: Width
  const [isPlay, setisPlay] = useState(false);
  const [stopTrigger, setStopTrigger] = useState(false);
  const [rewindTrigger, setRewindTrigger] = useState(false);

  const [pages] = useState(props.defaultData.pages);
  const [strokeStream] = useState(props.strokeStream);
  const [strokeChunks] = useState(props.strokeChunks);

  // const play_time = getPlayTime(strokeStream);

  // const [pages, setpages] = useState(props.defaultData.pages);
  const [replaySpeed, setreplaySpeed] = useState(1);
  const [playTime, setplayTime] = useState(0);

  const [pageid, setpageid] = useState(1);
  const [autoStop, setAutoStop] = useState(false);

  let cap = "";

  // Share Event
  const linkshare = () => {
    this.shareurl();
  };

  const zoom = (zoomin) => {
    const scaleParam =
      scaleType === 1
        ? [50, 75, 80, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400]
        : [25, 50, 75, 80, 90, 100, 110, 125, 150, 175, 200];
    let scaleTemp = null;
    if (zoomin) {
      scaleTemp = scaleParam.filter((v) => v > scale).shift();
    } else {
      scaleTemp = scaleParam.filter((v) => v < scale).pop();
    }
    console.log("zoom event", zoomin, scaleTemp);
    if (scaleTemp) {
      setscale(scaleTemp);
    }
  };

  // Zoom to With or height
  const zoomAtWidth = (width) => {
    if (width) {
      setscale(100);
      setscaleType(2);
    } else {
      setscale(100);
      setscaleType(1);
    }
  };

  const isPlaying = () => {
    return isPlay;
  };

  const playHandler = () => {
    // console.log("Play status", isPlay)
    if (isPlay) {
      setisPlay(false);
    } else {
      setisPlay(true);
    }

    setRewindTrigger(false);
    setStopTrigger(false);
  };

  const stopHandler = (rewind = false) => {
    // console.log("Play status", isPlay)
    if (rewind) {
      setisPlay(false);
      setStopTrigger(false);
      setRewindTrigger(true);
    }
    else {
      setisPlay(false);
      setStopTrigger(true);
      setRewindTrigger(false);
    }
  };

  const playStateHandler = (state) => {
    switch (state) {
      case PLAYSTATE.play:
        setisPlay(true);
        setStopTrigger(false);
        setRewindTrigger(false);
        break;

      case PLAYSTATE.stop:
        setisPlay(false);
        setStopTrigger(true);
        setRewindTrigger(false);
        break;

      case PLAYSTATE.pause:
        setisPlay(false);
        setStopTrigger(false);
        setRewindTrigger(false);
        break;

      case PLAYSTATE.rewind:
        setisPlay(false);
        setStopTrigger(false);
        setRewindTrigger(true);
        break;

      case PLAYSTATE.setAutoStop:
        setAutoStop(true);
        break;

      case PLAYSTATE.unsetAutoStop:
        setAutoStop(false);
        break;

      default:
        break;
    }
  };

  const playTimeHandler = (time_ms) => {
    const timeStr = getTimeStr(time_ms);
    // const old_caption = ({caption});
    if (timeStr !== cap) {
      setCaption(timeStr);
      cap = timeStr;
      console.log(timeStr);
    }

    // 페이지 전환이 있었는지 확인한다.
    const start_time = props.strokeStream.startTime;
    const code_info = findStrokesChunkAtTime(props.strokeChunks, time_ms, start_time);
    if (code_info) {
      if (code_info.pageNum !== pageid) {
        console.log(`Change to page ${code_info.pageNum}`);
        setpageid(code_info.pageNum);
      }
    }

    // 시간
    setplayTime(time_ms);
  };

  const replaySpeedHandler = () => {
    if (replaySpeed > 31) {
      setreplaySpeed(1);
    } else {
      setreplaySpeed(replaySpeed * 2);
    }
  };

  const pageClickHandle = (pageid) => {
    console.log(">> pageClickHandle !!!!!!!!!!!!!!!!");
    setpageid(pageid);
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <div className={classes.navi}>
          <KerisBottom
            pageid={pageid}
            pages={pages}
            tab_value={props.tab_value}
            strokeStream={strokeStream}
            strokeChunks={strokeChunks}
            playTime={playTime}
            zoom={zoom}
            scale={scale}
            zoomAtWidth={zoomAtWidth}
            playHandler={playHandler}
            stopHandler={stopHandler}
            playStateHandler={playStateHandler}
            isPlaying={isPlaying}
            linkshare={linkshare}
            replaySpeed={replaySpeed}
            replaySpeedHandler={replaySpeedHandler}
            playTimeHandler={playTimeHandler}
            caption={caption}
            autoStop={autoStop}
          />
        </div>
        <div className={classes.spacer}></div>
        <div className={classes.main}>
          <ReplayContaineriner
            tab_value={props.tab_value}
            playTimeHandler={playTimeHandler}
            playStateHandler={playStateHandler}
            scaleType={scaleType}
            scale={scale}
            pageid={pageid}
            pages={pages}
            strokeStream={strokeStream}
            isPlay={isPlay}
            replaySpeed={replaySpeed}
            playTime={playTime}
            pageClickHandle={pageClickHandle}
            caption={caption}
            stopTrigger={stopTrigger}
            rewindTrigger={rewindTrigger}
            autoStop={autoStop}
          />
        </div>
      </div>
    </div>
  );
}

