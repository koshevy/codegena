import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const generatedFileDetailsFileClasses = {
  root: 'GeneratedFileDetailsFile__root',
  singleFile: 'GeneratedFileDetailsFile__singleFile',
  selected: 'GeneratedFileDetailsFile__selected',
};

// language=postcss
export const GeneratedFileDetailsFileStyles = styled(Box)(({ theme }) => `
  & {
    border: 1px solid ${theme.palette.divider};
    border-radius: ${theme.shape.borderRadius}px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    max-height: 60vh;
    overflow: hidden;
  }

  &.${generatedFileDetailsFileClasses.singleFile} {
    max-height: 100vh;
  }

  &.${generatedFileDetailsFileClasses.selected} {
    outline: 2px solid ${alpha(theme.palette.primary.light, 0.65)};
  }

`);
