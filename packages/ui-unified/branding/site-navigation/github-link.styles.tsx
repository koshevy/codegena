import { alpha, styled } from '@mui/material/styles';

// language=postcss
export const GitHubLinkStyles = styled('a')(({ theme }) => `
  & {
    color: ${theme.palette.text.primary};
    flex-shrink: 0;
    height: 2.5rem;
    width: 2.5rem;
  }

  & svg {
    height: 20px;
    width: 20px;
  }

  &:hover,
  &:focus-visible {
    background: ${alpha(theme.palette.primary.main, 0.15)};
  }
`);
