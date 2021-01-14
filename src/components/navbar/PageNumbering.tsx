import React, { useState } from 'react';
import '../../styles/main.css';
import Pagination from '@material-ui/lab/Pagination';
import { setActivePageNo } from '../../store/reducers/activePageReducer';
import { RootState } from '../../store/rootReducer';
import { useSelector } from "react-redux";

interface Props {
  numPages?: number,
  drawerWidth?: number,

  renderCount?: number,

  onSelectPage?: (pageNo: number) => void,

  activePageNo?: number,
  noInfo?: boolean,
}

interface State {
  page: number;
}

const pageStyle = {
  outline: 0,
  border: 0
} as React.CSSProperties;

const PageNumbering = () => {

    const numPages = useSelector((state: RootState) => state.activePage.numDocPages);

    const [page, setPage] = React.useState(1);

    if (numPages < 1) return null;

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
      setPage(value);
      setActivePageNo(value-1);
    }

    return (
        <Pagination count={numPages} page={page} color="secondary" className="btn btn-neo" style={pageStyle} 
        onChange={handleChange}  />
    )
}

export default PageNumbering;