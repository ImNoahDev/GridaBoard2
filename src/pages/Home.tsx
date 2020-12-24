import React, { useState, useRef } from "react";
import { PLAYSTATE, MixedPageView } from "../neosmartpen";
import {  IconButton, makeStyles, createStyles, CssBaseline } from "@material-ui/core";
import '../styles/main.css'
import PUIController from '../components/PUIController';
import { Theme } from '@material-ui/core';
import clsx from 'clsx';
import {  useSelector } from "react-redux";
import { turnOnGlobalKeyShortCut } from "../GridaBoard/GlobalFunctions";
import PersistentDrawerRight, { g_drawerWidth } from "./Drawer";
import MenuIcon from '@material-ui/icons/Menu';
import ButtonLayer from "./ButtonLayer";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex"
    },
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${g_drawerWidth}px)`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: `calc( ${g_drawerWidth}`,
    },
    toolbar: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: `calc(${-g_drawerWidth}`,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'flex-start',
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    },
    hide: {
      display: 'none',
    },
  }),
);


const Home = () => {
  const pageRef: React.RefObject<MixedPageView> = useRef();
  const [num_pens, setNumPens] = useState(0);
  const [pens, setPens] = useState(new Array(0));
  const [isRotate, setRotate] = useState();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(g_drawerWidth);

  const classes = useStyles();

  const pdfUrl = useSelector((state) => {
    console.log(state.pdfInfo);
    return state.pdfInfo.url;
  });
  const pdfFilename = useSelector((state) => {
    console.log(state.pdfInfo);
    return state.pdfInfo.filename;
  });



  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const onDrawerResize = (width) => {
    setDrawerWidth(width);
  }


  const mainStyle = clsx(classes.content, { [classes.contentShift]: drawerOpen, });

  return (
    <div>
      <CssBaseline />
      <PersistentDrawerRight open={drawerOpen} handleDrawerClose={handleDrawerClose} onDrawerResize={onDrawerResize} />
      <nav id="uppernav" className="navbar navbar-light bg-transparent" style={{ float: "left", zIndex:3 }}>
        <a id="grida_board" className="navbar-brand" href="#">Grida board
          <small id="neo_smartpen" className="text-muted">
            <span data-l10n-id="by_neosmart_pen"> by Neo smartpen </span>
          </small>
        </a>
      </nav>



      <main className={clsx(classes.content, { [classes.contentShift]: drawerOpen, })} style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        alignItems: "center",
        zIndex: 1,
      }}>
        <div className={classes.drawerHeader} />


        <ButtonLayer />

        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          right: 0,
          alignItems: "center",
          zIndex: 2,
        }}>
          <MixedPageView pdfUrl={pdfUrl} filename={pdfFilename} pageNo={1} scale={1} playState={PLAYSTATE.live} pens={pens} ref={pageRef} rotation={0} />
        </div>
      </main >
      {/* Drawer 구현 */}
      <IconButton
        style={{ position:"absolute", right:10, top:0, zIndex: 3 }}
        color="inherit"
        aria-label="open drawer"
        edge="end"
        onClick={handleDrawerOpen}
      // className={clsx(drawerOpen && classes.hide)}
      >
        <MenuIcon />
      </IconButton>

    </div >
  );
};


// const mapStateToProps = (state) => {
//   const ret = {
//     fil: state.pdfInfo.filename,
//   };
//   return ret;
// };

// const mapDispatchToProps = (dispatch) => ({
//   increment: () => dispatch(incrementAction()),
//   decrement: () => dispatch(decrementAction())
// });


// export default connect(mapStateToProps)(Home);



declare global {
  interface Window {
    _pui: any;
  }
}

(function (window) {
  const pui = new PUIController('./3_1013_1116_Grida.nproj');

  window._pui = [];
  window._pui.push(pui);
  console.log(window._pui);

  turnOnGlobalKeyShortCut(true);

})(window);


export default Home;
