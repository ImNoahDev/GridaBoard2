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
    const [page, setPage] = React.useState(1);
    
    let numPages;
    if (numPages_store < 1) { 
      numPages = 1;
    } else {
      numPages = numPages_store;
    }

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
      if (numPages_store !== 0) {
        setPage(value);
        setActivePageNo(value-1);
      }
    }

    return (
        <Pagination count={numPages} page={page} color="secondary" className="btn btn-neo" style={pageStyle} 
        onChange={handleChange} />
    )
}

export default PageNumbering;