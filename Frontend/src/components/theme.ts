// src/components/theme.ts
'use client';

import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    // Customizações específicas de componentes se necessário
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Remove uppercase automático dos botões
        },
      },
    },
  },
});

export default theme;
