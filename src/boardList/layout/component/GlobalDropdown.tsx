import React from 'react';
import { makeStyles, ClickAwayListener, MenuList, Paper, Popper, MenuItem, PopperProps } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'GridaBoard/store/rootReducer';
import { hideDropDown, showGroupDialog, changeGroup, showSnackbar } from 'GridaBoard/store/reducers/listReducer';
import { changeCategorySort, deleteCategory } from '../../BoardListPageFunc2';
import { IBoardData } from 'boardList/structures/BoardStructures';
import getText from 'GridaBoard/language/language';
import { copyBoard, deleteBoardsFromTrash, restoreBoardsFromTrash } from '../../BoardListPageFunc';
import { forceUpdateBoardList } from '../../../GridaBoard/store/reducers/appConfigReducer';
import { store } from 'GridaBoard/client/pages/GridaBoard';

const useStyle = makeStyles(theme => ({
  paper: {
    background: theme.custom.white[90],
    boxShadow: theme.custom.shadows[0],
    borderRadius: '12px',
    width: '240px',
  },
  menuItem: {
    margin: '0 8px',
    height: '40px',

    borderRadius: '8px',

    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: '14px',
    lineHeight: '16px',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.25px',
    '&:hover': {
      background: theme.custom.icon.blue[3],
      color: theme.palette.primary.main,
    },
  },
}));

const openStr = getText('boardList_gridView_menu_open');
const changeNameStr = getText('boardList_gridView_menu_changeName');
const copyStr = getText('boardList_gridView_menu_copy');

const moveUpStr = getText('categoryMenu_moveUp');
const moveDownStr = getText('categoryMenu_moveDown');
const deleteStr = getText('categoryMenu_delete');

const deleteForeverStr = getText('deleteForeverBtn');
const restoreStr = getText('restoreBtn');

const itemData = {
  group: {
    placement: 'bottom-start',
    list: [changeNameStr, moveUpStr, moveDownStr, deleteStr],
    runFunction: {
      0: val => {
        //nameChange
        showGroupDialog({
          type: 'changeGroupName',
          selected: val,
        });
      },
      1: async val => {
        await changeCategorySort(val, 'up', 1);
        changeGroup(true);
      },
      2: async val => {
        await changeCategorySort(val, 'down', 1);
        changeGroup(true);
      },
      3: async val => {
        await deleteCategory(val);
        changeGroup(true);
      },
    },
  },
  docs: {
    placement: 'bottom-start',
    list: [openStr, changeNameStr, copyStr],
    runFunction: {
      0: (val: IBoardData, routeChange) => {
        routeChange(val.key);
      },
      1: (val: IBoardData) => {
        showGroupDialog({
          type: 'changeDocName',
          selected: val,
        });
      },
      2: (val: IBoardData) => {
        copyBoard(val);
      },
    },
  },
  trash: {
    placement: 'bottom-start',
    list: [deleteForeverStr, restoreStr],
    runFunction: {
      0: async (val) => { //완전 삭제
        const result = await deleteBoardsFromTrash([val]);
        if (result) {
          store.dispatch(forceUpdateBoardList());
          showSnackbar({
            snackbarType :"deleteForever",
            selectedDocName: [""],
          });
        }
      },
      1: async (val) => { //복원
        const result = await restoreBoardsFromTrash([val]);
        if (result) {
          store.dispatch(forceUpdateBoardList());
        }
      },
    },
  }
};

type Prop = {
  test?: string;
  open: boolean;
  routeChange?: (idx: number) => void;
};

const GlobalDropdown = (props: Prop) => {
  const { open, routeChange, ...rest } = props;
  const dispatch = useDispatch();

  if (open === false) return null;
  const dropDown = useSelector((state: RootState) => state.list.dropDown);

  const nowItemData = itemData[dropDown.type];

  const targetRef = dropDown.event.target as HTMLElement;
  const classes = useStyle();

  const runEvent = async index => {
    await nowItemData.runFunction[index](dropDown.selected, routeChange);
    hideDropDown();
  };

  return (
    <Popper open={open} anchorEl={targetRef} placement={nowItemData.placement} disablePortal className="test">
      <Paper className={classes.paper}>
        <ClickAwayListener
          onClickAway={() => {
            hideDropDown();
          }}>
          <MenuList>
            {nowItemData.list.map((item, index) => (
              <MenuItem
                key={item}
                onClick={() => {
                  runEvent(index);
                }}
                className={classes.menuItem}>
                {item}
              </MenuItem>
            ))}
          </MenuList>
        </ClickAwayListener>
      </Paper>
    </Popper>
  );
};

export default GlobalDropdown;
