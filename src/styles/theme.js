import { createMuiTheme } from '@material-ui/core';
import Colors from '../styles/colors.scss';
import { colors } from '@material-ui/core';
import { koKR } from '@material-ui/core/locale';
// import { Button, Typography } from "@material-ui/core";

const prev_palette = {
  type: 'light',
  primary: {
    main: Colors.primary
  },
  secondary: {
    main: Colors.secondary
  },
  error: {
    main: Colors.error
  },
  warning: {
    main: Colors.warning
  },
  info: {
    main: Colors.info
  },
  success: {
    main: Colors.success
  },
  contrastThreshold: 3,
  tonalOffset: 0.2
};

const palette = {
  myColor: {
    main: colors.blue[500]
  },
  primary: {
    main: "#7D89EF",
  },
  secondary: {
    main: "#B3DDED",
  },
  error: {
    main: "#FF7777",
  },
  warning: {
    main:  "#FFC569",
  },
  info: {
    main: "#65BEFF",
  },
  success: {
    main: "#87C651",
  },
  contrastThreshold: 3,
  tonalOffset: 0.2
};

export const theme = createMuiTheme({
  palette,
  // drawer 폭, 넓이
  props: {
    drawerWidth: 200,
  },

  typography: {
    useNextVariants: true,
    fontFamily: '"Noto Sans KR"'
  },
}, koKR);

