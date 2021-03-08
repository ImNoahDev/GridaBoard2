import React, { useState } from 'react';
import '../../styles/main.css';
import Pagination from '@material-ui/lab/Pagination';
import { setActivePageNo } from '../../store/reducers/activePageReducer';
import { RootState } from '../../store/rootReducer';
import { useSelector } from "react-redux";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

// const pageStyle = {
//   outline: 0,
//   border: 0,
//   marginTop: 2
// } as React.CSSProperties;

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
  marginBottom: "30px",
  zIndex: 1500
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

    return (
        // <Pagination count={numPages} page={pageNo} color="secondary" className="btn btn-neo" style={pageStyle} 
        // onChange={handleChange} />
        <div style={pageStyle}>
          <NavigateBeforeIcon />
          <input value={pageNo}/>
          /
          <input value={numPages}/>
          {/* <input>{pageNo}</input> */}
          <NavigateNextIcon />
        </div>
    )
}

export default PageNumbering;