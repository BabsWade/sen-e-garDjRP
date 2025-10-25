import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6ecb63', // vert menthe
    },
    secondary: {
      main: '#fcffb8', // bleu pastel
    },
    background: {
      default: '#f6f8fc', // fond du dashboard
      paper: '#ffffff',
    },
    success: {
      main: '#81c784',
    },
    warning: {
      main: '#ffb74d',
    },
    error: {
      main: '#e57373',
    },
  },
  typography: {
    fontFamily: `'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    h6: { fontWeight: 600 },
    h5: { fontWeight: 700 },
    body1: { fontSize: '0.95rem' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
