import { styled } from '@mui/material/styles';

export const wordmarkShapesClasses = {
  info: 'WordmarkShapes__info',
  primary: 'WordmarkShapes__primary',
  secondary: 'WordmarkShapes__secondary',
} as const;

// language=postcss
export const WordmarkShapesStyles = styled('g')(({ theme }) => `
  .${wordmarkShapesClasses.info} {
    stop-color: ${theme.palette.info.dark};
  }

  .${wordmarkShapesClasses.primary} {
    stop-color: ${theme.palette.primary.dark};
  }

  .${wordmarkShapesClasses.secondary} {
    stop-color: ${theme.palette.secondary.dark};
  }
`);
