import { fontFamilies } from '@codegena/ui-theme';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';

// language=postcss
export const SearchDrawerPeelTabStyles = styled(Button)(
  ({ theme }) => `
  & {
    border-radius: 0 0 0.5rem 0.5rem;
    box-shadow: ${theme.shadows[3]};
    color: ${theme.palette.text.primary};
    font-size: ${theme.typography.body1};
    gap: ${theme.spacing(1)};
    line-height: 1.3;
    max-width: calc(100vw - 2rem);
    min-height: 2.5rem;
    padding: 1.7rem 1rem 0.7rem;
    text-transform: none;
    white-space: nowrap;
    margin-top: -1rem;
    transition: margin-top 150ms ease-in-out;
    background:
      linear-gradient(
        ${alpha(theme.palette.primary.light, 0.05)},
        transparent
      ),
      linear-gradient(
        90deg,
        ${alpha(theme.palette.info.light, 0.01)},
        transparent
      ),
      linear-gradient(
        -90deg,
        ${alpha(theme.palette.secondary.light, 0.06)},
        transparent
      );
    background-blend-mode: screen;
  }

  code {
    font-family: ${fontFamilies.mono};
    font-size: 1.1rem;
    color: ${theme.palette.text.secondary};
  }

  &:hover,
  &:focus-visible {
    background: ${alpha(theme.palette.primary.main, 0.1)};
    box-shadow: ${theme.shadows[6]};
    color: ${theme.palette.primary.dark};
    margin-top: -0.8rem;
  }

  &:active {
    box-shadow: ${theme.shadows[3]};
    margin-top: -0.5rem;
    zoom: 0.95;
  }
`,
);
