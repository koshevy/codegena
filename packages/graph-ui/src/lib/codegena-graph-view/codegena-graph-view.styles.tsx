import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

export const codegenaGraphViewClasses = {
  root: 'CodegenaGraphView__root',
  embedded: 'CodegenaGraphView__embedded',
  canvas: 'CodegenaGraphView__canvas',
};

// language=postcss
export const CodegenaGraphViewStyles = styled(Paper)(({ theme }) => `
  & {
    background-color: ${theme.palette.background.paper};
    border: 1px solid ${theme.palette.divider};
    border-radius: ${theme.shape.borderRadius * 2}px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &.${codegenaGraphViewClasses.embedded} {
    background-color: transparent;
    border: 0;
    border-radius: 0;
  }

  &.${codegenaGraphViewClasses.embedded} .${codegenaGraphViewClasses.canvas} {
    background-color: transparent;
  }

  .${codegenaGraphViewClasses.canvas} {
    background-color: ${theme.palette.background.default};
    flex: 1;
    min-height: 0;
    position: relative;
  }

  .${codegenaGraphViewClasses.canvas} .react-flow__controls {
    border: 1px solid ${theme.palette.divider};
    border-radius: ${theme.shape.borderRadius}px;
    box-shadow: ${theme.shadows[2]};
    overflow: hidden;
  }

  .${codegenaGraphViewClasses.canvas} .react-flow__controls-button {
    background-color: ${theme.palette.background.paper};
    border-bottom-color: ${theme.palette.divider};
    fill: ${theme.palette.text.secondary};
  }

  .${codegenaGraphViewClasses.canvas} .react-flow__node:focus-visible {
    border-radius: ${theme.shape.borderRadius}px;
    outline: 2px solid ${theme.palette.primary.main};
    outline-offset: 4px;
  }
`);
