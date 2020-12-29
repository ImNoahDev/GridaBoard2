import { Box, Paper, Typography } from "@material-ui/core";
import React, { CSSProperties, useState } from "react";
import { MixedPageView, PLAYSTATE } from "../../neosmartpen";
import { ZoomFitEnum } from "../../neosmartpen/renderer/pageviewer/RenderWorkerBase";
import GridaDoc from "../GridaDoc";
import { RootState } from "../../store/rootReducer";
import { connect } from "react-redux";
import { updateDrawerWidth, updateSelectedPage } from "../../store/reducers/ui";

interface Props {
  numPages?: number,
  drawerWidth?: number,

  onSelectPage?: (pageNo: number) => void,
}

interface State {
  name: string;
}

class DrawerPages extends React.Component<Props, State>  {
  state: State = {
    name: "drawer_page"
  }

  _orientation = "landscape";


  render() {
    const { numPages, drawerWidth } = this.props;
    // const numPages = useSelector((state: RootState) => state.pdfInfo.numDocPages);
    // const drawerWidth = useSelector((state: RootState) => state.ui.drawer.width);

    if (numPages < 1) return null;

    const doc = GridaDoc.getInstance();
    const pages = doc.getPages();
    const isLandscape = pages[0].pdf.pagesOverview[0].landscape;
    const sizePu = pages[0].pdf.pagesOverview[0].sizePu;
    const wh_ratio = sizePu.width / sizePu.height;

    const setDrawerWidth = (width: number) => updateDrawerWidth({ width });

    let height;
    if (isLandscape) {
      console.log(`drawPageLayout: LANDSCAPE orientation=${this._orientation}, drawerWidth=${drawerWidth}`);
      if (this._orientation === "portrait") {
        console.log(`drawPageLayout: LANDSCAPE setDrawerWidth(drawerWidth * wh_ratio);`);
        this._orientation = "landscape";
        setDrawerWidth(drawerWidth * wh_ratio);
      }
      height = drawerWidth * wh_ratio;
    }
    else {
      console.log(`drawPageLayout: orientation=${this._orientation}, drawerWidth=${drawerWidth}`);
      if (this._orientation === "landscape") {
        this._orientation = "portrait";
        console.log(`drawPageLayout: setDrawerWidth(drawerWidth * wh_ratio);`);
        setDrawerWidth(drawerWidth * wh_ratio);
      }
      height = drawerWidth / wh_ratio;
    }

    return (
      <div
        style={{ height: height, marginLeft: 10, marginRight: 10, position: "relative" }}
      >
        <Box style={{ margin: 10 }}>
          <h5>{numPages}</h5>
        </Box>
        {pages.map((page, i) => {
          const pdfUrl = page.pdf.url;
          const pdfFilename = page.pdf.filename;
          const pageNo = i + 1;
          const scale = 1;
          let bgColor = `rgb(${(255 / pages.length) * i}, 255, 255)`;
          bgColor = `rgb(255, 255, 255)`;


          return (
            <Paper key={i} elevation={3}
              style={{ height: height, marginBottom: 10, overflow: "hidden", position: "relative" }}
            >
              <div id={`thumbnail-${i}`} style={{ position: "absolute", margin: 0, padding: 0, right: 0, left: 0, top: 0, height: "100%", backgroundColor: bgColor }}>
                <MixedPageView
                  pdfUrl={pdfUrl} filename={pdfFilename} pageNo={pageNo} scale={1}
                  playState={PLAYSTATE.live} pens={[]}
                  rotation={0}
                  onFileLoadNeeded={undefined}
                  parentName={`thumbnail-${i}`}
                  viewFit={ZoomFitEnum.FULL}
                  fitMargin={2}
                  // fixed
                  noInfo
                />
              </div>
              {/* 
            <Box id={`box-id-${i}`}
              style={{ position: "absolute", right: 0, left: 0, top: 0, height: "100%", backgroundColor: bgColor }}
              fontSize={18}>
              <Typography variant="subtitle1" color="primary">{i}</Typography>
            </Box> */}
            </Paper>
          )
        })
        }



      </div>
    );
  }

}

const mapStateToProps = (state: RootState) => ({
  numPages: state.pdfInfo.numDocPages,
  drawerWidth: state.ui.drawer.width,
});

const mapDispatchToProps = (dispatch) => {
  // onSelectPage: pageNo => dispatch(updateSelectedPage({ pageNo }))
}
export default connect(mapStateToProps, mapDispatchToProps)(DrawerPages);

