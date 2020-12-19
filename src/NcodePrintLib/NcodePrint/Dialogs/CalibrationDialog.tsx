import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/rootReducer';
import { hideCalibrationDialog, showCalibrationDialog, updateCalibrationDialog } from '../../../store/reducers/calibrationReducer';
import { IPrintOption } from '../..';
import NeoPdfDocument, { IGetDocumentOptions } from '../../NeoPdf/NeoPdfDocument';
import { IThumbnailDesc } from "../../NeoPdf/NeoPdfPage";
import NeoPdfManager from '../../NeoPdf/NeoPdfManager';
import { theme } from '../../../styles/theme';
import "./pen_touch.css";
import { hideUIProgressBackdrop, showUIProgressBackdrop } from '../../../store/reducers/ui';

const _penImageUrl = "./icons/image_calibration.png";

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

interface IDialogProps {
  url: string,
  filename: string,
  printOption: IPrintOption,
  cancelCallback: (e) => void,
}

const imgWidth = 400;
const imgHeight = 400;
const imgDensity = 2;

function CalibrationDialog(props: IDialogProps) {
  const classes = useStyles();
  const [pdf, setPdf] = useState(undefined as NeoPdfDocument);
  const [numPages, setNumPages] = useState(0);
  const [targetPages, setTargetPages] = useState(props.printOption.targetPages);
  const [markPosRatio, setMarkPosRatio] = useState({ xr: 0, yr: 0 });
  const [imgSrc, setImgSrc] = useState("//:0");
  const [status, setStatus] = useState("inited");

  let pageNo = 0;
  let numProgresses = numPages + 1;

  const progress = useSelector((state: RootState) => state.calibration.progress);
  console.log(`calibration: loaded ${progress}`)

  const show = useSelector((state: RootState) => state.calibration.show);

  const percent = Math.ceil(progress / numProgresses * 100);
  const imageRef = useRef(null);
  const dialogRef = useRef(null);

  const initState = () => {
    setPdf(undefined);
    setNumPages(0);
    setTargetPages(props.printOption.targetPages);
    setMarkPosRatio({ xr: 0, yr: 0 });
    setImgSrc("//:0");
    setStatus("inited");
  }

  const handleClose = (e) => {
    // hideCalibrationDialog();
    console.log("testing: closing");
    initState();


  }


  const handleCancel = (e) => {
    hideCalibrationDialog();

    if (props.cancelCallback) {
      props.cancelCallback(e);
    }
  }

  const handlePrevious = (e) => {
    const nextProgress = progress > 0 ? progress - 1 : 0;
    updateCalibrationDialog(nextProgress);
  }

  const handleNext = (e) => {
    const nextProgress = progress < numPages ? progress + 1 : numPages;
    updateCalibrationDialog(nextProgress);
  }


  // useEffect(() => {
  //   NeoPdfManager.getDocument({ url: props.url }).then(loadedPdf => {
  //     if (loadedPdf) {
  //       const w = imgWidth * imgDensity;
  //       const h = imgHeight * imgDensity;
  //       loadedPdf.generatePageThumbnails(w, h, "rgb(220,220,220)", true).then(() => {
  //         setPdf(loadedPdf);
  //         const t = Array.from({ length: loadedPdf.numPages }, (_, i) => i + 1);
  //         setTargetPages(t);
  //         console.log(`testing: pdf loaded, pages=${t}`)
  //         setNumPages(t.length);
  //       })
  //     }
  //   });
  // }, [props.url]);

  useEffect(() => {
    console.log(`calibration: progress`)
    if (pdf && targetPages.length > 0) {
      const w = imgWidth * imgDensity;
      const h = imgHeight * imgDensity;
      const markPos = progress < 2 ? progress : 2;
      pdf.getPageThumbnailUrl(pageNo, w, h, "rgb(220,220,220)", true, markPos).then(thumbnail => {
        setImgSrc(thumbnail.url);
        setMarkPosRatio({ xr: thumbnail.markPos.x / thumbnail.canvas.w, yr: thumbnail.markPos.y / thumbnail.canvas.h });
      });


    }
  }, [progress, status]);

  useEffect(() => {
    if (show) {
      NeoPdfManager.getDocument({ url: props.url }).then(loadedPdf => {
        if (loadedPdf) {
          const w = imgWidth * imgDensity;
          const h = imgHeight * imgDensity;
          // loadedPdf.generatePageThumbnails(w, h, "rgb(220,220,220)", true).then(() => {
          setPdf(loadedPdf);
          const t = Array.from({ length: loadedPdf.numPages }, (_, i) => i + 1);
          setTargetPages(t);
          console.log(`calibration: pdf loaded, pages=${t}`)
          setNumPages(t.length);

          updateCalibrationDialog(0);
          setStatus("progress");
          // })
        }
      });
    }
    else {
      initState();
    }
  }, [show]);


  useEffect(() => {
    if (pdf) {
      console.log("calibration: pdf loaded");
    }
  }, [pdf]);



  // useEffect(() => {
  //   console.log(`testing: imageRef  current=${imageRef.current}`)
  // }, [imgSrc]);
  if (!pdf) return (<></>);

  if (pdf && targetPages.length > 0) {
    pageNo = progress > 0 ? targetPages[progress - 1] : targetPages[0];
    numProgresses = targetPages.length + 1;
  }

  let x = 2, y = -13;
  if (imageRef.current) {
    const rectDlg = dialogRef.current.getBoundingClientRect();
    const rectImg = imageRef.current.getBoundingClientRect();
    x += rectImg.left - rectDlg.left;
    y += rectImg.top - rectDlg.top;

    x += markPosRatio.xr * imgWidth;
    y += markPosRatio.yr * imgHeight;
  }

  console.log(`[position] x=${x}, y=${y}`)

  const open = show && (pdf !== undefined);
  console.log(`testing: render  imgSrc=${imgSrc.length}`);



  const { url: propsUrl, filename: propsFilename, printOption: propsPrintOption, cancelCallback: propsCancelCallback, ...rest } = props;

  return (
    <React.Fragment>
      { imgSrc.length > 4 ?
        <Dialog open={open} {...rest} onClose={handleClose}>
          <img className={"pentouch_anim"} style={{ width: "60px", height: "70px", position: "absolute", left: x, top: y }} src={_penImageUrl} />

          <DialogTitle id="form-dialog-title" style={{ float: "left", width: "500px" }}>
            <Box fontSize={20} fontWeight="fontWeightBold" >
              인쇄물 등록, 페이지 {pageNo}/{numPages} (Step: {progress + 1}/{numProgresses})
        </Box>
          </DialogTitle>

          <DialogContent ref={dialogRef}>
            <Box component="div" className={classes.root}>
              <Box fontSize={16} fontWeight="fontWeightRegular" >Processing... {percent}%</Box>
            </Box>

            <Box component="div" className={classes.root} style={{ display: "flex", justifyContent: "center" }}>
              <Box borderColor={theme.palette.primary.main} border={1}>
                <img src={imgSrc} style={{ width: imgWidth + "px", height: imgHeight + "px" }} ref={imageRef} />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handlePrevious} color="primary">
              Previous
        </Button>
            <Button onClick={handleNext} color="primary">
              Next
        </Button>
            <Button onClick={handleCancel} color="primary">
              Cancel
        </Button>
          </DialogActions>
        </Dialog>
        : ""
      }
    </React.Fragment>
  );
}








interface Props extends ButtonProps {
  url: string,
  filename: string,
  printOption: IPrintOption,
  cancelCallback: (e) => void,
}


export default function CalibrationButton(props: Props) {
  const { url, filename, printOption, cancelCallback, ...rest } = props;
  // console.log(`calibration: ${props.url}`)
  const startCalibration = (e) => {
    if (props.url) {
      const option = {
        show: true,
        targetPages: props.printOption.targetPages,
        progress: 0,
      };

      showCalibrationDialog(option);
    }
  }

  return (
    <React.Fragment>
      <button {...rest} onClick={startCalibration} >
        {props.children}
      </button>

      { props.url ? <CalibrationDialog {...props} /> : ""}
    </React.Fragment>
  );
}
























