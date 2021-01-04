import React from "react";
import GridaDoc from "../GridaDoc";
import { useSelector } from "react-redux";
import { Box, Paper, Typography } from "@material-ui/core";

import { InkStorage, MixedPageView, PLAYSTATE } from "../../neosmartpen";
import { ZoomFitEnum } from "../../neosmartpen/renderer/pageviewer/RenderWorkerBase";
import { RootState } from "../../store/rootReducer";
import { connect } from "react-redux";
import { updateDrawerWidth } from "../../store/reducers/ui";
import { makeNPageIdStr } from "../../NcodePrintLib";


interface Props {
  pageNo: number,
  key: string | number,

  active: boolean,
}

const ThumbnailItem = (props: Props) => {
  const pn = props.pageNo;

  const doc = GridaDoc.getInstance();

  const drawerWidth = useSelector((state: RootState) => state.ui.drawer.width);
  const activePageNo = useSelector((state: RootState) => state.activePage.activePageNo);
  let pdfUrl = undefined;
  let pdfFilename = undefined;
  let pdfFingerprint = undefined;
  let pdfPageNo = 1;
  let pdf = undefined;

  const page = doc.getPageAt(pn)
  if (activePageNo >= 0) {
    pdfUrl = doc.getPdfUrlAt(pn);
    pdfFilename = doc.getPdfFilenameAt(pn);
    pdfFingerprint = doc.getPdfFingerprintAt(pn);
    pdfPageNo = doc.getPdfPageNoAt(pn);
    pdf = page.pdf;
  }

  const numPages = doc.numPages;


  let bgColor = `rgb(255, 255,255)`;
  // if (props.active)
  if (activePageNo === pn)
    bgColor = `rgb(0, 255, 255)`;

  const pageOverview = page.pageOverview;
  const isLandscape = pageOverview.landscape;
  const sizePu = pageOverview.sizePu;
  const wh_ratio = sizePu.width / sizePu.height;
  const pageInfo = page.pageInfos[0];

  const height = drawerWidth / wh_ratio * 0.9;

  console.log(`thumbnail - ${pn}: pageNo: ${pdfPageNo} pdf: ${pdf} pdfUrl: ${pdfUrl} fingerprint: ${pdfFingerprint} `)
  return (
    <Paper key={props.key} elevation={3} style={{ height: height, margin: 10, overflow: "hidden", position: "relative" }} >
      <div id={`thumbnail - ${pn} `} style={{ position: "absolute", margin: 0, padding: 0, right: 0, left: 0, top: 0, height: "100%", backgroundColor: bgColor }}>
        <MixedPageView
          pdf={pdf}
          pdfUrl={pdfUrl} filename={pdfFilename}
          fingerprint={pdfFingerprint}
          pdfPageNo={pdfPageNo}
          playState={PLAYSTATE.live} pens={[]}
          rotation={0}
          pageInfo={pageInfo}
          basePageInfo={pageInfo}
          parentName={`thumbnail - ${pn} `}
          viewFit={ZoomFitEnum.FULL}
          autoPageChange={false}
          fromStorage={true}
          fitMargin={2}
          // fixed
          noInfo

          onNcodePageChanged={undefined}
        />
      </div>

      <div id={`thumbnail - pageInfo - ${pn} `} style={{ position: "absolute", margin: 0, padding: 0, right: 0, left: 0, top: 0, height: "100%", zIndex: 999 }}>
        <Typography style={{ color: "#f00" }}> {makeNPageIdStr(page.pageInfos[0])}</Typography>
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