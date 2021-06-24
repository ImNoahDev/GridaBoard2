import React, {useState} from "react";
import {Button, makeStyles} from "@material-ui/core";
import getText, { languageType } from "../../language/language";
import helpData from "./textData.json";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { default as Slider, Settings, CustomArrowProps } from "react-slick";


const useStyle = makeStyles(theme=>({
	wrap : {
		userSelect: "none",
		right : "24px",
		bottom : "88px",
		position: "absolute",
		width: "380px",
		height: "552px",
		overflow: "hidden",
		cursor: "grab",
		
		background: theme.custom.white[90],
		boxShadow : theme.custom.shadows[0],
		borderRadius : "12px"
	},
	slider: {
		minHeight:"320px",
		"& div" : {
			outline: "none"
		},
	},
	sliderImg: {
		display: "flex !important",
		justifyContent: "center"
	},
	content: {
		padding: "24px",
		paddingBottom: "0px",
		"& > div" : {
			position: "relative",
      whiteSpace: "pre-wrap",
		},
		"& > div:first-child":{
			fontFamily : "Roboto",
			fontStyle : "normal",
			fontWeight : "bold",
			fontSize : "14px",
			lineHeight : "16px",
			display : "flex",
			alignItems : "center",
			letterSpacing : "0.25px",
			minHeight: "16px",
			color: theme.palette.primary.main
		},
		"& > div:nth-child(2)": {
			marginTop : "12px",
			fontFamily : "Roboto",
			fontStyle : "normal",
			fontWeight : "bold",
			fontSize : "20px",
			lineHeight : "23px",
			display : "flex",
			alignItems : "center",
			letterSpacing : "0.25px",
			color : theme.palette.text.primary
		},
		"& > div:nth-child(3)" : {
			marginTop : "8px",
			fontFamily : "Roboto",
			fontStyle : "normal",
			fontWeight : "bold",
			fontSize : "14px",
			lineHeight : "16px",
			letterSpacing : "0.25px",
			color : theme.palette.text.secondary
		},
	},
	buttonDiv : {
		position: "absolute",
		right: "24px",
		bottom: "24px",
		"& > *:first-child" : {
			marginRight: "8px"
		}
	},
	buttonStart: {
		"& > *": {
			width: "162px"
		},
	},
	buttonNormal : {
		"& > *": {
			minWidth: "72px"
		},
	}
}));


interface Props extends  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	mainNo : number,
	subNo : number,
	onHeaderClick ?: (ref:React.MouseEvent<HTMLDivElement, MouseEvent>)=>void,
	setHelpMenu: (boolean)=>void
}
//우선 데이터 하나짜리
const HelpViewer = (props : Props)=>{
	const classes = useStyle();
	let myHelpData = helpData[languageType] === undefined? helpData["ko"] : helpData[languageType];
	myHelpData = myHelpData["main" + props.mainNo].sub[props.subNo-1].text;
	const imageUrl = `/helpImg/${languageType}/main${props.mainNo}/sub${props.subNo}`;
	const images = Array.from({length:myHelpData.length}, (el,idx)=>`${imageUrl}/${idx}.png`);
	let slider = null as Slider;
	const [nowView,setNowView] = useState(0);

	const goPrev = (e)=>{
		e.stopPropagation();
		if(nowView == 0){
			//스킵
			props.setHelpMenu(false);
		} 
		slider.slickPrev();
	}
	const goNext = (e)=>{
		e.stopPropagation();
		if(myHelpData[nowView].link !== null){
      window.open("./fileDownload.html?file="+myHelpData[nowView].link);
			slider.slickNext();
		}else if(nowView == myHelpData.length-1){
			props.setHelpMenu(false);
		}else{
			slider.slickNext();
		}
	}
	const stopPropagation = (e)=>{
		e.stopPropagation();
	}

	const sliderSettings : Settings = {
		dots: false,
		infinite: false,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		draggable: false,
		arrows: false,
		// beforeChange: (prev, current) => {
		afterChange: (current) => {
			setNowView(current)
		}
	}

	return (
		<div className={`${classes.wrap} ${props.className}`}/*  onClick={(evt)=>{alert(1)}} */ onMouseDown={props.onHeaderClick} >
			<Slider ref={e=>slider=e} {...sliderSettings} className={classes.slider}>
				{
					images.map((el, idx)=>(
					<div key={idx} className={classes.sliderImg} >
						<img src={el}/>
					</div>
				))}
			</Slider>
			<div className={classes.content}>
				<div>{nowView != 0 ? `${nowView}/${myHelpData.length-1}` : ""}</div>
				<div>{myHelpData[nowView].subtitle}</div>
				<div>{myHelpData[nowView].subtext.replaceAll("\\n","\n")}</div>
			</div>
			<div className={`${classes.buttonDiv} ${nowView == 0 ? classes.buttonStart : classes.buttonNormal}`}> {/* 버튼 */}
				<Button onMouseDown={stopPropagation} onClick={goPrev} variant="contained" color="secondary"> 
					{
						nowView == 0 ? 
							getText("helpMenu_skip")
						: getText("helpMenu_prev")
					}
				</Button>
				<Button onMouseDown={stopPropagation} onClick={goNext} variant="contained" color="primary">
					{
						nowView == 0 ? 
							getText("helpMenu_start")
						: nowView == myHelpData.length-1 ?
							getText("helpMenu_end")
						: myHelpData[nowView].link ? 
							getText("helpMenu_download")
						: getText("helpMenu_next")
					}
				</Button>
			</div>
		</div>
	)
}

export default HelpViewer;