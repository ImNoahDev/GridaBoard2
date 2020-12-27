import { Paper } from "@material-ui/core";
import React, { CSSProperties } from "react";
import GridaDoc from "../GridaDoc";
// import PropTypes from "prop-types";

// PdfJs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PdfJs.version}/pdf.worker.js`;
// const CMAP_URL = "./cmaps/";
// const CMAP_PACKED = true;

interface Props {
  title?: "";
}

const DrawerPages = (props: Props) => {
  const doc = GridaDoc.getInstance();
  const numPages = doc.numPages;
  const arr = Array.from({ length: numPages }, (_, i) => i + 0);
  return (
    <React.Fragment>
      <h1>{numPages}</h1> 
      { arr.map(index => {
        <Paper key={index}>

        </Paper>

      })}

    </React.Fragment>
  );
}
export default DrawerPages;