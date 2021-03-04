import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, ButtonProps, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';

import "./pen_touch.css";

import { theme } from '../../../../styles/theme';
import { RootState } from '../../../../store/rootReducer';
import { hideCalibrationDialog, showCalibrationDialog, updateCalibrationDialog, setCalibrationMode } from '../../../../store/reducers/calibrationReducer';
import { IPageSOBP, IPoint, IPrintOption } from '../../../common/structures';
import { NeoPdfDocument, NeoPdfManager } from '../../../common/neopdf';
import CalibrationData from '../../../common/mapper/Calibration/CalibrationData';
import { MappingStorage } from '../../../common/mapper/MappingStorage';


const _penImageUrl = "/icons/image_calibration.png";

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
});

const calibrationStyle = {
  padding: "0px",
  margin: "0px",
  border: "0px",
  minWidth: "24px"
}

interface IDialogProps {
  filename: string,
  printOption: IPrintOption,
  cancelCallback: (e) => void,
}

const imgWidth = 400;
const imgHeight = 400;
const imgDensity = 2;

const nu = { p0: {x: 0, y: 0} as IPoint, p2: {x: 0, y: 0} as IPoint };
const pu = { p0: {x: 0, y: 0} as IPoint, p2: {x: 0, y: 0} as IPoint };
const pageInfos: IPageSOBP[] = [];

const CalibrationDialog = (props: IDialogProps) => {
  const classes = useStyles();
  const [pdf, setPdf] = useState(undefined as NeoPdfDocument);
  const [numPages, setNumPages] = useState(0);
  const [targetPages, setTargetPages] = useState(props.printOption.targetPages);
  const [markPosRatio, setMarkPosRatio] = useState({ xr: 0, yr: 0 });
  const [imgSrc, setImgSrc] = useState("//:0");
  const [status, setStatus] = useState("inited");

  let pageNo = 0;
  let numProgresses = numPages + 1;

  const {calibrationData} = useSelector((state: RootState) => ({
    calibrationData: state.calibrationDataReducer.calibrationData
  }));

  const progress = useSelector((state: RootState) => state.calibration.progress);
  const url = useSelector((state: RootState) => state.calibration.url);
  // console.log(`calibration: loaded ${progress}`)

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

  useEffect(() => {
    if (pdf && targetPages.length > 0) {
      const w = imgWidth * imgDensity;
      const h = imgHeight * imgDensity;
      const markPos = progress < 2 ? progress : 2;
      if (pageNo !== undefined) {
        pdf.getPageThumbnailUrl(pageNo, w, h, "rgb(220,220,220)", true, markPos).then(thumbnail => {
          setImgSrc(thumbnail.url);
          setMarkPosRatio({ xr: thumbnail.markPos.x / thumbnail.canvas.w, yr: thumbnail.markPos.y / thumbnail.canvas.h });
        });
      }
    }
  }, [progress, status]);

  useEffect(() => {
    if (show) {
      setCalibrationMode(true);
      NeoPdfManager.getInstance().getDocument({
        url: url,
        filename: props.filename,
        purpose: "to be used by CalibrationDialog"
      }).then(loadedPdf => {
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
      setCalibrationMode(false);
    }
  }, [show]);
  
  useEffect(() => {
    if (!(calibrationData.section === -1 && calibrationData.owner === -1 && calibrationData.page === -1 && calibrationData.book === -1)) {
      
      const pageInfo: IPageSOBP = {
        section: calibrationData.section, 
        book: calibrationData.book, 
        owner: calibrationData.owner, 
        page: calibrationData.page
      };
      const filename = 'pdf_file_name';

      switch (progress) {
        case 0: {
          nu.p0.x = calibrationData.nu.x;
          nu.p0.y = calibrationData.nu.y;

          pu.p0.x = calibrationData.pu.x;
          pu.p0.y = calibrationData.pu.y;

          pageInfos.push(pageInfo);
          break;
        }
        case 1: {
          nu.p2.x = calibrationData.nu.x;
          nu.p2.y = calibrationData.nu.y;

          pu.p2.x = calibrationData.pu.x;
          pu.p2.y = calibrationData.pu.y;

          break;
        }
        default: {
          pageInfos.push(pageInfo);
          break;
        } //default end
      } //switch end

      if (progress === numPages) {
        const pdfPagesDesc = {
          url: pdf.url,
          filename: pdf.filename,
          fingerprint: pdf.fingerprint,
          id: pdf.fingerprint + '/1',
          numPages: numPages,
          pageNo: pageNo
        }
        const worker = new CalibrationData();
        const mapper = worker.createDocMapperItemOneStep(
          nu, pu, pageInfos, pdfPagesDesc, pdfPagesDesc.filename, numPages, 1
        );

        const msi = MappingStorage.getInstance();
        msi.registerTemporary(mapper);

        hideCalibrationDialog();
      }

      updateCalibrationDialog(progress+1);
    } //if end
  }, [calibrationData]);
 
  useEffect(() => {
    if (pdf) {
      console.log("calibration: pdf loaded");
    }
  }, [pdf]);

  if (!pdf) return (<></>);

  if (pdf && targetPages.length > 0) {
    pageNo = progress > 1 ? targetPages[progress-1] : targetPages[0];

    // let tmpPageNo = progress > 0 ? targetPages[progress - 1] : targetPages[0];
    // setPageNo(tmpPageNo);
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

  const { filename: propsFilename, printOption: propsPrintOption, cancelCallback: propsCancelCallback, ...rest } = props;

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
  filename: string,
  printOption: IPrintOption,
  handlePdfUrl: any,
  cancelCallback: (e) => void,
}

export default function CalibrationButton(props: Props) {
  const { filename, printOption, handlePdfUrl, cancelCallback, ...rest } = props;
  const startCalibration = async (e) => {
    const new_url = await handlePdfUrl();
    if (new_url) {
      const option = {
        url: new_url,
        show: true,
        targetPages: props.printOption.targetPages,
        progress: 0,
        calibrationMode: true,
      };

      showCalibrationDialog(option);
    }
  }

  return (
    <React.Fragment>
      <Button {...rest} onClick={startCalibration} style={calibrationStyle}>
        {props.children}
      </Button>
      <CalibrationDialog {...props} />
      {/* { new_url ? <CalibrationDialog {...props, url = new_url} /> : ""} */}
    </React.Fragment>
  );
}