import { ThemedScrollAreaStyles } from '@codegena/ui-unified/scrolling';
import { styled } from '@mui/material/styles';

export const generatedFileDetailsClasses = {
  container: 'GeneratedFileDetails__container',
  root: 'GeneratedFileDetails__root',
  windowScroll: 'GeneratedFileDetails__windowScroll',
  files: 'GeneratedFileDetails__files',
};

// language=postcss
export const GeneratedFileDetailsContainerStyles = styled(
  ThemedScrollAreaStyles,
)(() => `
  & {
    flex: 1;
    min-height: 0;
    position: relative;
  }

  &.${generatedFileDetailsClasses.windowScroll} {
    height: auto;
  }
`);

// language=postcss
export const GeneratedFileDetailsStyles = styled('div')(({ theme }) => `
  & {
    background: ${theme.palette.background.default};
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    min-width: 0;
    overflow-y: auto;
  }

  &.${generatedFileDetailsClasses.windowScroll} {
    height: auto;
    overflow: visible;
  }

  & .${generatedFileDetailsClasses.files} {
    flex: 0 0 auto;
    min-width: 0;
    padding: ${theme.spacing(2)};
  }
`);
