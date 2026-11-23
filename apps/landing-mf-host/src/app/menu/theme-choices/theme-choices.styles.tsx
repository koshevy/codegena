import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const themeChoicesClasses = {
  group: 'ThemeChoices__group',
} as const;

// language=postcss
export const ThemeChoicesStyles = styled(Box)(({ theme }) => `
  & {
    color: ${theme.palette.text.primary};
  }

  & h2 {
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    font-weight: 300;
    letter-spacing: -0.055em;
    line-height: 1.08;
    margin: 0 0 1.5rem;
  }

  .${themeChoicesClasses.group} {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  @media (max-width: 900px) {
    & { display: none; }
  }
`);
