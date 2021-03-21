// import Colors from '../styles/colors.scss';
import { colors } from '@material-ui/core';
import { koKR } from '@material-ui/core/locale';
import { createMuiTheme, useMediaQuery } from '@material-ui/core';

// const prev_palette = {
//   type: 'light',
//   primary: {
//     main: Colors.primary
//   },
//   secondary: {
//     main: Colors.secondary
//   },
//   error: {
//     main: Colors.error
//   },
//   warning: {
//     main: Colors.warning
//   },
//   info: {
//     main: Colors.info
//   },
//   success: {
//     main: Colors.success
//   },
//   contrastThreshold: 3,
//   tonalOffset: 0.2
// };

const palette = {
  myColor: {
    main: colors.blue[500]
  },
  primary: {
    // main: colors.blue[500]
    main: "#4791db",
  },
  secondary: {
    main: "#e33371",
  },
  error: {
    main: "#e57373",
  },
  warning: {
    main: "#ffb74d",
  },
  info: {
    main: "#64b5f6",
  },
  success: {
    main: "#81c784",
  },

  contrastThreshold: 3,
  tonalOffset: 0.2
};

// const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
// const theme = React.useMemo(
//   () =>
//     createMuiTheme({
//       palette: {
//         type: prefersDarkMode ? 'dark' : 'light',
//       },
//     }),
//   [prefersDarkMode],
// );


export const theme = createMuiTheme({
  // palette,

  // drawer 폭, 넓이
  props: {
    drawerWidth: 200,
    MuiTypography: {
      variantMapping: {
        h1: 'h2',
        h2: 'h2',
        h3: 'h2',
        h4: 'h2',
        h5: 'h2',
        h6: 'h2',
        subtitle1: 'h6',
        subtitle2: 'h2',
        body1: 'span',
        body2: 'span',
      },
    },
  },

  palette: {
    neutral: {
      main: '#5c6ac4',
    },
  },

  zIndex: {
    drawer: 1000,
  },

  typography: {
    useNextVariants: true,
    // fontFamily: '"Noto Sans KR"'
  },
}, koKR);

