import { makeStyles, Grow, SvgIcon, Popper, ClickAwayListener, Paper, MenuList, MenuItem, IconButton, Checkbox } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import firebase from 'GridaBoard/util/firebase_config';
import { forceUpdateBoardList } from "../../../../GridaBoard/store/reducers/appConfigReducer";
import { useDispatch } from "react-redux";
import MoreVert from "@material-ui/icons/MoreVert";
import { deleteBoardFromLive } from "../../../BoardListPageFunc";
import { IBoardData } from "../../../structures/BoardStructures";
import { showDropDown } from 'GridaBoard/store/reducers/listReducer';

interface Props extends  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
   docsList?: Array<any>,
   selectedContent ?: number,
   selectedClass ?: string,
   routeChange ?: (idx:number)=>void,
   updateSelectedItems ?: (el: IBoardData, checked: boolean) => void,
}

const useStyle = makeStyles(theme => ({
  removeBtn : {
    position: "absolute",
    right: "7px",
    top : "5px",
    zIndex: 1000,
    opacity: 0.78,
    transform: "scale(1)",
    "& > div:last-child": {
      width:"100%",
      height: "100%",
      position: "absolute",
      top: "0px",
      right: "0px",
    }
  },
  removeBtnMouseDown : {
    transform: "scale(0.85) !important",
    color: "#555555"
  },
  selectBtn : {
    position: "absolute",
    left: "7px",
    top : "5px",
    zIndex: 1000,
    opacity: 0.78,
    transform: "scale(1)",
    "& > div:last-child": {
      width:"100%",
      height: "100%",
      position: "absolute",
      top: "0px",
      right: "0px",
    }
  },
  menuItem : {
    minWidth : "130px"
  }
}));

let refs = [];

const GridView = (props : Props)=>{
  const classes = useStyle();
  const {selectedContent, selectedClass,ref,routeChange, ...rest} = props;
  const {docsList} = props;
  const [open, setOpen] = useState(false);
  const [listIdx, setListIdx] = useState(0);
  const dispatch = useDispatch();

  let anchorRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    refs = [];
  }, []);

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  const handleMenuItemClick = async (
    index: number,
  ) => {
    switch (index) {
      case 0 : { //삭제
        const result = await deleteBoardFromLive(docsList[listIdx]);
        
        await docsList.splice(listIdx, 1);

        await setOpen(false);

        if (result === 1) {
          dispatch(forceUpdateBoardList());
        }

        break;
      }
      default: break;
    }
  };

  const handleMenuListClick = (
    index: number,
  ) => {
    setListIdx(index);
    setOpen((prevOpen) => !prevOpen);
  };

  const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>, el: IBoardData) => {
      props.updateSelectedItems(el, event.target.checked)
  }
  // const setRefs = (ref) => {
  //   refs.push(ref)
  // }

  return (
    <React.Fragment>
      {docsList.map((el, idx) => {
        let times = new Date(el.last_modified.seconds*1000);
        let category = el.category == "Unshelved" ? "" : el.category;
        return (
          <React.Fragment key={idx}>
            <div key={idx} className={`contentItem`}>
              <div style={{backgroundImage:`url(${el.thumb_path})`}} onClick={() => routeChange(el.key)} />
              <div>
                <div>{el.doc_name}</div>
                <div className="contentData">
                  <div>
                    {`${times.getFullYear()}/${times.getMonth()}/${times.getDate()}`}
                  </div>
                  {category === "" ? "" : (<div />)}
                  {category === "" ? "" : (<div>{category}</div>)}
                </div>
              </div>
              <Grow in={true} >
                <div className={classes.selectBtn}>
                  <Checkbox
                      color="primary"
                      inputProps={{ 'aria-label': 'secondary checkbox' }}
                      onChange={(event) => handleCheckBoxChange(event, el)}
                    />
                </div>
              </Grow>
              {selectedContent === idx ? (<div className={selectedClass}/>) : ""}
              <Grow in={true} >
                <div className={classes.removeBtn}>
                  <IconButton onClick={(e) =>{
                    e.stopPropagation();
                    showDropDown({
                      type : "docs",
                      event : e,
                      selected: el
                    })
                  }}><MoreVert/></IconButton>
                </div>
              </Grow>
            </div>
        </React.Fragment>
        )
        })} 
    </React.Fragment>
    );
}


export default GridView;