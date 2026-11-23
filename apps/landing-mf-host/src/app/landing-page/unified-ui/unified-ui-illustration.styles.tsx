import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const unifiedUiIllustrationClasses = {
  heading: 'UnifiedUiIllustration__heading',
  list: 'UnifiedUiIllustration__list',
} as const;

// language=postcss
export const UnifiedUiIllustrationStyles = styled(Box)(({ theme }) => `
  & {
    align-items: flex-start;
    display: flex;
    height: 100%;
    justify-content: center;
    min-width: 0;
  }

  .${unifiedUiIllustrationClasses.list} {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 100%;
  }

  .${unifiedUiIllustrationClasses.heading} {
    color: ${theme.palette.common.white};
    font-size: clamp(1.5rem, 2.5vw, 2.5rem);
    font-weight: 500;
    letter-spacing: -0.055em;
    margin: 0 0 1rem;
  }
`);
