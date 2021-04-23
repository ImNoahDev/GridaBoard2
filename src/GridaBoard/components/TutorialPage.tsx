import React, {useState, useEffect} from "react";
import { RootState } from "../store/rootReducer";
import { useSelector } from "react-redux";
import getText, {languageType} from "../language/language";
import { makeStyles, Button } from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import { default as Slider, Settings, CustomArrowProps } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {ArrowBackIos, ArrowForwardIos} from '@material-ui/icons';


const TUTORIAL_COUNT = 3;
const AUTO_PLAY_TIME = 10; // sec

type SliderProps = {
  imgSrcs? : Array<string>
}
type TutorialProps = {
  dontShow?: ()=>void
}

const useStyle = props=> makeStyles(theme => ({
  main : {
    width: "100%",
    height: "100%",
    position: "absolute",
    display:"flex",
    zIndex: 2000,
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(0,0,0,0.8)",
    zoom: 1/props.brZoom,
    "&>div:first-child" : {
      transform: "translateY(-12%)"
    }
  },
  mainSubNew : {
    width : "1219px",
    "& > div:first-child" : {
      display: "flex",
      justifyContent: "center",
      paddingBottom: "40px"
    },
    "& > div:last-child": {
      position:"relative",
      top: "78px",
      display: "flex",
      justifyContent: "center",
    }
  },
  closer : {
    position: "absolute",
    display:"block",
    top: "20px",
    right: "20px",
    // top: "24px",
    // right: "64px",
    color: theme.custom.icon.mono[4],
    cursor: "pointer",

    "&>div" : {
      position: "relative",
      top: "4px",
      right: "44px",
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "14px",
      lineHeight: "16px",
      textAlign: "center",
      letterSpacing: "0.25px",
      textDecorationLine: "underline"
    },
    "&>svg": {
      color : theme.custom.icon.mono[4],
      position: "absolute",
      display:"block",
      top: "0px",
      right: "0px",
    }
  },
  slider: {
    "& div" : {
      outline: "none"
    },
    "& > .slick-arrow": {
      "&:before" : {
        content : "''"
      },
      "& > svg" : {
        color : "#FFFFFF",
        width : "29px",
        height : "29px"
      }
    }
  },
  sliderDot: {
    paddingLeft: "0px",
    "& >  li" : {
      width: "auto !important",
      "& > div" : {
        width: "200px",
        height : "40px",
        position: "relative",
        "& > div:first-child" : {
          color : "#EEEEEE",
          paddingBottom: "10px"
        },
        "& > div:nth-child(2)" : {
          position: "absolute",
          width : "200px",
          height : "2px",
          background : "rgba(255,255,255,0.4)"
        },
        "& > div:nth-child(3)" : {
          position: "absolute",
          width : "200px",
          height : "2px",
          background : "rgba(255,255,255,0.8)",
          transformOrigin: "top left",
        }
      }
    }
  },
  arrows : {
    "&:before" : {
      content: ""
    }
  },
  sliderImg: {
    display: "flex !important",
    justifyContent: "center"
  },
  clear : {
  },
  buttonStyle : {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: "2px 0px 24px rgba(0, 0, 0, 0.15)",
    borderRadius: "60px",
    width: "204px",
    height: "53px",
    "&>span" : {
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontWeight: "bold",
      fontSize: "18px",
      lineHeight: "21px",
      letterSpacing: "0.25px",
    },
    "&:first-child" : {
      marginRight: "15px"
    }
  }
}));


