import { styled } from '@mui/material/styles';

import {
  GeneratedFilesListTreeItemStyles,
} from './generated-files-list-tree-item.styles';

export const generatedFilesListDirectoryItemClasses = {
  row: 'GeneratedFilesListDirectoryItem__row',
  icon: 'GeneratedFilesListDirectoryItem__icon',
  name: 'GeneratedFilesListDirectoryItem__name',
  description: 'GeneratedFilesListDirectoryItem__description',
};

// language=postcss
export const GeneratedFilesListDirectoryItemStyles = styled(
  GeneratedFilesListTreeItemStyles,
)(({ theme }) => `
  & .${generatedFilesListDirectoryItemClasses.row} {
    align-items: center;
    display: flex;
    gap: ${theme.spacing(1)};
    min-width: 0;
    padding: 0.2rem;
    width: 100%;
  }

  & .${generatedFilesListDirectoryItemClasses.icon} {
    flex-shrink: 0;
  }

  & .${generatedFilesListDirectoryItemClasses.name} {
    flex-shrink: 0;
    max-width: calc(100% - ${theme.spacing(2)} - 1rem);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 400;
  }

  & .${generatedFilesListDirectoryItemClasses.description} {
    flex-shrink: 1;
    min-width: 0;
    opacity: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: opacity 0.2s ease-in-out;
    white-space: nowrap;
  }

  &:hover .${generatedFilesListDirectoryItemClasses.description},
  &[data-context-menu-open='true']
    .${generatedFilesListDirectoryItemClasses.description} {
    opacity: 1;
  }

  @container (width < 20vw) {
    & .${generatedFilesListDirectoryItemClasses.description} {
      display: none;
    }
  }
`);
