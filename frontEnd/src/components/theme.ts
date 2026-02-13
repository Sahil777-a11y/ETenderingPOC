import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0080BC',
    },
    secondary: {
      main: '#BDBDBD'
    }
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

export default theme;