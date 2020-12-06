import { Button } from '@material-ui/core';
import React, { useRef } from 'react';
import { onSuccess, _uuid, onOpenClicked, openFileBrowser } from "./FileBrowser";

export type IFileBrowserReturn = {
  result: "success" | "canceled" | "failed",
  url: string,
  file: any,

}
type Props = {
  callback: Function,

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
  const { callback } = props;
  const _fileInput = useRef();

  async function fileOpen() {

    const result = await openFileBrowser();
    console.log(result.result);

    if (result.result === "success") {
      const url = result.url;
      console.log(url);

      if (callback) {
        callback({ result: "success", url, file: result.file });
      }
    } else {
      alert("파일 열기를 취소 했습니다");
      callback({ result: "canceled", url: null });
    }
  }

  return (
    <div>
      <Button {...props} onClick={fileOpen}>
        {props.children}
      </Button>

      <input type="file" id={_uuid}
        onChange={onSuccess}
        onClick={onOpenClicked}
        ref={_fileInput}
        style={{ display: "none" }} name="pdf" accept="application/pdf"
      />
    </div>
  );
}

export default FileBrowserButton;