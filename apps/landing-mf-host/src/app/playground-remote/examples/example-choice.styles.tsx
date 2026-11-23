import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';

// language=postcss
export const ExampleChoiceStyles = styled(Button)(({ theme }) => `
  & {
    color: ${theme.palette.text.primary};
    font-size: 1.25rem;
    font-weight: 300;
    justify-content: flex-start;
    padding: 0.6rem 1rem;
    text-align: left;
    text-transform: none;
  }

  &[aria-pressed='true'] {
    background: ${alpha(theme.palette.primary.main, 0.15)};
    color: ${theme.palette.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.palette.focus.main};
    outline-offset: 2px;
  }
`);
