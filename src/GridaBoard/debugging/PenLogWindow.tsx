import { Typography } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { PenEventName } from "../../nl-lib/common/enums/PenEnums";
import { makeNPageIdStr } from "../../nl-lib/common/util";
import { PenManager } from "../../nl-lib/neosmartpen";


let move_log = [];
let last_time = "";
let last_page = "";
let last_xy = "";
export default function PenLogWindow(props) {

  const [log, setLog] = useState([]);

  useEffect(() => {
    const pm = PenManager.getInstance();
    pm.addEventListener(PenEventName.ON_PEN_PAGEINFO, onPageInfo);
    pm.addEventListener(PenEventName.ON_PEN_MOVE, onPenMove);
    pm.addEventListener(PenEventName.ON_PEN_UP, onPenUp);
  }, []);

  const onPageInfo = (e) => {
    console.log(e);
    move_log = [];
  }

  const onPenMove = (e) => {
    const { section, owner, book, page, mac } = e.stroke;
    const pg_str = makeNPageIdStr({ section, owner, book, page });
    const dot = e.dot;

    const fw_ver = e.pen.protocolHandler.deviceInfo.firmwareVer;
    const model_name = e.pen.protocolHandler.deviceInfo.modelName;
    
    const time = new Date();
    const time_str = `${time.toLocaleTimeString("en-US")} [${mac}] (${model_name} v${fw_ver}) `;
    const page_str = `${pg_str}`;
    const xy = `(${dot.x}, ${dot.y})`;
    // setLast(xy_str);
    last_time = time_str;

    last_page = page_str;
    last_xy = xy;

    move_log.unshift({ last_time: last_time + " __", last_page, last_xy });
  }

  const onPenUp = (e) => {
    log.unshift({ last_time: last_time + " UP", last_page, last_xy });
    setLog([...log]);

    last_time = "";
    last_page = "";
    last_xy = "";
  }

  if (props.open) {
    return (
      <div style={{ position: "absolute", right: 0, bottom: 0, width: 700, height: 500, zIndex: 999999, overflow: "auto", border: "1px solid black", backgroundColor: "#fff" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", zIndex: 999999, border: "1px solid black", backgroundColor: "#fff" }}>
          {log.map((v, i) => {
            return (
              <React.Fragment key={i}>
                <div style={{ alignContent: "flex-start" }}>
                  {v.last_time} {":"}
                  {v.last_page} {"/"}
                  <b>{v.last_xy}</b>
                </div>
                {i === 0 ?
                  move_log.map((mv, mi) => {
                    return (
                      <React.Fragment key={mi}>
                        <div style={{ alignContent: "flex-start" }}>
                          {mv.last_time} {":"}
                          {mv.last_page} {"/"}
                          <b>{mv.last_xy}</b>
                        </div>
                      </React.Fragment>
                    )
                  })
                  : ""
                }
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }
  else {
    return (
      <></>
    )
  }
}

