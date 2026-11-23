import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const phraseLineClasses = {
  closing: 'PhraseLine__closing',
  sequence: 'PhraseLine__sequence',
  tail: 'PhraseLine__tail',
  track: 'PhraseLine__track',
} as const;

// language=postcss
export const PhraseLineStyles = styled(Box)`
  & {
    display: block;
    height: 0.98em;
    pointer-events: none;
    position: relative;
    white-space: nowrap;
    width: 100%;
  }

  .${phraseLineClasses.track},
  .${phraseLineClasses.sequence} {
    display: flex;
    width: max-content;
  }

  .${phraseLineClasses.track} {
    position: relative;
    will-change: transform;
  }

  .${phraseLineClasses.sequence} {
    gap: 1rem;
    padding-right: 1rem;
  }

  .${phraseLineClasses.closing} {
    display: inline-block;
    flex: none;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    line-height: inherit;
  }

  .${phraseLineClasses.tail} {
    display: flex;
    gap: 1rem;
    padding-right: 1rem;
    position: absolute;
    right: 100%;
  }

`;
