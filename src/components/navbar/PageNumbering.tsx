import React from 'react';
import '../../styles/main.css';
import { setActivePageNo } from '../../store/reducers/activePageReducer';
import { RootState } from '../../store/rootReducer';
import { useSelector } from "react-redux";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { IconButton } from '@material-ui/core';
import $ from "jquery";

const selectPageStyle = {
  width: "35px",
  height: "20px",
  marginRight: "10px"
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

    return (
        <div>
          <IconButton id="pre_btn" onClick={prevChange}>
            <NavigateBeforeIcon />
          </IconButton>
          <input value={pageNo} style={selectPageStyle} onChange={handleChange}/>
          /
          &nbsp;
          <span>{numPages}</span>
          <IconButton id="next_btn" onClick={nextChange}>
            <NavigateNextIcon />
          </IconButton>
        </div>
    )
}

export default PageNumbering;