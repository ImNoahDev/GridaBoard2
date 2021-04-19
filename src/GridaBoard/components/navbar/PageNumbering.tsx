import React, {useEffect} from 'react';
import '../../styles/main.css';
import { setActivePageNo } from '../../store/reducers/activePageReducer';
import { RootState } from '../../store/rootReducer';
import { useSelector } from "react-redux";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { IconButton, makeStyles, Theme, Tooltip, TooltipProps } from '@material-ui/core';
import $ from "jquery";
import { turnOnGlobalKeyShortCut } from '../../GlobalFunctions';
import getText from '../../language/language';
import SimpleTooltip from "../SimpleTooltip";
import CustomBadge from "../CustomElement/CustomBadge";

const selectPageStyle = {
  width: "35px",
  // height: "20px",
  marginRight: "10px",
  marginLeft: "8px",
  border: "none",
  textAlign: "center",
  paddingTop: "4px",
  paddingBottom: "6px",
  // padding: "2px"
} as React.CSSProperties;


const PageNumbering = () => {
    const numPages_store = useSelector((state: RootState) => state.activePage.numDocPages);
    const activePageNo_store = useSelector((state: RootState) => state.activePage.activePageNo);

    let numPages, pageNo;
    if (numPages_store < 1) {
      numPages = 1;
      pageNo = 1;
    } else {
      numPages = numPages_store;
      pageNo = activePageNo_store+1;
    }

    const handleChange = (e) => {
      const value = parseInt(e.target.value);
      if (value > numPages) {
        console.log("disChecked")
      } else {
        if (numPages_store !== 0) {
          setActivePageNo(e.target.value - 1);
        }
      }
    }

    const prevChange = (e) => {
      if(pageNo <= 1) {
        console.log("disChecked");
        $('#pre_btn').css('disabled')
      } else {
        setActivePageNo(pageNo - 2);
      }
    }

    const nextChange = (e) => {
      if(pageNo >= numPages) {
        console.log("disChecked");
      }else {
        setActivePageNo(pageNo);
      }
    }

    useEffect(() => {
      const form = document.getElementById("page_input");
      form.addEventListener("focus", function( event ) {
        turnOnGlobalKeyShortCut(false);
      }, true);
      form.addEventListener("blur", function(event) {
        turnOnGlobalKeyShortCut(true);
      }, true)

    }, []);

    return (
      <div>
        <CustomBadge badgeContent="←">
          <IconButton id="pre_btn" onClick={prevChange} style={{padding: "8px"}}>
            <SimpleTooltip title={getText("nav_page_prev")}>
              <NavigateBeforeIcon />
            </SimpleTooltip>
          </IconButton>
        </CustomBadge>
        <input id="page_input" value={pageNo} style={selectPageStyle} onChange={handleChange}/>
        /
        &nbsp;
          <span style={{marginRight: "8px"}}>{numPages}</span>
        <CustomBadge badgeContent="→">
          <IconButton id="next_btn" onClick={nextChange} style={{padding: "8px"}}>
            <SimpleTooltip title={getText("nav_page_next")}>
              <NavigateNextIcon />
            </SimpleTooltip>
          </IconButton>
        </CustomBadge>
      </div>
    )
}

export default PageNumbering;