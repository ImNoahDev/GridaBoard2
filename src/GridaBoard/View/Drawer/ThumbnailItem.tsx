import React from "react";
import { useSelector } from "react-redux";
import { Paper, Typography } from "@material-ui/core";

import GridaDoc from "../../GridaDoc";
import { RootState } from "../../../store/rootReducer";
import { setActivePageNo } from '../../../store/reducers/activePageReducer';

import { MixedPageView } from "../../../nl-lib/renderer";
import { makeNPageIdStr } from "../../../nl-lib/common/util";
import { PLAYSTATE, ZoomFitEnum } from "../../../nl-lib/common/enums";
import { nullNcode } from "../../../nl-lib/common/constants";

interface Props {
  pageNo: number,
  key: string | number,

  active: boolean,

  noInfo?: boolean,
}

const ThumbnailItem = (props: Props) => {
  const pn = props.pageNo;

  const doc = GridaDoc.getInstance();

  const drawerWidth = useSelector((state: RootState) => state.ui.drawer.width);
  const activePageNo = useSelector((state: RootState) => state.activePage.activePageNo);

  const renderCountNo = useSelector((state: RootState) => state.activePage.renderCount);

  const pdfUrl = undefined;
  const pdfFilename = undefined;
  const pdfFingerprint = undefined;
  let pdfPageNo = 1;
  let pdf = undefined;
  let rotation = 0;
  let basePageInfo = nullNcode();
  const page = doc.getPageAt(pn)

  if (activePageNo >= 0) {
    pdfPageNo = doc.getPdfPageNoAt(pn);
    pdf = page.pdf;
    if (page._pdfPage !== undefined) {
      rotation = page._pdfPage.viewport.rotation;
    } else {
      rotation = page.pageOverview.rotation;
    }
    basePageInfo = page.basePageInfo;
  }

  const handleMouseDown = e => {
    const idToken = e.target.id.split('-');
    const pageNo = Number(idToken[2]);
    setActivePageNo(pageNo);
  };

  let bgColor = `rgb(255, 255,255)`;
  if (activePageNo === pn)
    bgColor = `rgb(0, 255, 255)`;

  const pageOverview = page.pageOverview;
  const sizePu = pageOverview.sizePu;
  const pageInfo = page.pageInfos[0];

  const wh_ratio = sizePu.width / sizePu.height;

  const height = drawerWidth / wh_ratio * 0.9;
  const playState = PLAYSTATE.live;

  // console.log(`thumbnail - ${pn}: pageNo: ${pdfPageNo} pdf: ${pdf} pdfUrl: ${pdfUrl} fingerprint: ${pdfFingerprint} `)
  return (
    <Paper id={`thumbnail-item-${pn}`} key={props.key} onMouseDown={e => handleMouseDown(e)} elevation={3} style={{ height: height, margin: 10, overflow: "hidden", position: "relative" }} >
      <div id={`thumbnail-div-${pn}`} style={{ position: "absolute", margin: 0, padding: 0, right: 0, left: 0, top: 0, height: "100%", backgroundColor: bgColor }}>
        <MixedPageView
          pdf={pdf}
          pdfUrl={pdfUrl} filename={pdfFilename}
          pdfPageNo={pdfPageNo}
          playState={playState} pens={[]}
          rotation={rotation}
          isMainView={false}
          
          pageInfo={pageInfo}
          basePageInfo={basePageInfo}

          parentName={`thumbnail - ${pn} `}
          viewFit={ZoomFitEnum.FULL}
          autoPageChange={false}
          fromStorage={true}
          fitMargin={5}
          // fixed
          noInfo
          
          activePageNo={activePageNo}

          renderCountNo={renderCountNo}
        />
      </div>

      <div id={`thumbnail-pageInfo-${pn}`} style={{ position: "absolute", margin: 0, padding: 0, right: 0, left: 0, top: 0, height: "100%", zIndex: 999 }}>
        {!props.noInfo
          ? <Typography style={{ color: "#f00" }}> {makeNPageIdStr(page.pageInfos[0])}</Typography>
          : ""
        }
      </div>

      {/*
            <Box id={`box - id - ${ pn } `}
              style={{ position: "absolute", right: 0, left: 0, top: 0, height: "100%", backgroundColor: bgColor }}
              fontSize={18}>
              <Typography variant="subtitle1" color="primary">{pn}</Typography>
            </Box> */}
    </Paper>
  )
}

export default ThumbnailItem;