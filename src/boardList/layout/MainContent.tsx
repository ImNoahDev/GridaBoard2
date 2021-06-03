import { Checkbox, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import getText from "GridaBoard/language/language";
import MainNavSelector from "./component/mainContent/MainNavSelector";
import MainNewButton from "./component/mainContent/MainNewButton";
import MainTrashButton from "./component/mainContent/MainTrashButton";
import GridView from "./component/mainContent/GridView"
import ListView from './component/mainContent/ListView';
import { forceUpdateBoardList } from '../../GridaBoard/store/reducers/appConfigReducer';

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
    "& > div:last-child" : {
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
    }
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
  const [selectedContent, setSelectedContent] = useState(-1);
  const [orderBy, setOrderBy] = useState(0);
  const [listType, setListType] = useState("grid" as ( "grid" | "list"));
  const classes = useStyle();
  
  const selectedCategory = category[selected];
  let nowDocs = [];
  let title = "";
  let contentRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(()=>{
    contentRef.current.scrollTop = 0;
    setOrderBy(0);
  },[props.selected])

  
  const orderFunctionList = [
    (a,b)=>b.last_modified.seconds - a.last_modified.seconds,
    (a,b)=>b.doc_name - a.doc_name
  ];
  
  if(["recent", "trash"].includes(selected)){
    title = getText("boardList_" + selected);
    if(selected === "recent"){
      nowDocs = docs.filter(el=>el.dateDeleted === 0);
    }else{
      nowDocs = docs.filter(el=>el.dateDeleted !== 0);
    }
  }else{
    if(selectedCategory[0] === "Unshelved"){
      nowDocs = docs.filter(el=> {
        return el.category == selected && el.dateDeleted === 0
      });
      title = getText("boardList_unshelved").replace("%d", nowDocs.length.toString());
    }else{
      nowDocs = docs.filter(el=> {
        return el.category === selected && el.dateDeleted === 0;
      });
      title = `${selectedCategory[0]} (${nowDocs.length})`;
    }
  }
  nowDocs.sort(orderFunctionList[orderBy]);
  
  const listOrderChange = (event)=>{
    setOrderBy(event.target.value);
  }
  const listViewType = (val)=>{
    setListType(val);
  } 

  return (<div className={classes.wrap}>
    <div className={classes.header}>
      <div className={classes.title}>
        {title}
      </div>
      {selected === 'trash'? <MainTrashButton /> :<MainNewButton />}
    </div>
    <div className={classes.nav}>
      <div>
        <Checkbox color="primary"/>{getText("word_select").replace("%d", "0")}
      </div>
      <MainNavSelector orderBy={orderBy} listOrderChange={listOrderChange} listViewType={listViewType}/>
    </div>
    <div className={classes.gridContent} ref={contentRef}>
      {listType === "grid" ? 
      (<GridView docsList={nowDocs} selectedContent={selectedContent} selectedClass={classes.selected} routeChange={routeChange} />)
    : (<ListView docsList={nowDocs} selectedContent={selectedContent} selectedClass={classes.selected}/>)}
      
    </div>
  </div>);
}

export default MainContent;