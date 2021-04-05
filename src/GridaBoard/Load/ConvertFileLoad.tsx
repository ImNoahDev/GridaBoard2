import React from 'react';
import { Button } from '@material-ui/core';
import { render } from "react-dom";
import { openFileBrowser } from "../../nl-lib/common/neopdf/FileBrowser";
import getText from "../language/language";


const ConvertFileLoad = () => {
  async function fileOpenHandler() {
    const selectedFile = await openFileBrowser();

    console.log(selectedFile);
  }

  return (
    <Button className="load_drop_down" 
    onClick={fileOpenHandler}
    style={{
      width: "200px", height: "40px", padding: "4px 12px", justifyContent: "flex-start"
    }}>
      {/* getText("load_from_grida") */}컨버트 버튼
    </Button>);

}

export default ConvertFileLoad;