import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const playgroundGeneratedOutputViewClasses = {
  root: 'PlaygroundGeneratedOutputView__root',
  view: 'PlaygroundGeneratedOutputView__view',
};

// language=postcss
export const PlaygroundGeneratedOutputViewStyles = styled(Box)`
  & {
    height: 100%;
    min-height: 0;
    overflow: hidden;
    position: relative;
  }

  & .${playgroundGeneratedOutputViewClasses.view} {
    inset: 0;
    position: absolute;
  }

  & .${playgroundGeneratedOutputViewClasses.view}[data-inactive='true'] {
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
  }
`;
