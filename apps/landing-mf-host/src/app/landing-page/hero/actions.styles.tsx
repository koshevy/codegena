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
    background: ${theme.palette.info.dark};
    border-radius: 2px;
    color: ${theme.palette.info.contrastText};
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 0.95rem 1.45rem;
    text-transform: uppercase;
  }

  & .MuiButton-contained:hover {
    background: ${theme.palette.info.main};
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
