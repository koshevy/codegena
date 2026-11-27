import { alpha, styled } from '@mui/material/styles';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

// language=postcss
export const GeneratedFilesListTreeItemStyles = styled(TreeItem)(({ theme }) => `
  & > .MuiTreeItem-content {
    border-radius: ${theme.shape.borderRadius}px;
    margin-block: 0.1rem;
    min-height: 32px;
    padding-block: 0;
    padding-right: ${theme.spacing(1)};
  }

  & > .MuiTreeItem-content.Mui-selected,
  & > .MuiTreeItem-content.Mui-selected:hover,
  & > .MuiTreeItem-content.Mui-selected.Mui-focused {
    background: ${alpha(theme.palette.primary.main, 0.13)};
  }

  &[data-context-menu-open='true'] > .MuiTreeItem-content:not(.Mui-selected) {
    background: ${theme.palette.action.hover};
  }
`);
