import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const generatedFilesListClasses = {
  root: 'GeneratedFilesList__root',
};

// language=postcss
export const GeneratedFilesListStyles = styled(Box)(() => `
  & {
    background: transparent;
    container-type: inline-size;
    height: 100%;
    overflow: auto;
  }
`);
