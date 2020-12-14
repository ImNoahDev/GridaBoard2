import { Button } from '@material-ui/core';
import React, { useRef } from 'react';
import { onSuccess, _uuid, onOpenClicked, openFileBrowser } from "./FileBrowser";
import { Theme, Typography, withStyles } from '@material-ui/core';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';
import { IFileBrowserReturn } from '../NcodePrint/PrintDataTypes';

const PdfFileTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 240,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}))(Tooltip);

type Props = {
  onFileOpen: (event: IFileBrowserReturn) => void,

  children?: React.ReactNode;
  color?: any;
  disabled?: boolean;
  disableElevation?: boolean;
  disableFocusRipple?: boolean;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  href?: string;
  size?: 'small' | 'medium' | 'large';
  startIcon?: React.ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
}


const FileBrowserButton = (props: Props) => {
  const { onFileOpen } = props;
  const _fileInput = useRef();

  async function fileOpen() {

    const result = await openFileBrowser();
    console.log(result.result);

    if (result.result === "success") {
      const url = result.url;
      console.log(url);

      if (onFileOpen) {
        const retVal: IFileBrowserReturn = {
          result: "success",
          url,
          fileDesc: result.file,
        }
        onFileOpen(retVal);
      }
    } else {
      const retVal: IFileBrowserReturn = {
        result: "canceled",
        url: null,
        fileDesc: null,
      }
      onFileOpen(retVal);
    }
  }

  return (
    <React.Fragment>
      <button {...props} onClick={fileOpen} id="btn_file_open" type="button" className="btn btn-neo " title="Open a file" >
        <PdfFileTooltip placement="top" title={
          <React.Fragment>
            <Typography color="inherit">PDF File Open</Typography>
            <em>{"배경으로 쓸 PDF 파일을 엽니다. 스마트 플레이트로 조작하거나, 인쇄하여 덧필기할 수 있습니다."}</em>
            <br></br>
            <b>{"키보드 버튼 Ctrl + O으로 이동 가능합니다"}</b>
          </React.Fragment>
        }>
          <div className="c2">
            <img src='../../icons/icon_file_n.png' className="normal-image"></img>
            <img src='../../icons/icon_file_p.png' className="hover-image"></img>
          </div>
        </PdfFileTooltip>
        {props.children}
      </button>

      <input type="file" id={_uuid}
        onChange={onSuccess}
        onClick={onOpenClicked}
        ref={_fileInput}
        style={{ display: "none" }} name="pdf" accept="application/pdf"
      />
    </React.Fragment>
  );
}

export default FileBrowserButton;
