import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

import {
  generatedFilesListDatatypeItemClasses,
} from '../items/generated-files-list-datatype-item.styles';
import {
  generatedFilesListDirectoryItemClasses,
} from '../items/generated-files-list-directory-item.styles';
import {
  generatedFilesListFileItemClasses,
} from '../items/generated-files-list-file-item.styles';

export const virtualGeneratedFilesTreeClasses = {
  content: 'VirtualGeneratedFilesTree__content',
  row: 'VirtualGeneratedFilesTree__row',
};

// language=postcss
export const VirtualGeneratedFilesTreeStyles = styled(Box)(({ theme }) => `
  & {
    position: relative;
  }

  & .${virtualGeneratedFilesTreeClasses.row} {
    left: 0;
    position: absolute;
    width: 100%;
  }

  & .${virtualGeneratedFilesTreeClasses.content} {
    align-items: center;
    border-radius: ${theme.shape.borderRadius}px;
    cursor: pointer;
    display: flex;
    margin-block: 0.1rem;
    min-height: 32px;
    padding-right: ${theme.spacing(1)};
  }

  & .${virtualGeneratedFilesTreeClasses.content}:hover,
  & .${virtualGeneratedFilesTreeClasses.row}[data-context-menu-open='true']
    .${virtualGeneratedFilesTreeClasses.content} {
    background: ${theme.palette.action.hover};
  }

  & .${virtualGeneratedFilesTreeClasses.content}[aria-selected='true'] {
    background: ${alpha(theme.palette.primary.main, 0.13)};
  }

  & .${virtualGeneratedFilesTreeClasses.content}:focus-visible {
    outline: 2px solid ${theme.palette.primary.main};
  }

  & .${generatedFilesListDirectoryItemClasses.row},
  & .${generatedFilesListFileItemClasses.row} {
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
    font-weight: 400;
    max-width: calc(100% - ${theme.spacing(2)} - 1rem);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .${generatedFilesListDirectoryItemClasses.description} {
    flex-shrink: 1;
    min-width: 0;
    opacity: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .${virtualGeneratedFilesTreeClasses.content}:hover
    .${generatedFilesListDirectoryItemClasses.description} {
    opacity: 1;
  }

  & .${generatedFilesListFileItemClasses.icon},
  & .${generatedFilesListDatatypeItemClasses.icon} {
    align-items: center;
    display: inline-flex;
    flex-shrink: 0;
    justify-content: center;
    width: 20px;
  }

  & .${generatedFilesListFileItemClasses.text},
  & .${generatedFilesListDatatypeItemClasses.text},
  & .${generatedFilesListDatatypeItemClasses.source} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .${generatedFilesListDatatypeItemClasses.datatype} {
    align-items: start;
    display: flex;
    gap: ${theme.spacing(1)};
    min-width: 0;
    padding: 0.2rem 0.2rem 0.2rem 0.5rem;
    width: 100%;
  }

  & .${generatedFilesListDatatypeItemClasses.info} {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  & .${generatedFilesListDatatypeItemClasses.titleRow} {
    align-items: center;
    display: flex;
    gap: 0.5rem;
  }

  & .${generatedFilesListDatatypeItemClasses.source} {
    color: ${theme.palette.text.secondary};
    font-size: 11px;
  }

  @container (width < 20vw) {
    & .${generatedFilesListDirectoryItemClasses.description} {
      display: none;
    }
  }
`);
