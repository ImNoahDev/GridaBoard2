import React from "react";
import { IconButton, IconButtonProps } from '@material-ui/core';
import { useSelector } from "react-redux";

import { RootState } from "GridaBoard/store/rootReducer";
import GridaDoc from "GridaBoard/GridaDoc";
import { DeleteOutline } from "@material-ui/icons";
import SimpleTooltip2 from "../SimpleTooltip2";

const PageDeleteButton = (props: IconButtonProps) => {
  const activePageNo = useSelector((state: RootState) => state.activePage.activePageNo);

  const handlePageDeleteBtn = () => {
    if(activePageNo === -1) return ;
    GridaDoc.getInstance().removePages(activePageNo);
  }

  return (
    <IconButton id="pageDeleteButton" onClick={handlePageDeleteBtn} {...props} >
      <SimpleTooltip2 title="페이지 삭제">
        <DeleteOutline />
      </SimpleTooltip2>
    </IconButton>
  );
}

export default PageDeleteButton;