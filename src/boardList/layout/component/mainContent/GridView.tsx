import { makeStyles, Grow, IconButton, Checkbox } from "@material-ui/core";
import React from "react";
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

  return (
    <React.Fragment>
      {docsList.map((el, idx) => {
        let times = new Date(el.last_modified.seconds*1000);
        let category = el.category == "Unshelved" ? "" : el.category;
        const timestamp = getTimeStamp(el.created)
        const keyStr = el.doc_name + '_' + timestamp; 
        return (
          <React.Fragment key={keyStr}>
            <div key={keyStr} className={`contentItem`}>
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
              <div className={classes.selectBtn}>
                <Checkbox
                  checked={isChecked(keyStr)}
                  color="primary"
                  value={keyStr}
                  onChange={(event) => props.updateSelectedItems(el, event.target.checked)}
                />
              </div>
              {/* {selectedContent === idx ? (<div className={selectedClass}/>) : ""} */}
              <Grow in={true} >
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