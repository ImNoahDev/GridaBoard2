import React from "react";
import ButtonLayer_forTest from "./ButtonLayer_forTest";
import ButtonLayerBottom from "./ButtonLayerBottom";
import ButtonLayerSide from "./ButtonLayerSide";
import { ButtonProps } from "@material-ui/core";
import { IFileBrowserReturn } from "../NcodePrintLib/NcodePrint/PrintDataTypes";

/**
 * 
 */
interface Props extends ButtonProps {
  handlePdfOpen: (event: IFileBrowserReturn) => void,
}


const ButtonLayer = (props: Props) => {
  return (
    <div style={{ zIndex: 0 }}>
      <ButtonLayer_forTest {...props}/>
      <ButtonLayerBottom {...props} />
      <ButtonLayerSide {...props}/>
    </div>
  );
}

export default ButtonLayer;
