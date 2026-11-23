import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const fileDetailsHeaderClasses = {
  actions: 'FileDetailsHeader__actions',
  name: 'FileDetailsHeader__name',
  select: 'FileDetailsHeader__select',
} as const;

// language=postcss
export const FileDetailsHeaderStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    display: flex;
    gap: ${theme.spacing(1.5)};
    min-width: 0;
    padding: ${theme.spacing(1.25, 2)};
  }

  & .${fileDetailsHeaderClasses.select} {
    align-items: center;
    display: flex;
    flex: 1;
    gap: ${theme.spacing(1.5)};
    justify-content: flex-start;
    min-width: 0;
    text-align: left;
  }

  & .${fileDetailsHeaderClasses.select}.MuiButtonBase-root:hover {
    color: ${theme.palette.primary.main};
  }

  & .${fileDetailsHeaderClasses.select}.Mui-focusVisible {
    outline: 2px solid ${theme.palette.primary.main};
    outline-offset: 2px;
  }

  & .${fileDetailsHeaderClasses.name} {
    flex: 1;
    min-width: 0;
  }

  & .${fileDetailsHeaderClasses.actions} {
    align-items: center;
    display: flex;
    gap: ${theme.spacing(1.5)};
  }
`);
