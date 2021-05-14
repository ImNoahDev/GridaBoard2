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
    cookies.remove("firstHelp");
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

	const movePopup = (ref)=>{

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