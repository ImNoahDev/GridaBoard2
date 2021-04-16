import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/rootReducer";
import GridaDoc from "../GridaDoc";
import { NeoPdfDocument } from "nl-lib/common/neopdf";
import { IFileBrowserReturn } from "nl-lib/common/structures";

import { nullNcode } from "nl-lib/common/constants";
import { MixedPageView } from "nl-lib/renderer";
import { PLAYSTATE } from "nl-lib/common/enums";
import { PenManager } from "nl-lib/neosmartpen";
import RotateButton from "../components/buttons/RotateButton";
import GridaToolTip from "../styles/GridaToolTip";
import { Button, IconButton, makeStyles, Popover } from "@material-ui/core";
import HelpIcon from '@material-ui/icons/Help';
import $ from "jquery";
import PageClearButton from "../components/buttons/PageClearButton";
import {KeyboardArrowUp, KeyboardArrowDown} from '@material-ui/icons/';
import CustomBadge from "../components/CustomElement/CustomBadge";
import InformationButton from "../components/buttons/InformationButton";

const useStyle = props=>makeStyles(theme=>({
  root : {
    display: "flex",
    position: "relative",
    flex: 1,
    overflow: "auto",
    flexDirection: "column"
  },
  sideEventer : {
    position: "absolute",
    zIndex: 100,
    top: "calc(6%)",
    right: "54px",
    "& > span" : {
      display: "flex",
      "& > button": {
        marginTop: "16px",
        background: theme.custom.white[1],
        boxShadow: "2px 0px 24px rgba(0, 0, 0, 0.15), inset 0px 2px 0px rgba(255, 255, 255, 1)",
        borderRadius: "50%",
        display: "block",
        zoom: 1 / props.brZoom,
        "&:hover": {
          color: theme.palette.action.hover,
        },
      }
    }
  },
  dropDown : {
    display: "none",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "8px",
    position: "fixed",
    width: "240px",
    height: "176px",
    background: theme.custom.white[0],
    boxShadow: theme.custom.shadows[0],
    borderRadius: "12px",
    zIndex: 100,
    marginTop: "620px",
    marginLeft: "1420px",
    zoom: 1 / props.brZoom
  },
  upIcon : {
    top: "10px",
    position: "absolute",
    marginLeft: "0px",
    right: "45px",
    display: "flex",
    padding: "8px",
    width: "40px",
    height: "40px",
    background: theme.custom.white[0],
    borderRadius: "40px",
    zIndex: 1000
  },
  information : {
    right: "24px",
    bottom: "24px",
    display: "flex",
    position : "absolute",
    zIndex: 100,
    "& > button": {
      marginTop: "16px",
      boxShadow: "2px 0px 24px rgba(0, 0, 0, 0.15), inset 0px 2px 0px rgba(255, 255, 255, 1)",
      borderRadius: "50%",
      display: "block",
      zoom: 1 / props.brZoom,
    }
  }
}));


interface Props {
  handlePdfOpen: (event: IFileBrowserReturn) => void,
  setHeaderView : (isView: boolean) => void
}

