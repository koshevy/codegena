import Paper from '@mui/material/Paper';
import { alpha, styled } from '@mui/material/styles';

export const datatypeNodeClasses = {
  root: 'DatatypeNode__root',
  title: 'DatatypeNode__title',
  source: 'DatatypeNode__source',
};

// language=postcss
export const DatatypeNodeStyles = styled(Paper)(({ theme }) => `
  & {
    position: relative;
    background-color: ${alpha(theme.palette.background.paper, 0.6)};
    border: 1px solid ${theme.palette.secondary.light};
    border-left: 3px solid ${theme.palette.secondary.main};
    border-radius: ${theme.shape.borderRadius}px;
    box-shadow: ${theme.shadows[2]};
    box-sizing: border-box;
    padding: ${theme.spacing(1.5, 2)};
    width: 320px;
    cursor: pointer;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: ${alpha(theme.palette.background.paper, 0.5)};
    z-index: -1;
    filter: blur(10px);
  }

  & .react-flow__handle {
    background-color: ${theme.palette.secondary.main};
  }

  .react-flow__node.selected & {
    border-color: ${theme.palette.secondary.main};
    outline: 3px solid ${alpha(theme.palette.secondary.light, 0.6)};
  }

  .react-flow__node.implicitly-selected & {
    background-color: ${alpha(theme.palette.secondary.light, 0.08)};
    outline: 3px dashed ${alpha(theme.palette.secondary.light, 0.6)};
  }

  .react-flow__node.selected &,
  &:hover {
    background-color: ${alpha(theme.palette.secondary.light, 0.2)} !important;
  }

  .${datatypeNodeClasses.title} {
    font-weight: 700;
  }

  .${datatypeNodeClasses.source} {
    font-size: 11px;
  }
`);
