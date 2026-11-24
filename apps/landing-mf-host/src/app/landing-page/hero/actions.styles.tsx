import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const actionsClasses = {
  secondary: 'Actions__secondary',
} as const;

// language=postcss
export const ActionsStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 1.8rem;
    justify-content: center;
    margin-top: 2.6rem;
  }

  & .MuiButton-contained {
    border-radius: 2px;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 0.95rem 1.45rem;
    text-transform: uppercase;
  }

  & .MuiButton-contained:not(.Mui-disabled) {
    background-image: linear-gradient(
      90deg,
      ${theme.palette.info.dark},
      ${theme.palette.primary.dark},
      ${theme.palette.secondary.dark}
    );
    color: ${theme.palette.info.contrastText};
    isolation: isolate;
  }

  & .MuiButton-contained:not(.Mui-disabled)::before {
    background-image: linear-gradient(
      90deg,
      ${theme.palette.info.light},
      ${theme.palette.primary.light} 75%,
      ${theme.palette.secondary.light}
    );
    border-radius: inherit;
    content: '';
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity 300ms ease;
    z-index: -1;
  }

  & .MuiButton-contained:not(.Mui-disabled):hover::before,
  & .MuiButton-contained:not(.Mui-disabled):active::before {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    & .MuiButton-contained:not(.Mui-disabled)::before {
      transition: none;
    }
  }

  & .MuiButton-contained:focus-visible {
    outline: 2px solid ${theme.palette.info.dark};
    outline-offset: 3px;
  }

  .${actionsClasses.secondary} {
    align-items: center;
    color: ${theme.palette.text.primary};
    display: inline-flex;
    background: none;
    border: 0;
    cursor: pointer;
    font-size: 0.76rem;
    gap: 0.6rem;
    justify-content: flex-end;
    letter-spacing: 0.06em;
    text-decoration: none;
    text-transform: uppercase;
    width: 10.5rem;
  }

  .${actionsClasses.secondary}:hover {
    color: ${theme.palette.info.dark};
  }

  @media (max-height: 800px) {
    & {
      margin-top: 1.5rem;
    }
  }

  @media (max-width: 520px) {
    & {
      margin-top: 1.5rem;
    }
  }

  @media (max-width: 520px) and (max-height: 700px) {
    & {
      margin-top: 1rem;
    }
  }
`);
