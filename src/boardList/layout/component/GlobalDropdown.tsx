import React from "react";
import { makeStyles, ClickAwayListener, Grow, MenuList, Paper, Popper, MenuItem, PopperProps } from "@material-ui/core";
import { useSelector } from "react-redux";
import { RootState } from "GridaBoard/store/rootReducer";
import { hideDropDown, showGroupDialog, changeGroup, showAlert } from 'GridaBoard/store/reducers/listReducer';
import { changeCategorySort, deleteCategory } from "../../BoardListPageFunc2";
import { IBoardData } from "boardList/structures/BoardStructures";

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
    list:["nameChange","move", "delete"],
    runFunction : {
      "nameChange":(val:IBoardData)=>{
        showGroupDialog({
          type:"changeDocName",
          selected:val
        })
      },
      "move" : (val:IBoardData)=>{
        showGroupDialog({
          type:"moveDoc",
          selected: [val],
        });
      },
      "delete": (val:IBoardData)=>{
        showAlert({
          type:"deleteDoc",
          selected:val
        });
      }
    }
  },
};



type Prop = {
  test ?: string,
  open : boolean
}


const GlobalDropdown = (props: Prop) => {
  const {open, ...rest} = props;
  if(open === false) return null;
  const dropDown = useSelector((state: RootState) => state.list.dropDown);

  let nowItemData = itemData[dropDown.type];
  
  const targetRef = dropDown.event.target as HTMLElement;
  const classes = useStyle();
  
  console.log(dropDown.selected);
  const runEvent = (item)=>{
    const type = dropDown.type;

    nowItemData.runFunction[item](dropDown.selected);
    hideDropDown();
  }

  return (
    <Popper open={open} anchorEl={targetRef} placement={nowItemData.placement} disablePortal className="test">
      <Paper className={classes.paper}>
        <ClickAwayListener onClickAway={()=>{hideDropDown()}}>
          <MenuList>
            {nowItemData.list.map(item => (
              <MenuItem
                key={item}
                onClick={() => {runEvent(item)}}
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