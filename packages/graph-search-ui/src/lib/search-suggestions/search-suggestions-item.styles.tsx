import Box from '@mui/material/Box';
import { alpha, lighten, styled } from '@mui/material/styles';

export const searchSuggestionsItemClasses = {
  root: 'SearchSuggestionsItem__root',
  icon: 'SearchSuggestionsItem__icon',
  text: 'SearchSuggestionsItem__text',
  title: 'SearchSuggestionsItem__title',
  wrapTitle: 'SearchSuggestionsItem__wrapTitle',
  description: 'SearchSuggestionsItem__description',
  match: 'SearchSuggestionsItem__match',
};

// language=postcss
export const SearchSuggestionsItemStyles = styled(Box)(({ theme }) => `
  & {
    align-items: start;
    box-sizing: border-box;
    display: grid;
    gap: ${theme.spacing(0.75, 1)};
    grid-template-columns: 1.375rem minmax(0, 1fr);
    min-width: 0;
    padding: 0.5rem;
    width: 100%;
  }

  & .${searchSuggestionsItemClasses.icon} {
    align-items: center;
    background: ${alpha(theme.palette.primary.main, 0.08)};
    border: 1px solid ${alpha(theme.palette.primary.main, 0.12)};
    border-radius: ${theme.shape.borderRadius}px;
    box-sizing: border-box;
    display: flex;
    flex: 0 0 1.375rem;
    height: 1.375rem;
    justify-content: center;
  }

  & .${searchSuggestionsItemClasses.text} {
    min-width: 0;
  }

  & .${searchSuggestionsItemClasses.title} {
    display: block;
    font-weight: ${theme.typography.fontWeightMedium};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .${searchSuggestionsItemClasses.wrapTitle} {
    display: -webkit-box;
    overflow-wrap: anywhere;
    white-space: normal;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  & .${searchSuggestionsItemClasses.description} {
    color: ${theme.palette.text.secondary};
    display: -webkit-box;
    font-size: ${theme.typography.caption.fontSize};
    line-height: 1.35;
    overflow: hidden;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  & .${searchSuggestionsItemClasses.match} {
    background: ${lighten(theme.palette.warning.main, 0.6)};
    border-radius: ${theme.shape.borderRadius}px;
    color: ${theme.palette.warning.contrastText};
  }
`);
