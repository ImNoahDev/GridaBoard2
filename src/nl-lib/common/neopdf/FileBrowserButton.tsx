import React from 'react';
import { ButtonProps } from '@material-ui/core';

import { openFileBrowser } from "./FileBrowser";
import { IFileBrowserReturn } from '../structures';
import { NeoToolTip } from '../ui';


interface Props extends ButtonProps {
  handlePdfOpen: (event: IFileBrowserReturn) => void,
}


const FileBrowserButton = (props: Props) => {
  const { handlePdfOpen, ...rest } = props;
  async function fileOpenHandler() {
    const selectedFile = await openFileBrowser();
    console.log(selectedFile.result);

    if (selectedFile.result === "success") {
      const { url, file } = selectedFile;
      if (handlePdfOpen) {
        handlePdfOpen({ result: "success", url, file });
      }
    } else {
      if (handlePdfOpen) {
        handlePdfOpen({ result: "canceled", url: null, file: null, });
      }
    }
  }

  return (
    <React.Fragment>
      <button {...rest} onClick={fileOpenHandler} id="btn_file_open" type="button" className="btn btn-neo " title="Open a file" >
        <NeoToolTip open={true} placement="top" tip={{
          head: "PDF File Open",
          msg: "배경으로 쓸 PDF 파일을 엽니다. 스마트 플레이트로 조작하거나, 인쇄하여 덧필기할 수 있습니다.",
          tail: "키보드 버튼 Ctrl + O으로 이동 가능합니다"
        }} title={undefined}>
          <div className="c2">
            <img src='../../icons/icon_file_n.png' className="normal-image"></img>
            <img src='../../icons/icon_file_p.png' className="hover-image"></img>
          </div>
        </NeoToolTip>
        {props.children}
      </button>


    </React.Fragment>
  );
}

export default FileBrowserButton;
