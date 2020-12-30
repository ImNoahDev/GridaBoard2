import { Button, ButtonProps } from '@material-ui/core';
import React, { useRef } from 'react';
import { onFileInputChanged, onFileInputClicked, g_hiddenFileInputBtnId, openFileBrowser } from "./FileBrowser";
import { Theme, Typography, withStyles } from '@material-ui/core';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { IFileBrowserReturn } from '../NcodePrint/PrintDataTypes';
import GridaToolTip from '../../styles/GridaToolTip';
import GridaDoc from '../../GridaBoard/GridaDoc';


interface Props extends ButtonProps {
  onFileOpen: (event: IFileBrowserReturn) => void,
}


const FileBrowserButton = (props: Props) => {
  const { onFileOpen, ...rest } = props;
  async function fileOpenHandler() {
    const result = await openFileBrowser();
    console.log(result.result);

    if (result.result === "success") {
      const { url, file } = result;
      // const doc = GridaDoc.getInstance();
      // doc.openPdfFile({ url, file });

      console.log(url);

      if (onFileOpen) {
        const retVal: IFileBrowserReturn = {
          result: "success",
          url,
          file: result.file,
        }
        onFileOpen(retVal);
      }
    } else {
      const retVal: IFileBrowserReturn = {
        result: "canceled",
        url: null,
        file: null,
      }
      onFileOpen(retVal);
    }
  }

  return (
    <React.Fragment>
      <button {...rest} onClick={fileOpenHandler} id="btn_file_open" type="button" className="btn btn-neo " title="Open a file" >
        <GridaToolTip open={true} placement="top" tip={{
          head: "PDF File Open",
          msg: "배경으로 쓸 PDF 파일을 엽니다. 스마트 플레이트로 조작하거나, 인쇄하여 덧필기할 수 있습니다.",
          tail: "키보드 버튼 Ctrl + O으로 이동 가능합니다"
        }} title={undefined}>
          <div className="c2">
            <img src='../../icons/icon_file_n.png' className="normal-image"></img>
            <img src='../../icons/icon_file_p.png' className="hover-image"></img>
          </div>
        </GridaToolTip>
        {props.children}
      </button>


    </React.Fragment>
  );
}

export default FileBrowserButton;
