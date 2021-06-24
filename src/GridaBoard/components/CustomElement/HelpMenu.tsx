import React from "react";
import { makeStyles } from "@material-ui/core";
import { showHelpMenu } from '../../store/reducers/ui';
import { store } from "../../client/pages/GridaBoard";
import { useSelector } from 'react-redux';
import { RootState } from "../../store/rootReducer";
import HelpViewer from "../helpMenu"
import Cookies from 'universal-cookie';
export const setHelpMenu = (show: boolean) => {
	showHelpMenu(show);

  if(!show){
    const cookies = new Cookies();
    cookies.set("firstHelp", true, {
      maxAge: 99999999
    });
  }
}
const useStyle = makeStyles(theme=>({
	wrap : {
		width : "100%",
		height: "100%",
		background : "red",
		opacity: "0.5",
		position: "absolute",
		zIndex : 1999,
		// pointerEvents : "none",
	},
  viewer : {
		zIndex : 1999,
  }
}))

//menu의 이동 및 여러 동작들을 할 수 있도록 존재하는 컴포넌트
const HelpMenu = ()=>{
	const inVisible = useSelector((state: RootState) => state.ui.helpMenu.show);
	const classes = useStyle();

	const movePopup = (e:React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
    const div = e.currentTarget;
    div.style.cursor = "grabbing";
    
    const startDivX = div.offsetLeft, startDivY = div.offsetTop;
    const startMouseX = e.clientX, startMouseY = e.clientY;
    div.style.opacity = "0.8";
    const mouseMove = (e)=>{
      const nowMouseX = e.clientX, nowMouseY = e.clientY;
      
      let newLeft = startDivX + (nowMouseX - startMouseX);
      newLeft = newLeft <= 0 ? 0 : newLeft;
      let newRight = (window.innerWidth - (newLeft + div.offsetWidth));
      newRight = newRight <= 0 ? 0 : newRight;
      let newTop = startDivY + (nowMouseY - startMouseY);
      newTop = newTop <= 0 ? 0 : newTop;
      let newBottom = (window.innerHeight - (newTop + div.offsetHeight));
      newBottom = newBottom <= 0 ? 0 : newBottom;
      
      div.style.right = newRight + "px";
      div.style.bottom = newBottom + "px";
    }
    const mouseUp = (e)=>{
      mouseMove(e);
      div.style.cursor = "";
      div.style.opacity = "";
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    }
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);

	}
	return (
	<React.Fragment>
		{inVisible ? 
		(
			<HelpViewer className={classes.viewer} mainNo={1} subNo={1} onHeaderClick={movePopup} setHelpMenu={setHelpMenu}/>
		)
		: ""}
	</React.Fragment>)
}

export default HelpMenu;