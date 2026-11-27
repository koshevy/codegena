import { styled } from '@mui/material/styles';

import {
  GeneratedFilesListTreeItemStyles,
} from './generated-files-list-tree-item.styles';

export const generatedFilesListFileItemClasses = {
  row: 'GeneratedFilesListFileItem__row',
  icon: 'GeneratedFilesListFileItem__icon',
  text: 'GeneratedFilesListFileItem__text',
};

// language=postcss
export const GeneratedFilesListFileItemStyles = styled(
  GeneratedFilesListTreeItemStyles,
)(({ theme }) => `
  & .${generatedFilesListFileItemClasses.row} {
    align-items: center;
    display: flex;
    gap: ${theme.spacing(1)};
    min-width: 0;
    padding: 0.2rem;
    width: 100%;
  }

  & .${generatedFilesListFileItemClasses.icon} {
    align-items: center;
    display: inline-flex;
    flex-shrink: 0;
    justify-content: center;
    width: 20px;
  }

  & .${generatedFilesListFileItemClasses.text} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`);
