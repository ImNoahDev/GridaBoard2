import React, {useState} from "react";
import HeaderLayer from "./HeaderLayer";
import NavLayer from "./NavLayer";
import LeftSideLayer from "./LeftSideLayer";
import ContentsLayer from "./ContentsLayer";
import { ButtonProps, AppBar, makeStyles, Collapse, Button, IconButton } from "@material-ui/core";
import { IFileBrowserReturn } from "nl-lib/common/structures";
import {ArrowDropDown, ArrowDropUp} from '@material-ui/icons';
import PenLogWindow from "../debugging/PenLogWindow";
import TestButton from "../components/buttons/TestButton";
 
/**
 *
 */
interface Props extends ButtonProps {
  handlePdfOpen: (event: IFileBrowserReturn) => void,
}

const useStyles = makeStyles((theme) => {
  return ({
    wrap : {
      display: "flex",
      flexDirection: "column",
      height: "100%"
    },
    main : {
      background: theme.custom.black[5],
      display: "flex", 
      flex: 1, 
      flexDirection: "row-reverse", 
      justifyContent: "flex-start", 
      height:"calc(100% - 300px)"
    },
    headerViewBtn : {
      zIndex: 0,
      height:"24px",
      borderBottom : "rgba(0,0,0,0.05) solid 1px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "&:hover" : {
        background: "rgba(0,0,0,0.15)",
      }
    },
    headerViewOn : {
      "width": "0",
      "height": "0",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderBottom: `5px solid ${theme.custom.icon.mono[1]}`
    },
    headerViewOff : {
      "width": "0",
      "height": "0",
      borderLeft: "10px solid transparent",
      borderRight: "10px solid transparent",
      borderTop: `5px solid ${theme.custom.icon.mono[1]}`
    },
    headerCollapse:{
      background: theme.custom.white[50]
    }

  })
});



// style={{"--appBar-height":"0px"}}
const ViewLayer = (props: Props) => {
  const classes = useStyles();
  const [isView, setHeaderView] = useState(true); //헤더 뷰
  const [debugOpen, setDebugOpen] = useState(false);

  const handlePenLogWindow = () => {
    setDebugOpen(!debugOpen);
  }

  const hideHeader = () => {
    setHeaderView((prev)=>!prev);
  }

  const hiddenTest = true;

  return (
    <div className={classes.wrap}>
      <AppBar position="relative" color="transparent" elevation={0}> 
        <Collapse in={isView} className={classes.headerCollapse} timeout={0}>
          <HeaderLayer {...props} handlePenLogWindow={handlePenLogWindow} hidden={hiddenTest} />
        </Collapse>
          <NavLayer {...props} hideHeader={hideHeader}/>
      </AppBar>
      <div className={classes.main}>
        <ContentsLayer {...props}/>
        <LeftSideLayer {...props}/>
      </div>

      <PenLogWindow open={debugOpen} hidden={hiddenTest}/>

    </div>
  );
}

export default ViewLayer;
