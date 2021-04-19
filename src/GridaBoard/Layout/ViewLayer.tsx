import React, {useState} from "react";
import HeaderLayer from "./HeaderLayer";
import NavLayer from "./NavLayer";
import LeftSideLayer from "./LeftSideLayer";
import ContentsLayer from "./ContentsLayer";
import { ButtonProps, AppBar, makeStyles, Collapse, Button, IconButton } from "@material-ui/core";
import { IFileBrowserReturn } from "nl-lib/common/structures";
import {ArrowDropDown, ArrowDropUp} from '@material-ui/icons';
 
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
    main : {display: "flex", 
      flex: 1, 
      flexDirection: "row-reverse", 
      justifyContent: "flex-start", 
      height:"calc(100% - 300px)"
    },
    headerViewBtn : {
      zIndex: -2,
      background:theme.custom.grey[1],
      height:"24px",
      borderBottom : "rgba(0,0,0,0.05) solid 1px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      "&:hover" : {
        background:theme.custom.icon.mono[2],
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
    }

  })
});



// style={{"--appBar-height":"0px"}}
const ViewLayer = (props: Props) => {
  const classes = useStyles();
  const [isView, setHeaderView] = useState(true); //헤더 뷰

  //헤더 감추기 버튼
  const HeaderController = ()=>{
    return (
    <div className={classes.headerViewBtn} onClick={()=>{setHeaderView((prev)=>!prev)}}> 
      <IconButton
        aria-label="open drawer"
      >
        {isView? (<ArrowDropUp />) : (<ArrowDropDown />)}
      </IconButton>
    </div>);
  }


  return (
    <div className={classes.wrap}>
      <AppBar position="relative" color="transparent" elevation={0}> 
        <Collapse in={isView} timeout={0}>
          <HeaderLayer {...props}/>
          <NavLayer {...props} />
        </Collapse>
        <HeaderController /> {/** 사라지면 안되기 때문에 collapse에서 빠진다 */}
      </AppBar>
      <div className={classes.main}>
        <ContentsLayer {...props}/>
        <LeftSideLayer {...props}/>
      </div>
    </div>
  );
}

export default ViewLayer;
