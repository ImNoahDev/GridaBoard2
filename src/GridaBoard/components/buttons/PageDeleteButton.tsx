import React from "react";
import { IconButton, IconButtonProps } from '@material-ui/core';
import { useSelector } from "react-redux";

import { RootState } from "GridaBoard/store/rootReducer";
import GridaDoc from "GridaBoard/GridaDoc";
import { DeleteOutline } from "@material-ui/icons";

const PageDeleteButton = (props: IconButtonProps) => {
  const activePageNo = useSelector((state: RootState) => state.activePage.activePageNo);

  const handlePageDeleteBtn = () => {
    if(activePageNo === -1) return ;
    GridaDoc.getInstance().removePages(activePageNo);
  }

  return (
    <IconButton id="pageDeleteButton" onClick={handlePageDeleteBtn} {...props} >
      <DeleteOutline />
    </IconButton>
  );
}

export default PageDeleteButton;