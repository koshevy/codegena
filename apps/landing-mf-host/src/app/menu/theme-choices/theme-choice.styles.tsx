import { alpha, styled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';

// language=postcss
export const ThemeChoiceStyles = styled(ToggleButton)(({ theme }) => `
  & {
    border: 0;
    color: ${theme.palette.text.primary};
    font-size: 1.25rem;
    font-weight: 300;
    gap: 0.75rem;
    justify-content: flex-start;
    min-width: 12rem;
    padding: 0.6rem 1rem;
    text-transform: none;
  }

  &.Mui-selected,
  &.Mui-selected:hover,
  &:focus-visible {
    background: ${alpha(theme.palette.primary.main, 0.15)};
    color: ${theme.palette.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.palette.focus.main};
    outline-offset: 2px;
  }
`);