const ContentsLayer = (props: Props) => {
  const { handlePdfOpen, setHeaderView, ...rest } = props;
  const [pageWidth, setPageWidth] = useState(0);
  const {zoomStore} = useSelector((state: RootState) =>({
    zoomStore: state.zoomReducer.zoom as number,
  }));
  const [isHeader, setisHeader] = useState(true);
  const rotationTrigger = useSelector((state: RootState) => state.rotate.rotationTrigger);
  const {activePageNo_store} = useSelector((state: RootState) =>({
    activePageNo_store: state.activePage.activePageNo,
  }));
  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);

  const classes = useStyle({brZoom:brZoom})();
  useEffect(() => {
    if (activePageNo_store !== activePageNo) {
      setLocalActivePageNo(activePageNo_store);
    }
  }, [activePageNo_store])
  //pdf file name을 설정하는건 사용자가 지정한 gridaboard 이름이어야 함. 미지정시에는 '그리다보드1'
  //store에 따로 가지고 있어야 한다

  const [toggleRotation, setToggleRotation] = useState(false);
  const [activePageNo, setLocalActivePageNo] = useState(-1);

  const pdfUrl = undefined as string;
  const pdfFilename = undefined as string;
  let pdf = undefined as NeoPdfDocument;
  let pdfPageNo = 1;
  let rotation = 0;
  let pageInfos = [nullNcode()];
  let basePageInfo = nullNcode();
  let pdfFingerprint = undefined as string;

  const viewFit_store = useSelector((state: RootState) => state.viewFitReducer.viewFit);

  useEffect(() => {
    if (rotationTrigger !== toggleRotation) {
      setToggleRotation(rotationTrigger);
    }
  }, [rotationTrigger])

  useEffect(() => {
    if (activePageNo_store !== activePageNo) {
      setLocalActivePageNo(activePageNo_store);
    }
  }, [activePageNo_store])

  if (activePageNo_store >= 0) {
    const doc = GridaDoc.getInstance();
    const page = doc.getPageAt(activePageNo_store)
    if (page._pdfPage !== undefined) {
      rotation = page._pdfPage.viewport.rotation;
    } else {
      rotation = page.pageOverview.rotation;
    }
    pdf = page.pdf;

    pdfFingerprint = doc.getPdfFingerprintAt(activePageNo_store);
    pdfPageNo = doc.getPdfPageNoAt(activePageNo_store);
    pageInfos = doc.getPageInfosAt(activePageNo_store);
    basePageInfo = doc.getBasePageInfoAt(activePageNo_store);
  }

  const {renderCountNo_store} = useSelector((state: RootState) =>({
    renderCountNo_store: state.activePage.renderCount,
  }));

  const pens = useSelector((state: RootState) => state.appConfig.pens);
  const virtualPen = PenManager.getInstance().virtualPen;

  const handlePageWidthNeeded = (width: number) => {
    setPageWidth(width);
  }

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   setAnchorEl(event.currentTarget);
  //   if ($(".help_drop_btn").css("display") == "none") {
  //     $(".help_drop_btn").show();
  //   } else {
  //     $(".help_drop_btn").hide();
  //   }
  // };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  $(document).ready(function(){
    $('.help_drop_down').hover(
      function(event){
        $(this).addClass('hover');
        $(this).css("color", "rgba(104,143,255,1)");
        $(this).css("background", "rgba(232,236,245,1)");
      },
      function(){
        $(this).removeClass('hover');
        $(this).css("color", "rgba(18,18,18,1)");
        $(this).css("background", "rgba(255,255,255,0.9)");
      }
    );
  });


  return (
    <div id="main" className={`${classes.root}`}>
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="end"
        className={classes.upIcon}
        onClick={()=>{
          setisHeader(!isHeader)
          setHeaderView(!isHeader);
        }}
      >
        {isHeader ? (<KeyboardArrowUp/>) : (<KeyboardArrowDown/>)}
      </IconButton>
      <div className={`${classes.sideEventer}`}>
        <CustomBadge badgeContent={`TAB`}>
          <RotateButton disabled={activePageNo_store === -1} />
        </CustomBadge>
        <CustomBadge badgeContent={`S`}>
          <PageClearButton disabled={activePageNo_store === -1} />
        </CustomBadge>
      </div>
      <InformationButton className={classes.information}/>
      
      <div id="mixed-viewer-layer" style={{
        position: "relative",
        height: '100%',
        float: "right",
      }}>
        <MixedPageView
          pdf={pdf}
          pdfUrl={pdfUrl} filename={pdfFilename}
          pdfPageNo={pdfPageNo} pens={[...pens, virtualPen]}
          playState={PLAYSTATE.live}
          rotation={rotation}
          isMainView={true}

          pageInfo={pageInfos[0]}
          basePageInfo={basePageInfo}

          parentName={"grida-main-home"}
          viewFit={viewFit_store}
          zoom={zoomStore}
          autoPageChange={true}
          fromStorage={false}
          fitMargin={10}

          activePageNo={activePageNo_store}
          handlePageWidthNeeded = {(width) => handlePageWidthNeeded(width)}

          renderCountNo={renderCountNo_store}

          noInfo = {true}
        />
      </div>
    </div>
  );
}

export default ContentsLayer;