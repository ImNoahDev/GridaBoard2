import React, { createRef } from "react";
import IconButton from "@material-ui/core/IconButton";
import * as Icon from "@material-ui/icons";
import { Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import withWidth, { isWidthDown } from "@material-ui/core/withWidth";
import Slider from "@material-ui/core/Slider";
// import { Select } from "@material-ui/core";
import StrokeGraph from "./StrokeGraph";
import { getStrokesTimeInfo, getTimeStr } from "../StrokeInfo";
// import { cyan500 } from '@material-ui/styles/colors';
import { PLAYSTATE } from "../pageviewer/StorageRenderer";
import { Checkbox } from '@material-ui/core';

const styles = (theme) => ({
  bottom: {
    // marginTop: "auto",
    // position: "absolute",
    bottom: 0,
    // width: "100%",
    // height: 140,
    backgroundColor: theme.palette.background.paper, //default or paper
    zIndex: 1100,
  },
  itembar: {
    display: "flex",
    justifyContent: "center",
    height: 60,
  },
  icon: {
    margin: "auto 0",
    height: 48,
  },

  subheader: {
    textTransform: "capitalize",
  },
  labelStyleOuter: {
    width: "30px",
    height: "30px",
    borderRadius: "50% 50% 50% 0",
    background: "rgba(0,188,212,1)",
    position: "absolute",
    transform: "rotate(-45deg)",
    top: "-40px",
    left: "-9px",
  },
  labelStyleInner: {
    transform: "rotate(45deg)",
    color: "white",
    textAlign: "center",
    position: "relative",
    top: "3px",
    right: "0px",
    fontSize: "10px",
  },
});

class KerisBottom extends React.Component {
  graphRef = createRef();
  containerRef = createRef();
  triggerRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      playTimeRatio: 0,
      slider_range: [0, 0],
      autoStop: this.props.autoStop,
    };

    this.strokesInfo = getStrokesTimeInfo(this.props.strokeStream);

    this.graphSize = null;
    this.stroke_graph = null;
  }

  handleChange = (event, newValue) => {
    console.log(newValue);
    this.setState({ playTimeRatio: newValue });

    let playTime = (newValue * this.strokesInfo.duration) / 100;
    this.props.playTimeHandler(playTime);
  };

  valuetext(value) {
    return `${value}:${value}:${value}°C`;
  }

  zoomIn = () => {
    this.props.zoom(true);
  };

  zoomOut = () => {
    this.props.zoom(false);
  };

  zoomAtWidth = () => {
    this.props.zoomAtWidth(true);
  };

  zoomAtHeight = () => {
    this.props.zoomAtWidth(false);
  };

  replay = () => {
    this.props.playHandler();
  };

  stop = () => {
    this.props.stopHandler();
  };


  rewind = () => {
    this.props.playStateHandler(PLAYSTATE.rewind);
  };

  linkshare = () => {
    this.props.linkshare();
  };

  replaySpeedHandler = () => {
    this.props.replaySpeedHandler();
  };

  translate = () => {
    this.props.translate();
  };

  description = () => {
    this.props.description();
  };

  onPageChanged = (pageid, pages) => {
    let { strokeChunks } = this.props;
    const page = pages.filter((p) => p.pageNumber === pageid)[0];

    if (page) {
      let page_play_start_time = this.stroke_graph.setPage(page, strokeChunks);
      this.props.playTimeHandler(page_play_start_time);
    }
  };

  componentDidMount() {
    this.saveGraphSize();
    // const width = this.graphRef.current.clientWidth;
    // const height = this.graphRef.current.clientHeight;

    // this.graphSize = { width, height };

    this.initGraph();
    // page를 세팅
    const { pageid, pages } = this.props;
    this.onPageChanged(pageid, pages);

    window.addEventListener("resize", this.resizeListener);
  }

  saveGraphSize = () => {
    const width = this.graphRef.current.clientWidth;
    const height = this.graphRef.current.clientHeight;

    this.graphSize = { width: width + 1, height };

    console.log(`WIDTH = ${width}, ${height}`);
  };

  resizeListener = () => {
    this.saveGraphSize();

    console.log(`${this.graphSize.width} x ${this.graphSize.height}`);

    this.stroke_graph.resizeCanvas(this.graphSize);
    const { pageid, pages } = this.props;
    this.onPageChanged(pageid, pages);
  };

  componentWillUnmount() {
    this.stroke_graph = null;
    window.removeEventListener("resize", this.resizeListener);
  }

  initGraph() {
    const { strokeStream } = this.props;

    const stroke_graph = new StrokeGraph("stroke_graph", strokeStream);
    this.stroke_graph = stroke_graph;

    stroke_graph.init(this.graphSize);
  }

  shouldComponentUpdate(nextProps, nextState) {
    let ret_val = true;
    if (nextProps.playTime !== this.props.playTime) {
      this.stroke_graph.setPlayingTime(nextProps.playTime);

      let playRatio = (nextProps.playTime * 100) / this.strokesInfo.duration;
      this.setState({ playTimeRatio: playRatio });
      ret_val = false;
    }

    if (nextProps.pageid !== this.props.pageid) {
      const { pageid, pages } = nextProps;
      this.onPageChanged(pageid, pages);
      ret_val = false;
    }

    if ( nextState.autoStop !== this.state.autoStop ) {
      if ( nextState.autoStop ) this.props.playStateHandler( PLAYSTATE.setAutoStop);
      else this.props.playStateHandler( PLAYSTATE.unsetAutoStop);

      ret_val = false;
    }

    return true;
  }

  getSliderString = (slider_val) => {
    let time_ms = (slider_val * this.strokesInfo.duration) / 100;
    let timeStr = getTimeStr(time_ms, "mm:ss");

    return timeStr;
  };

  handleChangeCheckBox = (event) => {
    this.setState({ ...this.state, [event.target.name]: event.target.checked });
  };

  render() {
    const {
      // strokeStream,
      classes,
      scale,
      replaySpeed,
      caption,
      // playTime,
    } = this.props;

    // const triggerRef = useRef(null);
    // const containerRef = useRef(null);
    let lastStr = getTimeStr(this.strokesInfo.duration, "mm:ss");
    let beginStr = getTimeStr(0, "mm:ss");

    const marks = [
      {
        value: 0,
        label: beginStr,
      },
      {
        value: 100,
        label: lastStr,
      },
    ];

    let withdown = isWidthDown("sm", this.props.width);
    return (
      <div className={classes.bottom}>
        <div className={classes.itembar}>


          <Checkbox checked={this.state.autoStop} onChange={this.handleChangeCheckBox} name="autoStop">
            asdf
          </Checkbox>

          <IconButton className={classes.icon} aria-label="playingTime">
            <Typography> {caption}</Typography>
          </IconButton>

          <IconButton className={classes.icon} aria-label="replaySpeed" onClick={this.replaySpeedHandler} >
            <Typography> {"x " + replaySpeed}</Typography>
          </IconButton>

          <IconButton className={classes.icon} aria-label="ZoomOut" onClick={this.zoomOut} >
            <Icon.Remove />
          </IconButton>

          <Typography variant="button" align="center" style={{ width: 50, margin: "auto 0" }} >
            {scale + "%"}
          </Typography>

          <IconButton className={classes.icon} aria-label="ZoomIn" onClick={this.zoomIn} >
            <Icon.Add />
          </IconButton>

          <IconButton className={classes.icon} onClick={this.zoomAtHeight}>
            <Icon.Fullscreen />
          </IconButton>

          {!withdown && (
            <IconButton className={classes.icon} onClick={this.zoomAtWidth}>
              <Icon.ZoomOutMapRounded />
            </IconButton>
          )}

          <IconButton className={classes.icon} aria-label="Rewind" onClick={this.rewind} >
            <Icon.FirstPage />
          </IconButton>

          <IconButton className={classes.icon} aria-label="Play" onClick={this.replay} >
            {this.props.isPlaying() ? <Icon.Pause /> : <Icon.PlayArrow />}
          </IconButton>

          {/* <IconButton className={classes.icon} aria-label="Play" onClick={this.replay}>
            <Icon.Pause />
          </IconButton> */}

          <IconButton className={classes.icon} aria-label="Stop" onClick={this.stop} >
            <Icon.Stop />
          </IconButton>
        </div>

        <div
          id="slider_container"
          ref={this.containerRef}
          style={{
            paddingRight: 25,
            paddingLeft: 25,
            height: 35,
            width: "100%",
            backgroundColor: "#ffffff",
          }}
        >
          <div
            style={{
              position: "relative",
              top: 10,
              width: "100%",
              height: 35,
              zIndex: 2,
            }}
          >
            <Slider
              step={0.05}
              value={this.state.playTimeRatio}
              onChange={this.handleChange}
              valueLabelDisplay="auto"
              aria-labelledby="continuous-slider"
              getAriaValueText={this.valuetext}
              getAriaLabel={this.getSliderString}
              valueLabelFormat={this.getSliderString}
              ref={this.triggerRef}
              marks={marks}
            />
          </div>

          <div
            style={{
              position: "relative",
              top: -35,
              width: "100%",
              height: 25,
              backgroundColor: "rgba(255,0,0,0.0)",
              zIndex: 1,
            }}
            ref={this.graphRef}
          >
            <canvas id="stroke_graph" />
          </div>
        </div>
      </div>
    );
  }
}

export default withWidth()(withStyles(styles)(KerisBottom));
