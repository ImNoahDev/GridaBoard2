import { createMuiTheme } from "@material-ui/core/styles";

export const theme1 = createMuiTheme({
  palette: {
    primary: {
      main: "#0A9DAA",
    },
    secondary: {
      main: "#EC7734",
    },
    error: {
      main: "#ff0000",
    },
    background: {
      paper: "#ffffff",
      default: "#f5f5f5",
    },
    text: {
      primary: "#121212",
      secondary: "#666666",
      disabled: "#aaaaaa",
      hint: "#aaaaaa",
    },
    grey: {
      50: "#ffffff",
      100: "#e9e9e9",
      200: "#cfcfcf",
      300: "#828282",
      400: "#121212",
    },
    action: {
      hover: "rgba(0, 0, 0, 0.03)",
      selected: "rgba(0, 0, 0, 0.10)",
    },
  }
});
