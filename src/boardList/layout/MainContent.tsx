import { Button, Checkbox, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import getText from "GridaBoard/language/language";
import MainNavSelector from "./component/mainContent/MainNavSelector";
import MainNewButton from "./component/mainContent/MainNewButton";
import MainTrashButton from "./component/mainContent/MainTrashButton";
import GridView from "./component/mainContent/GridView"
import ListView from './component/mainContent/ListView';
import { forceUpdateBoardList } from '../../GridaBoard/store/reducers/appConfigReducer';
import { DeleteOutline, Restore } from '@material-ui/icons';
import { IBoardData } from '../structures/BoardStructures';
import { deleteBoardFromLive, deleteBoardsFromTrash, restoreBoardsFromTrash } from '../BoardListPageFunc';
import { useDispatch } from 'react-redux';

const useStyle = makeStyles(theme =>({
  wrap : {
    padding: "32px",
    display:"flex",
    position: "relative",
    flexDirection: "column",
    width: "100%"
  },
  header : {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom : "86px"
  },
  title : {
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: "bold",
    fontSize: "32px",
    lineHeight: "37px",
    letterSpacing: "0.25px",
  },
  nav : {
    position: "relative",
    display: "flex",
    width: "100%",
    minHeight : "40px",
    marginBottom: "24px",
    justifyContent: "space-between",
    alignItems: "center",
    "& > div:first-child" : {
      display: "flex",
      alignItems: "center",
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "0.25px",
      color : theme.palette.text.secondary
    },
    "& > .listNav" : {
      display: "flex",
      "& > div:first-child" : {
        marginRight: "24px"
      },
      "& > *:nth-child(2)":{
        "& > *" : {
          color: theme.custom.icon.mono[0],
          width: "40px",
          height  : "40px",
          marginLeft: "8px"
        },
        "& > *:first-child":{
          marginLeft: "0px"
        },
        "& > *:last-child":{
        },
      },
    },
  },
  checkedNav: {
    "& .checkedNav" :{
      "& > button" : {
        padding: "8px",
        paddingLeft : "11px",
        marginLeft : "8px",
        color : theme.palette.text.secondary,
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontWeight: "normal",
        fontSize: "12px",
        lineHeight: "14px",
        alignItems: "center",
        letterSpacing: "0.25px",
        "& > span:first-child > span" : {
          marginLeft : "4px",
        },
        "&:first-child" : {
          marginLeft: "0px"
        },
        "&:hover": {
          color: theme.palette.action.hover,
          fontWeight: 400
        }
      }

    }
  },
  trashNav : {
    position: "relative",
    display: "flex",
    width: "100%",
    minHeight : "40px",
    marginBottom: "24px",
    justifyContent: "space-between",
    alignItems: "center",
    "& > div:first-child" : {
      display: "flex",
      alignItems: "center",
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "14px",
      lineHeight: "16px",
      letterSpacing: "0.25px",
      color : theme.palette.text.secondary
    },
  },
  gridContent : {
    position:"relative",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 246px)",
    gap: "24px",
    maxHeight : "calc(100% - 190px)",
    overflow: "hidden",
    overflowY : "auto",
    "& > .contentItem" : {
      position:"relative",
      display: "flex",
      flexDirection : "column",
      width : "246px",
      height: "196px",
      border : `1px solid ${theme.custom.icon.mono[2]}`,
      "& > div:first-child": {
        width: "244px",
        height: "135px",
        backgroundSize: "cover",
        backgroundPositionY: "center",
        backgroundPositionX: "center",
      },
      "& > div:nth-child(2)" : {
        flex : 1,
        padding : "12px 11px 11px",
        "& > div:first-child" : {
          width: "211px",
          height: "19px",
          fontFamily: "Roboto",
          fontStyle: "normal",
          fontWeight: "normal",
          fontSize: "16px",
          lineHeight: "19px",
          /* identical to box height */
          letterSpacing: "0.25px",
          overflow: "hidden !important",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }
      },
      "& .contentData" : {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        "&>div:nth-child(1)" :{
          fontFamily: "Roboto",
          fontStyle: "normal",
          fontWeight: "normal",
          fontSize: "11px",
          lineHeight: "13px",
          /* identical to box height */
          
          letterSpacing: "0.25px",
          
          /* White/text/secondary */
          
          color: theme.palette.text.secondary,
        },
        "&>div:nth-child(2)" :{
          width: "2px",
          height: "2px",
          background: theme.custom.icon.mono[2],
          margin : "5px"
        },
        "&>div:nth-child(3)" :{
          fontFamily: "Roboto",
          fontStyle: "normal",
          fontWeight: "normal",
          fontSize: "11px",
          lineHeight: "13px",
    
          letterSpacing: "0.25px",
    
          color: theme.palette.text.secondary,
    
        }
      }
    }
  },
  selected : {
    position:"absolute",
    width: "100%",
    height: "100%",
    border: `2px solid ${theme.palette.primary.main}`,
    pointerEvents: "none",
  },
  buttonStyle : {
    width: "93px",
    height: "40px",
    radius: "4px",
    padding: "8px",
    "&:hover" : {
      cursor : "pointer !important",
    },
  },
  buttonFontStyle: {
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "14.06px",
    fontSize: "12px",
    letterSpacing: "0.25px",
    color : theme.palette.text.secondary,
    "&:hover": {
      color: theme.palette.action.hover,
      fontWeight: 400
    }
  },
}))

