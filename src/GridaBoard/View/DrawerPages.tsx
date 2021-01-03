import React from "react";
import { Box, Paper, Typography } from "@material-ui/core";

import { InkStorage, MixedPageView, PLAYSTATE } from "../../neosmartpen";
import { ZoomFitEnum } from "../../neosmartpen/renderer/pageviewer/RenderWorkerBase";
import GridaDoc from "../GridaDoc";
import { RootState } from "../../store/rootReducer";
import { connect } from "react-redux";
import { updateDrawerWidth } from "../../store/reducers/ui";
import { makeNPageIdStr } from "../../NcodePrintLib";
import ThumbnailItem from "./ThumbnailItem";

interface Props {
  numPages?: number,
  drawerWidth?: number,

  renderCount?: number,

  onSelectPage?: (pageNo: number) => void,

  activePageNo?: number,
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

    const inkStorage = InkStorage.getInstance();
    return (
      <div >
        <Box style={{ margin: 10 }}>
          <h5>{numPages}</h5>
        </Box>
        {pages.map((page, i) =>
          // ""
          <ThumbnailItem key={i} pageNo={i} active={this.props.activePageNo == i} />
        )}
      </div>
    );
  }

}

const mapStateToProps = (state: RootState) => ({
  numPages: state.activePage.numDocPages,
  drawerWidth: state.ui.drawer.width,
  renderCount: state.activePage.renderCount,
  activePageNo: state.activePage.activePageNo,

});

// const mapDispatchToProps = (dispatch) => {
//   // onSelectPage: pageNo => dispatch(updateSelectedPage({ pageNo }))
// }
export default connect(mapStateToProps)(DrawerPages);

