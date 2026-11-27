import { styled } from '@mui/material/styles';

import {
  GeneratedFilesListTreeItemStyles,
} from './generated-files-list-tree-item.styles';

export const generatedFilesListDatatypeItemClasses = {
  datatype: 'GeneratedFilesListDatatypeItem__datatype',
  icon: 'GeneratedFilesListDatatypeItem__icon',
  info: 'GeneratedFilesListDatatypeItem__info',
  titleRow: 'GeneratedFilesListDatatypeItem__titleRow',
  text: 'GeneratedFilesListDatatypeItem__text',
  source: 'GeneratedFilesListDatatypeItem__source',
};

// language=postcss
export const GeneratedFilesListDatatypeItemStyles = styled(
  GeneratedFilesListTreeItemStyles,
)(({ theme }) => `
  & .${generatedFilesListDatatypeItemClasses.datatype} {
    align-items: start;
    display: flex;
    gap: ${theme.spacing(1)};
    min-width: 0;
    padding: 0.2rem 0.2rem 0.2rem 0.5rem;
    width: 100%;
  }

  & .${generatedFilesListDatatypeItemClasses.icon} {
    align-items: center;
    display: inline-flex;
    flex-shrink: 0;
    justify-content: center;
    width: 20px;
    margin-top: 0.2rem;
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
    min-width: 0;
  }

  & .${generatedFilesListDatatypeItemClasses.text},
  & .${generatedFilesListDatatypeItemClasses.source} {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  & .${generatedFilesListDatatypeItemClasses.source} {
    color: ${theme.palette.text.secondary};
    font-size: 11px;
  }
`);
