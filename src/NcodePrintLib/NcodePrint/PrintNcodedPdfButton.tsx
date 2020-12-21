
import React, { useEffect, useState } from "react";
import { ButtonProps, } from "@material-ui/core";
import { IPrintingReport, IPrintOption } from "./PrintDataTypes";
import ProgressDialog from "./ProgressDialog";
import PrintNcodedPdfWorker from "./PrintNcodedPdfWorker";
import { OptionDialog } from "./Dialogs/OptionDialog";
import * as Util from "../UtilFunc";
import CancelWaitingDialog from "./CancelWaitingDialog";

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
  const [worker, setWorker] = useState(undefined as PrintNcodedPdfWorker);
  const [waitingOn, setWaitingOn] = useState(false);

  const startPrint = async () => {
    if (props.url && props.filename) {
      // setStart(true);
      const worker = new PrintNcodedPdfWorker(props, onProgress);
      setWorker(worker);

      setProgressPercent(0);
      await worker.startPrint(props.url, props.filename, showOptionDialog);
      console.log("CANCEL, worker canceled");
      setProgressOn(false);
      setWaitingOn(false);
    }
  }

  const showOptionDialog = (printOption: IPrintOption): Promise<IPrintOption> => {
    // 리턴값을 준비
    const promise = new Promise((resolve) => {
      _resolve = resolve;
    }) as Promise<IPrintOption>;
    _promise = promise;

    // 취소 버튼을 대비
    _printOption = Util.cloneObj(printOption);

    // 완료시 콜백
    _printOption.completedCallback = onAfterPrint;

    // 다이얼로그를 열어 놓고
    openOptionDialog();

    // promise가 종료되지 않은 상태로 리턴, onAfterPrint 등에서 promise를 resolve
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

  const onOK = (printOption: IPrintOption) => {
    // 디이얼로그를 닫고, 프로그레스 바를 보여준다.
    closeOptionDialog();
    setProgressOn(true);

    // _printOption을 돌려 줘서 세팅 값을 반환한다.
    _resolve(printOption);
    console.log("onOK");
  }

  const onCancel = (printOption: IPrintOption) => {
    // 디이얼로그를 닫고, 프로그레스 바를 열지 않는다.
    closeOptionDialog();

    console.log("onCancel");

    // _printOption이 세팅되지 않았음을 전한다.
    // 받는 곳에서는 undefined가 되어 있는지 확인해야 한다.
    _resolve(undefined);
  }

  const onAfterPrint = () => {
    setProgressOn(false);
    setWaitingOn(false);

    _printOption = undefined;
    _resolve = undefined;
    console.log("END OF PRINT");
    console.log("CANCEL, END OF PRINT");

  }

  const onCancelPrint = () => {
    setWaitingOn(true);
    worker.cancelPrint();
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
      <CancelWaitingDialog open={waitingOn} />
    </React.Fragment>
  );
}


