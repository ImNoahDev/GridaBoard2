import React from "react";
import ButtonLayer_forTest from "./ButtonLayer_forTest";
import ButtonLayerBottom from "./ButtonLayerBottom";
import ButtonLayerSide from "./ButtonLayerSide";

/**
 * 
 */
const ButtonLayer = () => {
  return (
    <div style={{ zIndex: 0 }}>
      <ButtonLayer_forTest />
      <ButtonLayerBottom />
      <ButtonLayerSide />
    </div>
  );
}

export default ButtonLayer;
