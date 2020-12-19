
import React, { useEffect, useState } from "react";
import { ButtonProps, } from "@material-ui/core";
import { IPrintingReport, IPrintOption } from "./PrintDataTypes";
import ProgressDialog from "./ProgressDialog";
import PrintNcodedPdfWorker from "./PrintNcodedPdfWorker";

interface Props extends ButtonProps {
  /** 인쇄될 문서의 url, printOption.url로 들어간다. */
  url: string,
  filename: string,

  /** 인쇄 준비 상태를 업데이트하는 콜백 함수 */
  reportProgress?: (arg: IPrintingReport) => void,

  /** 기본값의 IPrintOption을 받아서, dialog를 처리하고 다시 돌려주는 콜백 함수 */
  printOptionCallback?: (arg: IPrintOption) => IPrintOption,
}

/**
 * Class
 */
export default function PrintNcodedPdfButton(props: Props) {

  const [progressPercent, setProgressPercent] = useState(0);
  const [status, setStatus] = useState("N/A");
  const [dialogOn, setDialogOn] = useState(false);

  const startPrint = async () => {
    if (props.url && props.filename) {
      // setStart(true);
      const worker = new PrintNcodedPdfWorker(props, onProgress);
      setDialogOn(true);
      setProgressPercent(0);
      await worker.startPrint(props.url, props.filename);
      setDialogOn(false);

    }
  }

  const onProgress = (arg: IPrintingReport) => {
    setProgressPercent(arg.totalCompletion);
    setStatus(arg.status);
  }

  useEffect(() => {
    console.log(`status = ${status}, progress=${progressPercent}`);
  }, [status, progressPercent]);




  const onAfterPrint = () => {
    console.log("END OF PRINT");
  }

  const onCancelPrint = () => {
    console.log("cancel")
  }


  let dialogTitle = status === "prepared" ? "인쇄 종료 대기 중" : "인쇄 준비 중";
  dialogTitle = status === "completed" ? "완료" : dialogTitle;

  return (
    <React.Fragment>
      <button {...props} onClick={startPrint} >
        {props.children}
      </button>

      <ProgressDialog
        progress={progressPercent}
        title={dialogTitle}
        open={dialogOn}
        cancelCallback={onCancelPrint} />
      <hr />
    </React.Fragment>
  );
}


