import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import ManualCalibration from "../../components/navbar/ManualCalibration";
import PrintButton from "../../components/navbar/PrintButton";
import GridaToolTip from "../../styles/GridaToolTip";
import ColorButtons from "../../components/navbar/ColorButtons";
import { RootState } from "../../store/rootReducer";
import GridaDoc from "../GridaDoc";
import { FileBrowserButton } from "../../nl-lib/common/neopdf";
import { IFileBrowserReturn } from "../../nl-lib/common/structures";
import { g_defaultPrintOption } from "../../nl-lib/ncodepod";

import { Button, ButtonGroup } from "@material-ui/core";
import SavePdfDialog from "../Save/SavePdfDialog";
import {saveGrida} from "../Save/SaveGrida";
import LoadGrida from "../Load/LoadGrida";
import { ButtonProps } from "react-bootstrap";
interface Props {

  handleGridaOpen: (event: IFileBrowserReturn) => void,
}
/**
 *
 */
const ButtonLayerBottom = (props: Props) => {

  const { handleGridaOpen, ...rest } = props;

  const [pdfUrl, setPdfUrl] = useState(undefined as string);
  const [pdfFilename, setPdfFilename] = useState(undefined as string);

  const activePageNo = useSelector((state: RootState) => state.activePage.activePageNo);
  useEffect(() => {
    if (activePageNo >= 0) {
      const doc = GridaDoc.getInstance();
      const page = doc.getPageAt(activePageNo)
      setPdfUrl(doc.getPdfUrlAt(activePageNo));
      setPdfFilename(doc.getPdfFilenameAt(activePageNo));
    }
  }, [activePageNo]);

  return (
    <LoadGrida handleGridaOpen={handleGridaOpen}/>
  );
}

export default ButtonLayerBottom;