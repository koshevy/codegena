import { PaletteOptions } from '@mui/material/styles';

import type { NeutralScale, SemanticColorTokens } from './palette-types';

export const neutral = {
  50: '#f8f9fb',
  100: '#eef1f4',
  200: '#d8dee5',
  300: '#c5ced6',
  400: '#b6c1cd',
  500: '#98a1ac',
  600: '#787e88',
  800: '#434c53',
  900: '#0d0e10',
} as const satisfies NeutralScale;

const paperColor = '#fefefd';
const whiteColor = '#fffffe';

export const surfaces = {
  editor: whiteColor,
  toolbar: whiteColor,
  paper: paperColor,
  menu: paperColor,
  canvas: '#f6f7f9',
  skeletonShimmer: '#e3e8ed',
} as const;

export const focus = {
  main: '#4a7cc9',
  ring: '#8abff4',
} as const;

const primaryColor: SemanticColorTokens = {
  light: '#8abff4',
  main: '#588ad5',
  dark: '#3c4a8f',
  onLight: '#3c4a8f',
  lightSurface: '#8abff4',
  contrastText: '#ffffff',
  surface: '#e8f1fc',
  border: '#b8d4f5',
  text: '#3c4a8f',
};

const secondaryColor: SemanticColorTokens = {
  light: '#d4b3ff',
  main: '#774e91',
  dark: '#62317f',
  onLight: '#62317f',
  lightSurface: '#d4b3ff',
  contrastText: '#ffffff',
  surface: '#f3ebff',
  border: '#d4b3ff',
  text: '#62317f',
};

const successColor: SemanticColorTokens = {
  light: '#c0d573',
  main: '#7c9f1b',
  dark: '#416b00',
  onLight: '#416b00',
  lightSurface: '#c0d573',
  contrastText: '#ffffff',
  surface: '#eef4dc',
  border: '#c0d573',
  text: '#5f7f16',
};

const infoColor: SemanticColorTokens = {
  light: '#82c9c9',
  main: '#31a3a1',
  dark: '#176661',
  onLight: '#176661',
  lightSurface: '#82c9c9',
  contrastText: '#ffffff',
  surface: '#e3f4f4',
  border: '#82c9c9',
  text: '#1f6f6e',
};

const warningColor: SemanticColorTokens = {
  light: '#ffc966',
  main: '#c98a10',
  dark: '#8a5f00',
  onLight: '#8a5f00',
  lightSurface: '#ffc966',
  contrastText: '#3d2e00',
  surface: '#fff4db',
  border: '#ffc966',
  text: '#8a5f00',
};

const errorColor: SemanticColorTokens = {
  light: '#e89a9e',
  main: '#e6555b',
  dark: '#ca333a',
  onLight: '#ca333a',
  lightSurface: '#e89a9e',
  contrastText: '#ffffff',
  surface: '#fdebec',
  border: '#e89a9e',
  text: '#b52b32',
};

/* eslint-disable max-len */
/**
 * Pastel Messenger palette.
 * @see https://color.adobe.com/create/color-wheel?color-palette=BF861E%2C774E91%2C5077C2%2C31A3A2%2C91B326%2CE6555B&color-palette-name=Pastel+Messenger
 */
export const lightThemePalette: PaletteOptions = {
  action: {
    active: primaryColor.main,
    activatedOpacity: 0.15,
    disabled: neutral[400],
    hover: primaryColor.surface,
    hoverOpacity: 0.2,
    selected: '#d6e8fa',
    selectedOpacity: 0.15,
  },
  background: {
    default: surfaces.canvas,
    paper: surfaces.paper,
  },
  common: {
    black: neutral[900],
    white: surfaces.editor,
  },
  divider: neutral[200],
  error: errorColor,
  focus,
  info: infoColor,
  mode: 'light',
  neutral,
  primary: primaryColor,
  secondary: secondaryColor,
  success: successColor,
  text: {
    primary: neutral[900],
    secondary: neutral[800],
    disabled: neutral[500],
  },
  warning: warningColor,
  codegena: {
    accent: {
      border: secondaryColor.border,
      main: secondaryColor.main,
      surface: secondaryColor.surface,
      text: secondaryColor.text,
    },
    background: {
      editor: surfaces.editor,
      menu: surfaces.menu,
      skeletonFigure: neutral[300],
      skeletonShimmer: surfaces.skeletonShimmer,
      toolbar: surfaces.toolbar,
    },
    typography: {
      editor: neutral[900],
      editorPlaceholder: neutral[400],
      menu: neutral[900],
      toolbar: neutral[800],
    },
  },
};
/* eslint-enable max-len */
