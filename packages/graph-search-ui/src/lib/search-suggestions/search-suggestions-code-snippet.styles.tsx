import { ThemedScrollAreaStyles } from '@codegena/ui-unified/scrolling';
import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

// language=postcss
export const SearchSuggestionsCodeSnippetHostStyles = styled(
  ThemedScrollAreaStyles,
)(() => `
  & {
    grid-column: 1 / -1;
    height: auto;
    max-width: 100%;
  }
`);

export const searchSuggestionsCodeSnippetClasses = {
  active: 'SearchSuggestionsCodeSnippet__active',
  content: 'SearchSuggestionsCodeSnippet__content',
  divider: 'SearchSuggestionsCodeSnippet__divider',
  gutter: 'SearchSuggestionsCodeSnippet__gutter',
  line: 'SearchSuggestionsCodeSnippet__line',
  lineNumber: 'SearchSuggestionsCodeSnippet__lineNumber',
};

// language=postcss
export const SearchSuggestionsCodeSnippetStyles = styled(Box)(({ theme }) => `
  & {
    background: ${alpha(theme.palette.text.primary, 0.04)};
    border-radius: ${theme.shape.borderRadius}px;
    font-family: 'JetBrains Mono', monospace;
    font-size: ${theme.typography.caption.fontSize};
    max-width: 100%;
    overflow: auto hidden;
    padding: ${theme.spacing(0.35, 0)};
  }

  & .${searchSuggestionsCodeSnippetClasses.line} {
    display: flex;
    line-height: 1.3rem;
    min-width: max-content;
    padding: ${theme.spacing(0, 0.5)};
    white-space: pre;
  }

  & .${searchSuggestionsCodeSnippetClasses.active} {
    background: ${alpha(theme.palette.text.primary, 0.1)};
  }

  & .${searchSuggestionsCodeSnippetClasses.gutter} {
    background: ${theme.palette.background.paper};
    display: flex;
    left: 0;
    position: sticky;
    z-index: 1;
  }

  & .${searchSuggestionsCodeSnippetClasses.active}
    .${searchSuggestionsCodeSnippetClasses.gutter} {
    background: color-mix(
      in srgb,
      ${theme.palette.text.primary} 10%,
      ${theme.palette.background.paper}
    );
  }

  & .${searchSuggestionsCodeSnippetClasses.lineNumber} {
    color: ${theme.palette.text.secondary};
    flex: 0 0 3rem;
    text-align: right;
  }

  & .${searchSuggestionsCodeSnippetClasses.divider} {
    color: ${theme.palette.text.secondary};
    margin: ${theme.spacing(0, 0.75)};
  }
`);
