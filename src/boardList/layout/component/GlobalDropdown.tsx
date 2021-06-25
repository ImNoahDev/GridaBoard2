import React from "react";
import { makeStyles, ClickAwayListener, Grow, MenuList, Paper, Popper, MenuItem, PopperProps } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "GridaBoard/store/rootReducer";
import { hideDropDown, showGroupDialog, changeGroup, showAlert } from 'GridaBoard/store/reducers/listReducer';
import { changeCategorySort, deleteCategory } from "../../BoardListPageFunc2";
import { IBoardData } from "boardList/structures/BoardStructures";
import { forceUpdateBoardList } from "../../../GridaBoard/store/reducers/appConfigReducer";
import getText from "GridaBoard/language/language";
import { copyBoard } from "../../BoardListPageFunc";

const useStyle = makeStyles(theme=>({
  paper : {
    background: theme.custom.white[90],
    boxShadow: theme.custom.shadows[0],
    borderRadius: "12px",
    width: "240px",

  },
  menuItem: {
    margin : "0 8px",
    height: "40px",
    
    borderRadius: "8px",
    
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: "14px",
    lineHeight: "16px",
    display: "flex",
    alignItems: "center",
    letterSpacing: "0.25px",
    "&:hover" : {
      background: theme.custom.icon.blue[3],
      color : theme.palette.primary.main
    }
  }
}))

const openStr = getText("boardList_gridView_menu_open");
const changeNameStr = getText("boardList_gridView_menu_changeName");
const copyStr =  getText("boardList_gridView_menu_copy");

const itemData = {
  "group" : {
    placement : "bottom-start",
    list:["nameChange","moveUp", "moveDown", "delete"],
    runFunction : {
      "nameChange" : (val)=>{
        showGroupDialog({
          type:"changeGroupName",
          selected:val
        })
      },
      "moveUp" : async (val)=>{
        await changeCategorySort(val, "up", 1);
        changeGroup(true);
      },
      "moveDown" : async (val)=>{
        await changeCategorySort(val, "down", 1);
        changeGroup(true);
      },
      "delete" : async (val)=>{
        await deleteCategory(val);
        changeGroup(true);
      }
    }
  },
  "docs" : {
    placement : "bottom-start",
    list:[openStr, changeNameStr, copyStr],
    runFunction : {
      0: (val:IBoardData, routeChange)=>{
        routeChange(val.key);
      },
      1: (val:IBoardData)=>{
        showGroupDialog({
          type:"changeDocName",
          selected: val,
        });
      },
      2: (val:IBoardData)=>{
        copyBoard(val);
      }
    }
  },
};



type Prop = {
  test ?: string,
  open : boolean,
  routeChange ?: (idx:number)=>void
}


const GlobalDropdown = (props: Prop) => {
  const {open, routeChange, ...rest} = props;
  const dispatch = useDispatch();

  if(open === false) return null;
  const dropDown = useSelector((state: RootState) => state.list.dropDown);

  const nowItemData = itemData[dropDown.type];
  
  const targetRef = dropDown.event.target as HTMLElement;
  const classes = useStyle();
  
  const runEvent = async (index)=>{
    const type = dropDown.type;

    await nowItemData.runFunction[index](dropDown.selected, routeChange);

    hideDropDown();
  }

  return (
    <Popper open={open} anchorEl={targetRef} placement={nowItemData.placement} disablePortal className="test">
      <Paper className={classes.paper}>
        <ClickAwayListener onClickAway={()=>{hideDropDown()}}>
          <MenuList>
            {nowItemData.list.map((item, index) => (
              <MenuItem
                key={item}
                onClick={() => {runEvent(index)}}
                className={classes.menuItem}
              >
                {item}
              </MenuItem>
            ))}
          </MenuList>
        </ClickAwayListener>
      </Paper> 
    </Popper>);
}

export default GlobalDropdown;