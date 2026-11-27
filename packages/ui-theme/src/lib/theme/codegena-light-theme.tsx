import { createTheme } from '@mui/material/styles';

import { lightThemePalette } from '../palette';
import { defaultThemeOptions } from './theme-options';
import { defaultTypography } from './typography';

export const CodegenaLightTheme = createTheme({
  palette: lightThemePalette,
  typography: defaultTypography,
  ...defaultThemeOptions,
});

export default CodegenaLightTheme;
