import React from 'react';
import { ButtonProps } from '@material-ui/core';

import { openFileBrowser } from "../../nl-lib/common/neopdf/FileBrowser";
import { IFileBrowserReturn } from '../../nl-lib/common/structures';


interface Props extends ButtonProps {
  handleGridaOpen: (event: IFileBrowserReturn) => void,
}


const LoadGrida = (props: Props) => {
  const { handleGridaOpen, ...test } = props;
  
  async function fileOpenHandler() {
    const selectedFile = await openFileBrowser();
    console.log(selectedFile.result);

    if (selectedFile.result === "success") {
      const { url, file } = selectedFile;
      if (handleGridaOpen) {
        handleGridaOpen({ result: "success", url, file });
      }
    } else {
      if (handleGridaOpen) {
        handleGridaOpen({ result: "canceled", url: null, file: null, });
      }
    }
  }

  return (
      <button  {...test} onClick={fileOpenHandler}>
        그리다 로드
        {/* {props.children} */}
      </button>
  );
}

export default LoadGrida;
