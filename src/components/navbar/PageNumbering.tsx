import React, { useState } from 'react';
import '../../styles/main.css';
import Pagination from '@material-ui/lab/Pagination';
import { setActivePageNo } from '../../store/reducers/activePageReducer';
import { RootState } from '../../store/rootReducer';
import { useSelector } from "react-redux";

const pageStyle = {
  outline: 0,
  border: 0
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
        <Pagination count={numPages} page={pageNo} color="secondary" className="btn btn-neo" style={pageStyle} 
        onChange={handleChange} />
    )
}

export default PageNumbering;