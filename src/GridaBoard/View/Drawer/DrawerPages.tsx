import React, { useEffect } from "react";
import { Box } from "@material-ui/core";
import { RootState } from "../../../store/rootReducer";
import { useSelector } from "react-redux";
import GridaDoc from "../../GridaDoc";
import ThumbnailItem from "./ThumbnailItem";

interface Props {
  noInfo?: boolean,
}

interface State {
  name: string;
}

const DrawerPages = (props: Props, state:State) => {
  const {numPages, activePageNo} = useSelector((state: RootState) =>({
    numPages: state.activePage.numDocPages,
    activePageNo: state.activePage.activePageNo
  }));

  if (numPages < 1) return null;

  const doc = GridaDoc.getInstance();
  const pages = doc.pages;

  return (
    <div >
      <Box style={{ margin: 10 }}>
        <h5>index : {activePageNo} (#{activePageNo + 1}/{numPages})</h5>
      </Box>
      {pages.map((page, i) =>
        // ""
        <ThumbnailItem key={i} noInfo={props.noInfo} pageNo={i} active={activePageNo == i} />
      )}
    </div>
  );
}

export default DrawerPages;

