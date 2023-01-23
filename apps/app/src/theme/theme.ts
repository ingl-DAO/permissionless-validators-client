import { createTheme } from '@mui/material/styles';
import React from 'react';

// thin: 100
// extraLight: 200
// light: 300
// regular: 400
// medium: 500
// semiBold: 600
// bold: 700
// extraBold: 800
// black: 900
// 16px => 1rem

declare module '@mui/material/styles' {
  interface Theme {
    common: {
      line: React.CSSProperties['color'];
      inputBackground: React.CSSProperties['color'];
      adminElement: React.CSSProperties['color'];
      background: React.CSSProperties['color'];
      adminBackground: React.CSSProperties['color'];
      offWhite: React.CSSProperties['color'];
      placeholder: React.CSSProperties['color'];
      label: React.CSSProperties['color'];
      body: React.CSSProperties['color'];
      titleActive: React.CSSProperties['color'];
      dialogBackground: React.CSSProperties['color'];
    };
  }
  interface ThemeOptions {
    common: {
      line: React.CSSProperties['color'];
      inputBackground: React.CSSProperties['color'];
      adminElement: React.CSSProperties['color'];
      background: React.CSSProperties['color'];
      adminBackground: React.CSSProperties['color'];
      offWhite: React.CSSProperties['color'];
      placeholder: React.CSSProperties['color'];
      label: React.CSSProperties['color'];
      body: React.CSSProperties['color'];
      titleActive: React.CSSProperties['color'];
      dialogBackground: React.CSSProperties['color'];
    };
  }
  interface TypographyVariants {
    h1: React.CSSProperties;
    h2: React.CSSProperties;
    h3: React.CSSProperties;
    body1: React.CSSProperties;
    body2: React.CSSProperties;
    caption: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    h1: React.CSSProperties;
    h2: React.CSSProperties;
    h3: React.CSSProperties;
    body1: React.CSSProperties;
    body2: React.CSSProperties;
    caption: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    h1: true;
    h2: true;
    h3: true;
    body1: true;
    body2: true;
    caption: true;
  }
}

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false; // removes the `xs` breakpoint
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true; // adds the `mobile` breakpoint
    tablet: true;
    laptop: true;
    desktop: true;
  }
}

const PRIMARY = '#EF233C';
const LINE = '#28293D';
const SECONDARY = '#0063F7';

const theme = createTheme({
  palette: {
    primary: {
      main: PRIMARY,
    },
    secondary: {
      main: SECONDARY,
    },
    error: {
      main: '#EF233C',
    },
    success: {
      main: '#06C270',
    },
  },
  common: {
    line: LINE,
    inputBackground: '#28293D',
    background: '#1C1C28',
    adminBackground: '#1C1C28',
    adminElement: '#1D1D1D',
    offWhite: '#726F6F',
    placeholder: LINE,
    label: LINE,
    body: '#FFFFFF',
    titleActive: PRIMARY,
    dialogBackground: '#1C1C28',
  },
  typography: {
    fontFamily: ['Space Grotesk', 'Poppins', 'Roboto', 'serif'].join(','),
    h1: {
      fontSize: '3.125rem',
      fontWeight: 700,
      color: 'white',
    },
    h2: {
      fontSize: '4rem',
      fontWeight: 500,
      color: 'white',
    },
    h3: {
      fontSize: '1.5625rem',
      fontWeight: 500,
      color: 'white',
    },
    body1: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: 'white',
    },
    body2: {
      fontSize: '1rem',
      fontWeight: 500,
      color: 'white',
    },
    caption: {
      fontSize: '0.875rem',
      fontWeight: 400,
      color: 'white',
    },
  },
  breakpoints: {
    values: {
      mobile: 0,
      tablet: 768,
      laptop: 992,
      desktop: 1200,
    },
  },
});

export default theme;
