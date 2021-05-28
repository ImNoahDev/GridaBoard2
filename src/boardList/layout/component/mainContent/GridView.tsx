import { makeStyles, Grow, SvgIcon, Popper, ClickAwayListener, Paper, MenuList, MenuItem, IconButton } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import firebase from 'GridaBoard/util/firebase_config';
import { setDocsNum } from "../../../../GridaBoard/store/reducers/appConfigReducer";
import { useDispatch } from "react-redux";
import MoreVert from "@material-ui/icons/MoreVert";

interface Props extends  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
   docsList?: Array<any>,
   selectedContent ?: number,
   selectedClass ?: string,
   routeChange ?: (idx:number)=>void
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
  menuItem : {
    minWidth : "130px"
  }
}));

let refs = [];

const GridView = (props : Props)=>{
  const classes = useStyle();
  const {selectedContent, selectedClass,ref,routeChange, ...rest} = props;
  let {docsList} = props;
  const [open, setOpen] = useState(false);
  const [listIdx, setListIdx] = useState(0);
  const itemList = ["삭제","무언가"];
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

  const handleMenuItemClick = (
    index: number,
  ) => {
    switch (index) {
      case 0 : { //삭제
        const docName = docsList[listIdx].doc_name;
        const userId = firebase.auth().currentUser.email;

        docsList.splice(listIdx, 1);

        const db = firebase.firestore();
        db.collection(userId)
        .doc(docName)
        .update({
          dateDeleted : Date.now(),
        })

        setOpen(false);

        dispatch(setDocsNum(docsList.length));

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

  const setRefs = (ref) => {
    refs.push(ref)
  }

  return (
    <React.Fragment>
      {docsList.map((el, idx) => {
        let times = new Date(el.last_modified.seconds*1000);
        let category = el.category == "Unshelved" ? "" : el.category;
        return (
          <React.Fragment key={idx}>
            <div key={idx} className="contentItem"   >
              <div style={{backgroundImage:`url(${el.thumb_path})`}} onClick={() => routeChange(el.key)}/>
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
              {selectedContent === idx ? (<div className={selectedClass}/>) : ""}

              <Grow in={true} >
                <div className={classes.removeBtn} ref={setRefs}>
                  <IconButton onClick={() => handleMenuListClick(idx)}><MoreVert/></IconButton>
                </div>
              </Grow>

            </div>

        </React.Fragment>
        )
        })} 
        <Popper open={open} anchorEl={refs[listIdx]} role={undefined} transition disablePortal>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu">
                    {itemList.map((item, index) => (
                      <MenuItem
                        className={classes.menuItem}
                        key={item}
                        // selected={index === selectedIndex}
                        onClick={() => handleMenuItemClick(index)}
                      >
                        {item}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
    </React.Fragment>
    );
}


export default GridView;