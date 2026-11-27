import Paper from '@mui/material/Paper';
import { alpha, styled } from '@mui/material/styles';

export const directoryNodeClasses = {
  root: 'DirectoryNode__root',
  text: 'DirectoryNode__text',
  icon: 'DirectoryNode__icon',
  label: 'DirectoryNode__label',
  description: 'DirectoryNode__description',
  toggle: 'DirectoryNode__toggle',
  expanded: 'DirectoryNode__expanded',
};

// language=postcss
export const DirectoryNodeStyles = styled(Paper)(({ theme }) => `
  & {
    align-items: center;
    background-color: ${alpha(theme.palette.background.paper, 0.6)};
    border: 1px solid ${alpha(theme.palette.divider, 0.8)};
    border-radius: ${theme.shape.borderRadius}px;
    box-shadow: ${theme.shadows[1]};
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    gap: 1rem;
    height: 100%;
    padding: ${theme.spacing(1, 1.25)};
    width: 100%;
  }

  .react-flow__node.selected & {
    outline: 3px solid ${alpha(theme.palette.warning.light, 0.6)};
  }

  .react-flow__node.implicitly-selected & {
    outline: 3px dashed ${alpha(theme.palette.warning.light, 0.6)};
  }

  .react-flow__node.selected &,
  &:hover {
    background-color: ${alpha(theme.palette.warning.light, 0.2)};
  }

  .${directoryNodeClasses.icon} {
    width: 1.8rem;
    height: auto;
    position: absolute;
    left: 0.8rem;
  }

  .${directoryNodeClasses.text} {
    flex: 1;
    min-width: 0;
    margin-left: 3rem;
  }

  .${directoryNodeClasses.label} {
    font-weight: 700;
  }

  .${directoryNodeClasses.description} {
    font-size: 11px;
  }

  .${directoryNodeClasses.toggle} {
    border-radius: ${theme.shape.borderRadius}px;
    height: 100%;
    color: ${theme.palette.grey[600]};
    flex-shrink: 0;
    padding: 0.5rem;
  }

  .${directoryNodeClasses.toggle}:hover {
    background-color: ${alpha(theme.palette.grey[600], 0.1)};
    color: ${theme.palette.warning.dark};
  }

  & .react-flow__handle {
    background-color: ${theme.palette.grey[600]};
  }

  &.${directoryNodeClasses.expanded} {
    .${directoryNodeClasses.icon} {
      width: 2.2rem;
      height: auto;
      left: 0.6rem;
    }
  }
`);
