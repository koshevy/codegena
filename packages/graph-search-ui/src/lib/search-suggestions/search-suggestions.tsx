import {
  ThemedScrollAreaStyles,
  useThemedScrollArea,
} from '@codegena/ui-unified/scrolling';
import Paper from '@mui/material/Paper';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import {
  type HTMLAttributes,
  type ReactElement,
  useCallback,
  useContext,
  useRef,
} from 'react';

import {
  SearchSuggestionsTruncationContext,
} from './search-suggestions-truncation-context';

const truncatedResultsMessage = [
  'Only part of found items are shown.',
  'Continue typing to refine result.',
].join(' ');

// language=postcss
const SearchSuggestionsPaper = styled(Paper)(({ theme }) => `
  & {
    background: radial-gradient(
      circle,
      ${alpha(theme.palette.background.paper, 0.8)} 63%,
      ${alpha(theme.palette.background.paper, 0.96)} 90%
    );
    border: 1px solid ${theme.palette.divider};
    border-radius: ${theme.shape.borderRadius * 2}px;
    box-shadow: ${theme.shadows[12]};
    margin-top: ${theme.spacing(1.5)};
    overflow: hidden;
  }

  & .MuiAutocomplete-listbox {
    max-height: calc(100dvh - 6.5rem);
    overflow-y: auto;
    padding: ${theme.spacing(0.5, 0)};
  }

  & .SearchSuggestions__notice {
    border-bottom: 1px solid ${theme.palette.divider};
    color: ${theme.palette.text.secondary};
    display: block;
    padding: ${theme.spacing(1, 1.5)};
  }

  & .MuiAutocomplete-groupLabel {
    background: ${alpha(theme.palette.background.paper, 0.6)};
    color: ${theme.palette.text.secondary};
    font-size: ${theme.typography.overline.fontSize};
    font-weight: ${theme.typography.fontWeightMedium};
    letter-spacing: 0.08em;
    line-height: 2.25rem;
    padding: ${theme.spacing(0, 1)};
    text-transform: uppercase;
  }

  & .MuiAutocomplete-listbox .MuiAutocomplete-option {
    border-radius: 0;
    cursor: pointer;
    padding: 0;
  }

  & .MuiAutocomplete-listbox .MuiAutocomplete-option.Mui-focused,
  & .MuiAutocomplete-listbox .MuiAutocomplete-option[aria-selected='true'],
  & .MuiAutocomplete-listbox .MuiAutocomplete-option:hover:not([aria-disabled='true']),
  & .MuiAutocomplete-listbox .MuiAutocomplete-option:active:not([aria-disabled='true']) {
    background: ${alpha(theme.palette.primary.main, 0.12)};
  }

  & .MuiAutocomplete-option[aria-disabled='true'] {
    cursor: default;
  }
`);

export function SearchSuggestions({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement {
  const isTruncated = useContext(SearchSuggestionsTruncationContext);
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLUListElement>(null);
  const setHostRef = useCallback((host: HTMLDivElement | null): void => {
    hostRef.current = host;
    viewportRef.current = host?.querySelector('ul[role="listbox"]') ?? null;
  }, []);

  useThemedScrollArea(hostRef, viewportRef);

  const renderedNotice = isTruncated && (
    <Typography
      aria-label={truncatedResultsMessage}
      aria-live="polite"
      className="SearchSuggestions__notice"
      role="status"
      variant="caption"
    >
      {truncatedResultsMessage}
    </Typography>
  );

  return (
    <SearchSuggestionsPaper {...props}>
      {renderedNotice}
      <ThemedScrollAreaStyles ref={setHostRef}>
        {children}
      </ThemedScrollAreaStyles>
    </SearchSuggestionsPaper>
  );
}
