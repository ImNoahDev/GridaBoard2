import React, { useCallback, useEffect } from 'react';
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { BoxProps, Button } from '@material-ui/core';
import DrawerPages from './DrawerPages';
import { updateDrawerWidth } from '../../../store/reducers/ui';
import { RootState } from '../../../store/rootReducer';
import { useSelector } from "react-redux";
import AddIcon from '@material-ui/icons/Add';
import GridaDoc from '../../GridaDoc';
import { setActivePageNo } from "../../../store/reducers/activePageReducer";
import { scrollToBottom } from "../../../nl-lib/common/util";


// const useStyles_HOME_TSX = makeStyles((theme: Theme) =>
//   createStyles({
//     root: {
//       display: "flex"
//     },
//     appBar: {
//       transition: theme.transitions.create(['margin', 'width'], {
//         easing: theme.transitions.easing.sharp,
//         duration: theme.transitions.duration.leavingScreen,
//       }),
//     },
//     appBarShift: {
//       width: `calc(100% - ${g_drawerWidth}px)`,
//       transition: theme.transitions.create(['margin', 'width'], {
//         easing: theme.transitions.easing.easeOut,
//         duration: theme.transitions.duration.enteringScreen,
//       }),
//       marginRight: `calc( ${g_drawerWidth}`,
//     },
//     toolbar: theme.mixins.toolbar,
//     content: {
//       flexGrow: 1,
//       padding: theme.spacing(3),
//       transition: theme.transitions.create('margin', {
//         easing: theme.transitions.easing.sharp,
//         duration: theme.transitions.duration.leavingScreen,
//       }),
//       marginRight: `calc(${-g_drawerWidth}`,
//     },
//     drawerHeader: {
//       display: 'flex',
//       alignItems: 'center',
//       padding: theme.spacing(0, 1),
//       // necessary for content to be below app bar
//       ...theme.mixins.toolbar,
//       justifyContent: 'flex-start',
//     },
//     contentShift: {
//       transition: theme.transitions.create('margin', {
//         easing: theme.transitions.easing.easeOut,
//         duration: theme.transitions.duration.enteringScreen,
//       }),
//       marginRight: 0,
//     },
//     hide: {
//       display: 'none',
//     },
//   }),
// );


// https://codesandbox.io/s/resizable-drawer-34ife?from-embed=&file=/src/CustomDrawer.js:649-948

const addPageStyle = {
  
} as React.CSSProperties;

const addBlankPage = async (event) => {
  const doc = GridaDoc.getInstance();
  const pageNo = await doc.addBlankPage();
  setActivePageNo(pageNo);
  scrollToBottom("drawer_content");
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'block',
    },
    drawer: {
      flexShrink: 0,
    },
    toolbar: theme.mixins.toolbar,
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    title: {
      flexGrow: 1,
    },
    hide: {
      display: 'none',
    },

    drawerHeader: {
      display: 'block',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'flex-start',
      zIndex: 15000
    },

    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    },
    dragger: {
      width: "5px",
      cursor: "ew-resize",
      padding: "4px 0 0",
      borderTop: "1px solid #ddd",
      position: "absolute",
      top: 0,
      left: 0,
      // right:0,
      bottom: 0,
      zIndex: 100,
      // backgroundColor: "#f4f7f9"
      // backgroundColor: "#ff0000"
    },
    drawerFooter: {
      marginTop: "74vh",
      // marginLeft: "0.8vw",
      background: "rgba(104,143,255,1)",
      // display: 'fii',
      position: "fixed",
      flexDirection: "row",
      alignItems: 'center',
      // padding: "8px 24px",
      // padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      // ...theme.mixins.toolbar,
      justifyContent: 'center',
      boxShadow: "2px 0px 24px rgba(0, 0, 0, 0.15)",
      borderRadius: "60px",
      width: 140,
      height: 40,
      bottom: 24,
      left: 20,
      // marginBottom: "-50vh"
      zIndex: 1100,
    }
  }),
);

const drawerFooter = {
  marginTop: "74vh",
  // marginLeft: "0.8vw",
  background: "rgba(104,143,255,1)",
  // display: 'fii',
  position: "fixed",
  flexDirection: "row",
  alignItems: 'center',
  // padding: "8px 24px",
  // padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  // ...theme.mixins.toolbar,
  justifyContent: 'center',
  boxShadow: "2px 0px 24px rgba(0, 0, 0, 0.15)",
  borderRadius: "60px",
  width: 140,
  height: 40,
  bottom: 24,
  left: 20,
  // marginBottom: "-50vh"
  zIndex: 1100,
} as React.CSSProperties;

const minDrawerWidth = 50;
const maxDrawerWidth = 1000;



interface Props extends BoxProps {
  onDrawerResize: (size: number) => void,
  handleDrawerClose: () => void,
  open: boolean,

  noInfo?:boolean,
}

export default function PersistentDrawerRight(props: Props) {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(props.open);
  // const [handleDrawerClose, setHandleDrawerClose] = React.useState(props.handleDrawerClose);

  // const [drawerWidth, setDrawerWidth] = React.useState(defaultDrawerWidth);
  const drawerWidth = useSelector((state: RootState) => state.ui.drawer.width);
  const setDrawerWidth = (width: number) => updateDrawerWidth({ width });


  useEffect(() => { setOpen(props.open); }, [props.open]);

  const handleMouseDown = e => {
    document.addEventListener("mouseup", handleMouseUp, true);
    document.addEventListener("mousemove", handleMouseMove, true);
  };

  const handleMouseUp = () => {
    document.removeEventListener("mouseup", handleMouseUp, true);
    document.removeEventListener("mousemove", handleMouseMove, true);
  };

  const handleMouseMove = useCallback(e => {
    const newWidth = document.body.offsetWidth - e.clientX;
    // const newWidth = e.clientX - document.body.offsetLeft;
    if (newWidth > minDrawerWidth && newWidth < maxDrawerWidth) {
      setDrawerWidth(newWidth);
      // g_drawerWidth = newWidth;
      // props.onDrawerResize(newWidth);
    }
  }, []);


  return (
    <div style={{float: "left"}}>
      {/* <CssBaseline /> */}

      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        PaperProps={{ style: { width: drawerWidth, flexShrink: 0, zIndex: 1100, marginTop: "121px", height: window.outerHeight - 121, background: "rgba(255, 255, 255, 0.25)", float: "left" } }}
      >
      <div id="drawer_content">
        <div className={classes.drawerHeader}>
          <IconButton onClick={props.handleDrawerClose} style={{float: "right"}}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <div onMouseDown={e => handleMouseDown(e)} className={classes.dragger} />
        < DrawerPages noInfo={props.noInfo} />
        {/* <div > */}
          <Button onClick={(evnet) => addBlankPage(event)} style={drawerFooter}>
            <AddIcon style={{width: "12px", height: "12px", color: "rgba(255,255,255,1)"}}/>
            <span style={{fontSize: "12px", color: "rgba(255,255,255,1)"}}>페이지 추가</span>
          </Button>
        {/* </div> */}
      </div>
      </Drawer>
    </div>
  );
}