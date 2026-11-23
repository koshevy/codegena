import IconButton from '@mui/material/IconButton';
import { alpha, styled, type Theme } from '@mui/material/styles';

// language=postcss
function getHeaderIconButtonCss(theme: Theme): string {
  return `
  & {
    align-items: center;
    border-radius: ${theme.shape.borderRadius}px;
    color: ${theme.palette.text.primary};
    display: inline-flex;
    height: 38px;
    justify-content: center;
    text-decoration: none;
    transition: background 150ms ease, color 150ms ease, transform 150ms ease;
    width: 38px;
  }

  &:hover,
  &[aria-expanded='true'] {
    background: ${alpha(theme.palette.primary.main, 0.08)};
    color: ${theme.palette.primary.main};
  }

  &:active {
    transform: scale(0.94);
  }

  &.Mui-focusVisible,
  &:focus-visible {
    outline: 2px solid ${theme.palette.secondary.main};
    outline-offset: 2px;
  }

  & svg {
    height: 21px;
    width: 21px;
  }
`;
}

export const HeaderIconButtonStyles = styled(IconButton)(({ theme }) => (
  getHeaderIconButtonCss(theme)
));

export const HeaderIconLinkStyles = styled('a')(({ theme }) => (
  getHeaderIconButtonCss(theme)
));
