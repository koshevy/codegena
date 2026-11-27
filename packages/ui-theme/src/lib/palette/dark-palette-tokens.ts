import { PaletteOptions } from '@mui/material/styles';

import type { NeutralScale, SemanticColorTokens } from './palette-types';

export const darkNeutral = {
  50: '#12151a',
  100: '#181c22',
  200: '#262b34',
  300: '#323844',
  400: '#4a5362',
  500: '#626b78',
  600: '#787e88',
  800: '#b6c1cd',
  900: '#eef1f4',
} as const satisfies NeutralScale;

export const darkSurfaces = {
  canvas: '#12151a',
  paper: '#181c22',
  editor: '#1e232b',
  toolbar: '#161a20',
  menu: '#1a1f27',
  skeletonShimmer: '#363c48',
} as const;

export const darkFocus = {
  main: '#6a9ee0',
  ring: '#4a7cc9',
} as const;

const darkPrimaryColor: SemanticColorTokens = {
  light: '#4a7cc9',
  main: '#6a9ee0',
  dark: '#8abff4',
  onLight: '#4a7cc9',
  lightSurface: '#8abff4',
  contrastText: '#0d0e10',
  surface: '#1a2940',
  border: '#2f4f7a',
  text: '#9ec5f5',
};

const darkSecondaryColor: SemanticColorTokens = {
  light: '#774e91',
  main: '#9b7bb5',
  dark: '#d4b3ff',
  onLight: '#774e91',
  lightSurface: '#d4b3ff',
  contrastText: '#0d0e10',
  surface: '#2a2236',
  border: '#5c3f72',
  text: '#d4b3ff',
};

const darkSuccessColor: SemanticColorTokens = {
  light: '#7c9f1b',
  main: '#96b93a',
  dark: '#c0d573',
  onLight: '#7c9f1b',
  lightSurface: '#c0d573',
  contrastText: '#0d0e10',
  surface: '#232a18',
  border: '#4a5f1f',
  text: '#b8d47a',
};

const darkInfoColor: SemanticColorTokens = {
  light: '#31a3a1',
  main: '#45b5b3',
  dark: '#82c9c9',
  onLight: '#31a3a1',
  lightSurface: '#82c9c9',
  contrastText: '#0d0e10',
  surface: '#162828',
  border: '#2a6664',
  text: '#7dd4d2',
};

const darkWarningColor: SemanticColorTokens = {
  light: '#c98a10',
  main: '#e5a832',
  dark: '#ffc966',
  onLight: '#c98a10',
  lightSurface: '#ffc966',
  contrastText: '#0d0e10',
  surface: '#2a2210',
  border: '#7a6018',
  text: '#ffc966',
};

const darkErrorColor: SemanticColorTokens = {
  light: '#ca333a',
  main: '#e6555b',
  dark: '#e89a9e',
  onLight: '#ca333a',
  lightSurface: '#e89a9e',
  contrastText: '#0d0e10',
  surface: '#2d1a1c',
  border: '#8f3a3f',
  text: '#f0a0a4',
};

export const darkThemePalette: PaletteOptions = {
  action: {
    active: darkPrimaryColor.border,
    activatedOpacity: 0.2,
    disabled: darkNeutral[500],
    hover: darkPrimaryColor.surface,
    hoverOpacity: 0.25,
    selected: '#243550',
    selectedOpacity: 0.2,
  },
  background: {
    default: darkSurfaces.canvas,
    paper: darkSurfaces.paper,
  },
  common: {
    black: '#000000',
    white: '#ffffff',
  },
  divider: darkNeutral[200],
  error: darkErrorColor,
  focus: darkFocus,
  info: darkInfoColor,
  mode: 'dark',
  neutral: darkNeutral,
  primary: darkPrimaryColor,
  secondary: darkSecondaryColor,
  success: darkSuccessColor,
  text: {
    primary: darkNeutral[900],
    secondary: darkNeutral[800],
    disabled: darkNeutral[600],
  },
  warning: darkWarningColor,
  codegena: {
    accent: {
      border: darkSecondaryColor.border,
      main: darkSecondaryColor.main,
      surface: darkSecondaryColor.surface,
      text: darkSecondaryColor.text,
    },
    background: {
      editor: darkSurfaces.editor,
      menu: darkSurfaces.menu,
      skeletonFigure: darkNeutral[300],
      skeletonShimmer: darkSurfaces.skeletonShimmer,
      toolbar: darkSurfaces.toolbar,
    },
    typography: {
      editor: darkNeutral[900],
      editorPlaceholder: darkNeutral[400],
      menu: darkNeutral[900],
      toolbar: darkNeutral[800],
    },
  },
};
