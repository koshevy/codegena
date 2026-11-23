import { createTheme } from '@mui/material/styles';

import { darkThemePalette } from '../palette';
import { defaultThemeOptions } from './theme-options';
import { defaultTypography } from './typography';

export const CodegenaDarkTheme = createTheme({
  palette: darkThemePalette,
  typography: defaultTypography,
  ...defaultThemeOptions,
});

export default CodegenaDarkTheme;
