import { CodegenaDarkTheme, CodegenaLightTheme } from '@codegena/ui-theme';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import type { Preview } from '@storybook/react-vite';

export const codegenaStorybookPreview = {
  decorators: [
    (Story, context) => {
      const theme = context.parameters['codegenaTheme'] === 'dark'
        ? CodegenaDarkTheme
        : CodegenaLightTheme;

      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles
            styles={{
              'html': { margin: 0, padding: 0 },
              'body': {
                backgroundColor: theme.palette.background.paper,
                margin: 0,
                padding: 0,
              },
              '#storybook-root': { margin: 0, padding: 0 },
            }}
          />
          <Story />
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    layout: 'fullscreen',
    options: { showPanel: false },
  },
} satisfies Preview;
