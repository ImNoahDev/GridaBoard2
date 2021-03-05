import React from "react";
import HeaderLayer from "./HeaderLayer";
import NavLayer from "./NavLayer";
import SideLayer from "./SideLayer";
import ContentsLayer from "./ContentsLayer";
import { ButtonProps } from "@material-ui/core";
import { IFileBrowserReturn } from "../../nl-lib/common/structures";

/**
 *
 */
interface Props extends ButtonProps {
  handlePdfOpen: (event: IFileBrowserReturn) => void,
}


const ViewLayer = (props: Props) => {
  return (
    <div style={{ zIndex: 0 }}>
      <HeaderLayer {...props}/>
      <NavLayer {...props} />
      <SideLayer {...props}/>
      <ContentsLayer {...props} />
    </div>
  );
}

export default ViewLayer;
