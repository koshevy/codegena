import { styled } from '@mui/material/styles';
import { span as MotionSpan } from 'motion/react-m';

export const phraseGroupClasses = {
  phrase: 'PhraseGroup__phrase',
} as const;

// language=postcss
export const PhraseGroupStyles = styled(MotionSpan)(({ theme }) => `
  & {
    display: flex;
    gap: 1rem;
  }

  .${phraseGroupClasses.phrase} {
    color: ${theme.palette.text.primary};
    display: inline-block;
    flex: none;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    line-height: inherit;
  }

  .${phraseGroupClasses.phrase}:nth-of-type(4n + 1) {
    color: ${theme.palette.info.dark};
  }

  .${phraseGroupClasses.phrase}:nth-of-type(4n + 2) {
    color: ${theme.palette.secondary.dark};
  }

  .${phraseGroupClasses.phrase}:nth-of-type(4n + 3) {
    color: ${theme.palette.primary.dark};
  }

  &[data-main='true'] .${phraseGroupClasses.phrase} {
    color: inherit;
  }
`);
