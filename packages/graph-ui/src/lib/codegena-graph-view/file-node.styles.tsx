import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const fileNodeClasses = {
  root: 'FileNode__root',
  header: 'FileNode__header',
  text: 'FileNode__text',
  name: 'FileNode__name',
};

// language=postcss
export const FileNodeStyles = styled(Box)(({ theme }) => `
  & {
    background-color: ${alpha(theme.palette.background.paper, 0.85)};
    border: 1px solid ${alpha(theme.palette.primary.light, 0.55)};
    border-radius: ${theme.shape.borderRadius * 1.5}px;
    box-shadow: ${theme.shadows[3]};
    height: 100%;
    overflow: hidden;
    width: 100%;
    cursor: pointer;
  }

  & .react-flow__handle {
    background-color: ${theme.palette.primary.main};
    width: .5rem;
    height: .5rem;
    box-shadow: ${theme.shadows[3]};
    top: 2.7rem;
    cursor: pointer;
  }

  .${fileNodeClasses.header} {
    transition: all .4s ease;
    align-items: center;
    background-color: ${alpha(theme.palette.primary.main, 0.14)};
    border-bottom: 1px solid ${alpha(theme.palette.primary.main, 0.35)};
    display: flex;
    gap: ${theme.spacing(2)};
    min-height: 1.8rem;
    padding: ${theme.spacing(1.5, 3)};
  }

  .${fileNodeClasses.text} {
    width: 100%;
  }

  .${fileNodeClasses.name} {
    display: block;
    font-weight: bold;
    font-size: .9rem;
    max-width: calc(100% - 2rem);
    color: ${theme.palette.text.primary};
    overflow: hidden;
    direction: rtl;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
  }

  .react-flow__node.selected & {
    border-color: ${theme.palette.primary.main};
    outline: 3px solid ${alpha(theme.palette.primary.light, 0.7)};
  }

  .react-flow__node.selected &,
  &:hover {
    .${fileNodeClasses.header} {
      background: ${theme.palette.primary.main};
    }

    .${fileNodeClasses.name} {
      color: ${theme.palette.background.paper};
    }

    svg {
      color: ${theme.palette.background.paper};
    }
  }

  .react-flow__node.implicitly-selected & {
    outline: 3px dashed ${alpha(theme.palette.primary.light, 0.7)};
  }

  .react-flow__node.selected &,
  .react-flow__node.implicitly-selected &,
  &:hover {
    background-color: ${alpha(theme.palette.primary.light, 0.08)};
  }
`);
