import { makeStyles, Grow, IconButton, Checkbox, Fade } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import MoreVert from "@material-ui/icons/MoreVert";
import { getTimeStamp } from "../../../BoardListPageFunc";
import { IBoardData } from "../../../structures/BoardStructures";
import { showDropDown } from 'GridaBoard/store/reducers/listReducer';

interface Props extends  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
   docsList?: Array<any>,
   selectedClass ?: string,
   category?: string,
   selectedItems?: IBoardData[],
   routeChange ?: (idx:number)=>void,
   updateSelectedItems ?: (el: IBoardData, checked: boolean) => void,
}

const useStyle = makeStyles(theme => ({
  moreBtn : {
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

  },
  menuItem : {
    minWidth : "130px"
  }
}));

const GridView = (props : Props)=>{
  const classes = useStyle();
  const {selectedClass, ref, routeChange, category, selectedItems, ...rest} = props;
  const {docsList} = props;

  const [showMoreBtns, setShowMoreBtns] = useState([]);
  const [showCheckBoxes, setShowCheckBoxes] = useState([]);
  const [forcedToShowCheckBoxes, setForcedToShowCheckBoxes] = useState([]);
  const [forcedNotToShowMoreBtns, setForcedNotToShowMoreBtns] = useState(false);

  useEffect(() => {
    showMoreBtns.length = 0;
    showCheckBoxes.length = 0;
    forcedToShowCheckBoxes.length = 0;

    for (let i = 0; i < docsList.length; i++) {
      showMoreBtns.push(false)
      showCheckBoxes.push(false)
      forcedToShowCheckBoxes.push(false);
    }
  }, [docsList.length])
  
  useEffect(() => {
    if (selectedItems.length === docsList.length) { //select all
      const newArr = [...forcedToShowCheckBoxes];
      for (let i = 0; i < newArr.length; i++) {
        newArr[i] = true;
      }
      setShowCheckBoxes(newArr);
      setForcedToShowCheckBoxes(newArr);
    } else if (selectedItems.length === 0) { //deselect all
      const newArr = [...forcedToShowCheckBoxes];
      for (let i = 0; i < newArr.length; i++) {
        newArr[i] = false;
      }
      setShowCheckBoxes(newArr);
      setForcedToShowCheckBoxes(newArr);
      setForcedNotToShowMoreBtns(false);
    }

    if (selectedItems.length > 0) {
      const newArr = [...showMoreBtns];
      for (let i = 0; i < newArr.length; i++) {
        newArr[i] = false;
      }
      setShowMoreBtns(newArr);
      setForcedNotToShowMoreBtns(true);
    }
  }, [selectedItems.length])

  const updateShowBtns = (idx: number, show: boolean) => {
    if (forcedNotToShowMoreBtns === false) {
      const newArr = [...showMoreBtns];
      newArr[idx] = show;
      setShowMoreBtns(newArr);
    }

    if (forcedToShowCheckBoxes[idx] === false) {
      const newArr = [...showCheckBoxes];
      newArr[idx] = show;
      setShowCheckBoxes(newArr);
    }
  }
  
  const isChecked = (keyStr) => {
    for (const selectedItem of selectedItems) {
      if (selectedItem.doc_name === undefined) continue;
      const timestamp = getTimeStamp(selectedItem.created);
      const itemKey = selectedItem.doc_name + '_' + timestamp;
      if (keyStr === itemKey) {
        return true;
      }
    }
    return false;
  }

  const updateSelectedItems = (idx: number, el: IBoardData, checked: boolean) => {
    const newArr = [...forcedToShowCheckBoxes];
    newArr[idx] = checked; 
    setForcedToShowCheckBoxes(newArr);

    props.updateSelectedItems(el, checked);
  }
  return (
    <React.Fragment>
      {docsList.map((el, idx) => {
        const times = new Date(el.last_modified.seconds*1000);
        const category = el.category == "Unshelved" ? "" : el.category;
        const timestamp = getTimeStamp(el.created)
        const keyStr = el.doc_name + '_' + timestamp; 
        return (
          <React.Fragment key={keyStr}>
            <div key={keyStr} className={`contentItem`} onMouseOver={e => updateShowBtns(idx, true)} onMouseLeave={e => updateShowBtns(idx, false)}>
              <div style={{backgroundImage:`url(${el.thumb_path})`}} />
              <div>
                <div>{el.doc_name}</div>
                <div className="contentData">
                  <div>
                    {`${times.getFullYear()}/${times.getMonth()}/${times.getDate()}`}
                  </div>
                  {category === "" ? "" : (<div />)}
                  {category === "" ? "" : (<div>{el.docNumPages} page</div>)}
                </div>
              </div>
              <Grow in={showCheckBoxes[idx]}>
                <div className={classes.selectBtn}>
                  <Checkbox
                    checked={isChecked(keyStr)}
                    color="primary"
                    value={keyStr}
                    onChange={(event) => updateSelectedItems(idx, el, event.target.checked)}
                  />
                </div>
              </Grow>
              <Fade in={showCheckBoxes[idx]} >
              <div className="hover" onClick={() => routeChange(el.key)}/>
              </Fade>
              {selectedItems.includes(el) ? (<div className={selectedClass} />) : ""}
              <Grow in={showMoreBtns[idx]} >
                <div className={classes.moreBtn}>
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