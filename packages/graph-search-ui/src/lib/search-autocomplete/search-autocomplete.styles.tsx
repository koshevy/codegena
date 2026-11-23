import Box from '@mui/material/Box';
import { inputBaseClasses } from '@mui/material/InputBase';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { alpha, styled } from '@mui/material/styles';

export const searchAutocompleteClasses = {
  empty: 'SearchAutocomplete__empty',
};

// language=postcss
export const SearchAutocompleteStyles = styled(Box)(({ theme }) => `
  & {
    position: relative;
    width: 100%;
  }

  .${inputBaseClasses.root} {
    background: ${alpha(theme.palette.background.paper, 0.3)} !important;
    transition: background 0.3s ease-in;
  }

  .${outlinedInputClasses.notchedOutline} {
    &, &:hover {
      border: none;
    }
  }

  & .MuiAutocomplete-input {
    font-weight: ${theme.typography.fontWeightRegular};
  }

  & .${searchAutocompleteClasses.empty} {
    box-shadow: none;
    left: 0;
    position: absolute;
    top: calc(100% + 0.75rem);
    width: 100%;
  }
`);