let intervalCount = null as NodeJS.Timeout;
const MySlider = (props: SliderProps)=>{
  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);
  const {imgSrcs } = props;
  const classes = useStyle({brZoom:brZoom})();
  
  let slider = null as any;
  let sliderDot = Array<HTMLDivElement>(imgSrcs.length);
  
  const setDotInterval = (currentDotDiv)=>{
    const now = Date.now();
    clearInterval(intervalCount);
    intervalCount = setInterval(function(start: number){
      let scale = (Date.now() - start)/(AUTO_PLAY_TIME * 1000);
      scale = scale > 1 ? 1 : scale;
      currentDotDiv.style.transform = "scaleX("+scale+")";
    }.bind(null, now, currentDotDiv), 16);
    
    setTimeout(function(iC){
      clearInterval(iC);
    }.bind(null, intervalCount), AUTO_PLAY_TIME*1000)
    return intervalCount;
  }

  const beforeChange = (current, next) => {
    sliderDot.map((el)=>{
      (el.querySelector("div:nth-child(3)") as HTMLDivElement).style.transform = "scaleX(0)";
    })
    const currentDotDiv = sliderDot[next].querySelector("div:nth-child(3)") as HTMLDivElement;

    setDotInterval(currentDotDiv);
  }

  const prevArrow = (<div className={classes.arrows}>
      <ArrowBackIos />
    </div>)
  const nextArrow = (<div className={classes.arrows}>
    <ArrowForwardIos />
    </div>)


  const sliderSettings : Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000 * AUTO_PLAY_TIME,
    pauseOnHover: false,
    pauseOnFocus : false,
    nextArrow: nextArrow,
    prevArrow: prevArrow,
    beforeChange: beforeChange,
    onInit: ()=>{
      // setDotInterval(sliderDot[0].querySelector("div:nth-child(3)") as HTMLDivElement);
    }
  }
  useEffect(() => {
    intervalCount = setDotInterval(sliderDot[0].querySelector("div:nth-child(3)") as HTMLDivElement);
  }, []);
  const mouseOverStop=()=>{
    slider.slickPause();
    clearInterval(intervalCount);
  }
  const mouseUpStart = ()=> {
    if(slider.innerSlider.state.autoplaying == "paused"){
      slider.slickPlay();
      
      intervalCount = setDotInterval(sliderDot[slider.innerSlider.state.currentSlide].querySelector("div:nth-child(3)") as HTMLDivElement);
    }
  }

  return (
    <Slider ref={e=>slider=e} {...sliderSettings} className={classes.slider} 
      appendDots={(dots) => (
        <div
          style={{
            bottom: "-75px",
            padding: "10px"
          }}
        >
          <ul className={classes.sliderDot}> {dots} </ul>
        </div>
      )}
      customPaging={i => (
        <div ref={el=>{return sliderDot[i]=el}}>
          <div></div>
          <div />
          <div style={{transform: "scaleX(0)"}} />
        </div>
      )}>
      {
        imgSrcs.map((el, idx)=>(
          <div key={idx} className={classes.sliderImg}
           onMouseDown={mouseOverStop}
           onMouseUp={mouseUpStart}
           onMouseOut={mouseUpStart}
          >
            <img src={el}/>
          </div>
      ))}
    </Slider>);
}

const TutorialPageNew = (props:TutorialProps) => {
  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);
  const {dontShow, ...rest} = props;
  console.log(brZoom);
  const classes = useStyle({brZoom:brZoom})();

  const imgSrcs = Array.from({length:TUTORIAL_COUNT},(el,idx)=>(`/tutorialImg/${languageType}/tutorial_${idx + 1}_${languageType}.png`))

  const setClose = () => {
    dontShow();
  }

  return (
    <div {...rest} className={classes.main} onClick={(evt)=>{
      evt.preventDefault();
    }}>
      <div className={classes.mainSubNew}>
        <div>
          <img src={`/tutorialImg/${languageType}/tutorial_title_${languageType}.png`} />
        </div>
        <MySlider imgSrcs={imgSrcs}/>
        <div> 
          <Button className={classes.buttonStyle} variant="contained" color="inherit" onClick={function(){window.open("about:blank").location.href="https://store.neosmartpen.com/goods/goods_list.php?cateCd=010007"}}>
            {getText("linkto_buyPen")}
          </Button>
          <Button className={classes.buttonStyle} variant="contained" color="primary" onClick={setClose} >
            {getText("start_grida")}
          </Button>
        </div>
      </div>
      <div className={classes.closer} onClick={setClose}>
        <div>
          {getText("dont_show_day")}
        </div>
        <ClearIcon />
      </div>
    </div>
  );
}

const TutorialPageOld = (props:TutorialProps) => {
  const {dontShow, ...rest} = props;
  const imgName = `/tutorialImg/tutorial_${languageType}.png`;
  const brZoom = useSelector((state: RootState) => state.ui.browser.zoom);
  const classes = useStyle({brZoom:brZoom})();


  const setClose = () => {
    dontShow();
  }


  return (
    <div {...rest} className={classes.main} onClick={(evt)=>{
      evt.preventDefault();
    }}>
      <div>
        <img src={`${imgName}`}  alt=''/>
      </div>
      <div className={classes.closer} onClick={setClose}>
        <div>
          {getText("dont_show_day")}
        </div>
        <ClearIcon />
      </div>
    </div>
  );
}

const TutorialPage =  languageType == "ko" ? TutorialPageNew : TutorialPageOld;



export default TutorialPage;