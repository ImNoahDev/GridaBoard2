import React from "react";
import { IconButton, IconButtonProps } from '@material-ui/core';
import { useSelector } from "react-redux";

import { RootState } from "GridaBoard/store/rootReducer";
import { DeleteOutline } from "@material-ui/icons";
import SimpleTooltip2 from "../SimpleTooltip2";
import { showAlert } from "../../store/reducers/listReducer";
import getText from 'GridaBoard/language/language';

const PageDeleteButton = (props: IconButtonProps) => {
  const activePageNo = useSelector((state: RootState) => state.activePage.activePageNo);

  const handlePageDeleteBtn = () => {
    showAlert({
      type: "deletePage",
      selected: null,
    })
  }

  return (
    <IconButton id="pageDeleteButton" onClick={handlePageDeleteBtn} {...props} >
      <SimpleTooltip2 title={getText('sideMenu_deletePage')}>
        <DeleteOutline />
      </SimpleTooltip2>
    </IconButton>
  );
}

export default PageDeleteButton;