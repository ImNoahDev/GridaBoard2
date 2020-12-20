
import React, { useEffect, useState } from "react";
import { ButtonProps, } from "@material-ui/core";
import { IPrintingReport, IPrintOption } from "./PrintDataTypes";
import ProgressDialog from "./ProgressDialog";
import PrintNcodedPdfWorker from "./PrintNcodedPdfWorker";
import { OptionDialog } from "./Dialogs/OptionDialog";

interface Props extends ButtonProps {
  /** 인쇄될 문서의 url, printOption.url로 들어간다. */
  url: string,
  filename: string,

  /** 인쇄 준비 상태를 업데이트하는 콜백 함수 */
  reportProgress?: (arg: IPrintingReport) => void,

  /** 기본값의 IPrintOption을 받아서, dialog를 처리하고 다시 돌려주는 콜백 함수 */
  printOptionCallback?: (arg: IPrintOption) => IPrintOption,
}


let _printOption: IPrintOption;
let _promise: Promise<IPrintOption>;
let _resolve;
/**
 * Class
 */
export default function PrintNcodedPdfButton(props: Props) {
  const { url, filename, reportProgress, printOptionCallback, ...rest } = props;

  const [progressPercent, setProgressPercent] = useState(0);
  const [status, setStatus] = useState("N/A");
  const [progressOn, setProgressOn] = useState(false);
  const [optionOn, setOptionOn] = useState(false);

  const startPrint = async () => {
    if (props.url && props.filename) {
      // setStart(true);
      const worker = new PrintNcodedPdfWorker(props, onProgress);

      setProgressPercent(0);
      await worker.startPrint(props.url, props.filename, showOptionDialog);
      setProgressOn(false);
    }
  }

  const showOptionDialog = (printOption: IPrintOption): Promise<IPrintOption> => {
    _printOption = printOption;
    _printOption.completedCallback = onAfterPrint;
    openOptionDialog();

    const promise = new Promise((resolve) => {
      _resolve = resolve;
    }) as Promise<IPrintOption>;

    _promise = promise;
    return promise;
  }

  const closeOptionDialog = () => setOptionOn(false);
  const openOptionDialog = () => setOptionOn(true);

  const onProgress = (arg: IPrintingReport) => {
    setProgressPercent(arg.totalCompletion);
    setStatus(arg.status);
  }

  useEffect(() => {
    console.log(`status = ${status}, progress=${progressPercent}`);
  }, [status, progressPercent]);

  const onOK = () => {
    closeOptionDialog();
    setProgressOn(true);
    _resolve(_printOption);
    console.log("onOK");
  }

  const onCancel = () => {
    closeOptionDialog();
    console.log("onCancel");
    _resolve(undefined);
  }

  const onAfterPrint = () => {
    // setProgressOn(false);

    _printOption = undefined;
    _resolve = undefined;
    console.log("END OF PRINT");
  }

  const onCancelPrint = () => {
    console.log("cancel")
  }


  let dialogTitle = status === "prepared" ? "인쇄 종료 대기 중" : "인쇄 준비 중";
  dialogTitle = status === "completed" ? "완료" : dialogTitle;

  // console.log(`PRT, option dialog on=${optionOn}, progress on=${progressOn}`);

  return (
    <React.Fragment>
      <button {...rest} onClick={startPrint} >
        {props.children}
      </button>

      { optionOn
        ? <OptionDialog open={optionOn} cancelCallback={onCancel} okCallback={onOK} printOption={_printOption} />
        : <ProgressDialog progress={progressPercent} title={dialogTitle} open={progressOn} cancelCallback={onCancelPrint} />
      }
    </React.Fragment>
  );
}


