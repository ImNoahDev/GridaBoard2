import { Box, Paper, Typography  } from "@material-ui/core";
import React from "react";
import { InkStorage, MixedPageView, PLAYSTATE } from "../../neosmartpen";
import { ZoomFitEnum } from "../../neosmartpen/renderer/pageviewer/RenderWorkerBase";
import GridaDoc from "../GridaDoc";
import { RootState } from "../../store/rootReducer";
import { connect } from "react-redux";
import { updateDrawerWidth } from "../../store/reducers/ui";
import { makeNPageIdStr } from "../../NcodePrintLib";

interface Props {
  numPages?: number,
  drawerWidth?: number,

  renderCount?: number,

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
    const pages = doc.pages;

    const setDrawerWidth = (width: number) => updateDrawerWidth({ width });
    const inkStorage = InkStorage.getInstance();
    return (
      <div

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

          console.log(`DRAWER page #${i + 1}`)
          const pageOverview = page.pageOverview;
          const isLandscape = pageOverview.landscape;
          const sizePu = pageOverview.sizePu;
          const wh_ratio = sizePu.width / sizePu.height;
          const pageInfo = page.pageInfos[0];

          let height;
          if (isLandscape) {
            console.log(`drawPageLayout: LANDSCAPE orientation=${this._orientation}, drawerWidth=${drawerWidth}`);
            if (this._orientation === "portrait") {
              console.log(`drawPageLayout: LANDSCAPE setDrawerWidth(drawerWidth * wh_ratio);`);
              this._orientation = "landscape";
              // setDrawerWidth(drawerWidth * wh_ratio);
            }
            height = drawerWidth / wh_ratio * 0.9;
          }
          else {
            console.log(`drawPageLayout: orientation=${this._orientation}, drawerWidth=${drawerWidth}`);
            if (this._orientation === "landscape") {
              this._orientation = "portrait";
              console.log(`drawPageLayout: setDrawerWidth(drawerWidth * wh_ratio);`);
              // setDrawerWidth(drawerWidth * wh_ratio);
            }
            height = drawerWidth / wh_ratio * 0.9;
          }


          return (
            <Paper key={i} elevation={3}
              style={{ height: height, margin: 10, overflow: "hidden", position: "relative" }}
            >
              <div id={`thumbnail-${i}`} style={{ position: "absolute", margin: 0, padding: 0, right: 0, left: 0, top: 0, height: "100%", backgroundColor: bgColor }}>
                <MixedPageView
                  pdfUrl={pdfUrl} filename={pdfFilename} pageNo={pageNo}
                  playState={PLAYSTATE.live} pens={[]}
                  rotation={0}
                  pageInfo={pageInfo}
                  parentName={`thumbnail-${i}`}
                  viewFit={ZoomFitEnum.FULL}
                  autoPageChange={false}
                  fromStorage={true}
                  fitMargin={2}
                  // fixed
                  noInfo

                  onNcodePageChanged={undefined}
                  handleFileLoadNeeded={undefined}
                />
              </div>

              <div id={`thumbnail-pageInfo-${i}`} style={{ position: "absolute", margin: 0, padding: 0, right: 0, left: 0, top: 0, height: "100%", zIndex: 999 }}>
                <Typography style={{ color: "#f00" }}> {makeNPageIdStr(page.pageInfos[0])}</Typography>
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
  numPages: state.activePage.numDocPages,
  drawerWidth: state.ui.drawer.width,
  renderCount: state.activePage.renderCount,

});

// const mapDispatchToProps = (dispatch) => {
//   // onSelectPage: pageNo => dispatch(updateSelectedPage({ pageNo }))
// }
export default connect(mapStateToProps)(DrawerPages);