interface Props extends  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  test ?: string
  selected ?: string
  category ?: Object
  docs ?: Array<any>

  routeChange ?: (idx:number)=>void
}

const MainContent = (props : Props)=>{
  const {category, selected, docs, routeChange, ...rest} = props;
  const [orderBy, setOrderBy] = useState(0);
  const [listType, setListType] = useState("grid" as ( "grid" | "list"));
  const [selectedItems, setSelectedItems] = useState([]);
  const [nowDocs, setNowDocs] = useState([]);
  const [allItemsChecked, setAllItemsChecked] = useState(false);
  
  const classes = useStyle();
  const dispatch = useDispatch();

  const selectedCategory = category[selected];
  let title = "";
  let contentRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(()=>{
    contentRef.current.scrollTop = 0;
    setOrderBy(0);
    
    setSelectedItems([]);
    setAllItemsChecked(false);
  },[props.selected])

  useEffect(() => {
    const tmpDocs = getNowDocs();
    setNowDocs(tmpDocs);
    setAllItemsChecked(false);
  }, [docs, selected])
  
  const getNowDocs = () => {
    let tmpDocs = [];
    if(["recent", "trash"].includes(selected)){
      title = getText("boardList_" + selected);
      if(selected === "recent"){
        tmpDocs = docs.filter(el=>el.dateDeleted === 0);
      }else{
        tmpDocs = docs.filter(el=>el.dateDeleted !== 0);
      }
    }else{
      if(selectedCategory[0] === "Unshelved"){
        tmpDocs = docs.filter(el=> {
          return el.category == selected && el.dateDeleted === 0
        });
        title = getText("boardList_unshelved").replace("%d", tmpDocs.length.toString());
      }else{
        tmpDocs = docs.filter(el=> {
          return el.category == selected && el.dateDeleted === 0;
        });
        title = `${selectedCategory[0]} (${tmpDocs.length})`;
      }
    }
    tmpDocs.sort(orderFunctionList[orderBy]);
    return tmpDocs;
  }

  const orderFunctionList = [
    (a,b)=>b.last_modified.seconds - a.last_modified.seconds,
    ((a, b) => a.doc_name < b.doc_name ? -1 : a.doc_name > b.doc_name ? 1 : 0)
  ];
  
  const listOrderChange = (event)=>{
    setOrderBy(event.target.value);
  }
  const listViewType = (val)=>{
    setListType(val);
  } 

  const deleteForeverBtnClick = async () => {
    console.log('delete')
    const result = await deleteBoardsFromTrash(selectedItems);
    if (result === 1) {
      dispatch(forceUpdateBoardList()); 
    }
    selectedItems.length = 0;
  }

  const restoreBtnClick = async () => {
    console.log('restore')
    const result = await restoreBoardsFromTrash(selectedItems);
    if (result === 1) {
      dispatch(forceUpdateBoardList()); 
    }
    selectedItems.length = 0;
  }

  const updateSelectedItems = (item: IBoardData, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter(selectedItem => item.key !== selectedItem.key))
    }
  }

  const handleCheckAllBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target
    const tmpDocs = getNowDocs();

    if (checked) {
      setSelectedItems(tmpDocs);
    } else {
      setSelectedItems([]);
    }
    
    setAllItemsChecked(checked);
  }

  return (<div className={classes.wrap}>
    <div className={classes.header}>
      <div className={classes.title}>
        {title}
      </div>
      {selected === 'trash'? <MainTrashButton /> :<MainNewButton />}
    </div>

    {selected !== 'trash' ? 
    (<div className={`${classes.nav} ${classes.checkedNav}`}>
      <div>
        <Checkbox color="primary" checked={allItemsChecked} onChange={(event) => handleCheckAllBoxChange(event)}/>{getText("word_select").replace("%d", "0")}
      </div>
      <MainNavSelector orderBy={orderBy} listOrderChange={listOrderChange} listViewType={listViewType} selectedItems={selectedItems} routeChange={routeChange} />
    </div>)
    :
    (<div className={classes.trashNav}>
      <div>
        <Checkbox color="primary" checked={allItemsChecked} onChange={(event) => handleCheckAllBoxChange(event)}/>{getText("word_select").replace("%d", "0")}
      </div>

      <div>
        <Button className={`${classes.buttonStyle} ${classes.buttonFontStyle}`} onClick={deleteForeverBtnClick}>
            <DeleteOutline/><span>완전 삭제</span>
          </Button> 
        <Button className={`${classes.buttonStyle} ${classes.buttonFontStyle}`} onClick={restoreBtnClick}>
          <Restore style={{width: "28px", height: "24px"}}/><span>복원</span>
        </Button>
      </div>
    </div>)
    }


    <div className={classes.gridContent} ref={contentRef}>
      {listType === "grid" ? 
      (<GridView selectedItems={selectedItems} category={selected} docsList={nowDocs} updateSelectedItems={updateSelectedItems} selectedClass={classes.selected} routeChange={routeChange} />)
    : (<ListView docsList={nowDocs} selectedClass={classes.selected}/>)}
      
    </div>
  </div>);
}

export default MainContent;