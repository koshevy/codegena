import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const infographicsItemClasses = {
  number: 'InfographicsItem__number',
} as const;

// language=postcss
export const InfographicsItemStyles = styled(Box)(({ theme }) => `
  & {
    align-items: baseline;
    column-gap: clamp(1rem, 3vw, 3rem);
    display: grid;
    grid-template-columns: 4rem minmax(12rem, 0.5fr) minmax(0, 1fr);
    padding: 2rem 0;
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.palette.divider};
  }

  .${infographicsItemClasses.number} {
    color: ${theme.palette.info.dark};
    font-family: monospace;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
  }

  h3 {
    font-size: clamp(1.5rem, 2.5vw, 2.5rem);
    font-weight: 500;
    letter-spacing: -0.055em;
    margin: 0;
  }

  p {
    color: ${theme.palette.text.secondary};
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.65;
    margin: 0;
    max-width: 42rem;
  }

  @media (max-width: 800px) {
    & {
      grid-template-columns: 3rem minmax(0, 1fr);
      padding: 1.5rem 0;
    }

    p {
      grid-column: 2;
      margin-top: 0.75rem;
    }
  }
`);
