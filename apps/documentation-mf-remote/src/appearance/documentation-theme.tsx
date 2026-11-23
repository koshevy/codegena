import { CodegenaDarkTheme, CodegenaLightTheme } from '@codegena/ui-theme';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import type { ReactElement, ReactNode } from 'react';

import { DocumentationThemeStyles } from './documentation-theme.styles';
import { useDocumentationColorMode } from './use-documentation-color-mode';
import { documentationRootClassName } from '../../documentation-root-class.mjs';
import { useArticleAnchorNavigation } from '../navigation';

export function DocumentationTheme({ children }: { children: ReactNode }): ReactElement {
  const colorMode = useDocumentationColorMode();
  const handleAnchorClick = useArticleAnchorNavigation();
  const theme = colorMode === 'dark' ? CodegenaDarkTheme : CodegenaLightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DocumentationThemeStyles
        className={documentationRootClassName}
        onClick={handleAnchorClick}
      >
        {children}
      </DocumentationThemeStyles>
    </ThemeProvider>
  );
}
