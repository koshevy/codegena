import { ThemeOptions } from '@mui/material';

export const fontFamilies = {
  display: '"Golos Text", "Roboto", "Helvetica", "Arial", sans-serif',
  mono: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
  text: '"Golos Text", "Roboto", "Helvetica", "Arial", sans-serif',
  ui: '"Golos Text", "Roboto", "Helvetica", "Arial", sans-serif',
};

export const defaultTypography: ThemeOptions['typography'] = () => ({
  htmlFontSize: 16,
  fontFamily: fontFamilies.ui,
  fontWeightBold: 550,
  fontWeightMedium: 450,
  fontWeightRegular: 400,
  fontWeightLight: 300,
  h1: {
    fontFamily: fontFamilies.display,
    fontWeight: 500,
    fontSize: '2.625rem',
    lineHeight: '3.25rem',
  },
  h2: {
    fontFamily: fontFamilies.display,
    fontWeight: 400,
    fontSize: '2.25rem',
    lineHeight: '2.75rem',
  },
  h3: {
    fontFamily: fontFamilies.display,
    fontWeight: 400,
    fontSize: '1.75rem',
    lineHeight: '2.25rem',
  },
  h4: {
    fontFamily: fontFamilies.display,
    fontWeight: 400,
    fontSize: '1.5rem',
    lineHeight: '2rem',
  },
  h5: {
    fontFamily: fontFamilies.display,
    fontWeight: 400,
    fontSize: '1.375rem',
    lineHeight: '1.875rem',
  },
  h6: {
    fontFamily: fontFamilies.display,
    fontWeight: 400,
    fontSize: '1.125rem',
    lineHeight: '1.625rem',
  },
  body1: {
    fontSize: '0.91rem',
    lineHeight: '1.375rem',
    fontWeight: 300,
  },
  body2: {
    fontSize: '0.9rem',
    lineHeight: '1.375rem',
  },
  subtitle1: {
    fontSize: '1.0625rem',
    lineHeight: '1.5rem',
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: '1rem',
    lineHeight: '1.375rem',
    fontWeight: 400,
  },
  overline: {
    fontSize: '0.8125rem',
    lineHeight: '1.125rem',
    textTransform: 'initial',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
  },
  button: {
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    textTransform: 'none',
  },
  codegenaMessage: {
    fontSize: '0.9rem',
    lineHeight: '1.35rem',
    fontWeight: 400,
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
  },
  codegenaRichTextToolbarMenu: {
    fontWeight: 300,
    fontSize: '0.85rem',
    lineHeight: '1.2rem',
  },
});
