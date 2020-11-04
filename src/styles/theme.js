import { createMuiTheme } from '@material-ui/core';
import Colors from '../styles/colors.scss';

import { koKR } from '@material-ui/core/locale';
// import { Button, Typography } from "@material-ui/core";


export const theme = createMuiTheme({
  palette: {
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
  },
  // drawer 폭, 넓이
  props: {
    drawerWidth: 200,
  },

  typography: {
    useNextVariants: true,
    fontFamily: '"Noto Sans KR"'
  },
}, koKR);

