import React, { useState } from 'react';
import '../../styles/main.css';
import Pagination from '@material-ui/lab/Pagination';
import { setActivePageNo } from '../../store/reducers/activePageReducer';
import { RootState } from '../../store/rootReducer';
import { useSelector } from "react-redux";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Button, IconButton } from '@material-ui/core';
import $ from "jquery";

// const pageStyle = {
//   outline: 0,
//   border: 0,
//   marginTop: 2
// } as React.CSSProperties;
// 2.2265625
// \6.510416666666667

// 8.736979166666667

// 3.255208333333333

// 45.3125 전체 반

// 8.90625 페이지 너비

// 8.072916666666667

// 36.40625



const pageStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "8px 16px",
  position: "static",
  width: "171px",
  height: "46px",
  left: "calc(50% - 171px / 2)",
  top: "calc(50% - 46px / 2)",
  background: "rgba(255,255,255,0.25)",
  boxShadow: "rgba(156,156,156,0.48)",
  borderRadius: "100px",
  marginBottom: "70px",
  zIndex: 1500,
  bottom: 0,
  // marginLeft: "29.4vw",
  marginLeft: "39.40625vw"
} as React.CSSProperties;

const pageNoStyle = {
  position: "static",
  width: "7px",
  height: "14px",
  left: "8px",
  top: "8px",
  fontFamily: "Roboto",
  fontStyle: "normal",
  fontWeight: "bold",
  lineHeight: "14px",
  display: "flex",
  alignItems: "center",
  textAlign: "right",
  letterSpacing: "0.25px",
} as React.CSSProperties;

const selectPageStyle = {
  width: "15px",
  height: "20px",
  // clear: "both",
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

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
      if (numPages_store !== 0) {
        setActivePageNo(value-1);
      }
    }
    
    const onChange = (e) => {
      const value = parseInt(e.target.value);
      if (value > numPages) {
        console.log("막아")
      } else {
        if (numPages_store !== 0) {
          setActivePageNo(e.target.value - 1);
        }
      }
    }

    const prevChange = (e) => {
      if(pageNo <= 1) {
        console.log("막아");
        $('#pre_btn').css('disabled')
      } else {
        setActivePageNo(pageNo - 2);
      } 
    }

    const nextChange = (e) => {
      if(pageNo >= numPages) {
        console.log("막아");
      }else {
        setActivePageNo(pageNo);
      }
    }

    return (
        // <Pagination count={numPages} page={pageNo} color="secondary" className="btn btn-neo" style={pageStyle} 
        // onChange={handleChange} />
        <div style={pageStyle}>
          <IconButton id="pre_btn" onClick={prevChange}>
            <NavigateBeforeIcon />
          </IconButton>
          &nbsp;&nbsp;
          <input value={pageNo} style={selectPageStyle} onChange={onChange}/>
          &nbsp;&nbsp;&nbsp;
          /
          &nbsp;&nbsp;&nbsp;
          <div>{numPages}</div>
          &nbsp;&nbsp;
          <IconButton id="next_btn" onClick={nextChange}>
            <NavigateNextIcon />
          </IconButton>
        </div>
    )
}

export default PageNumbering;