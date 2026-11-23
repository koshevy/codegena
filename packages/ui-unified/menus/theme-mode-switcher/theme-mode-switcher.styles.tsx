import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';

// language=postcss
export const ThemeModeSwitcherStyles = styled(IconButton)(({ theme }) => `
  & {
    color: ${theme.palette.text.primary};
    flex-shrink: 0;
    height: 2.5rem;
    width: 2.5rem;
  }

  &:hover,
  &:focus-visible {
    background: ${alpha(theme.palette.primary.main, 0.15)};
  }
`);
