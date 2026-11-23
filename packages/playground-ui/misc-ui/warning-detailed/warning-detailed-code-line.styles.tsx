import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const warningDetailedCodeLineClasses = {
  root: 'WarningDetailedCodeLine__root',
  active: 'WarningDetailedCodeLine__active',
  lineNumber: 'WarningDetailedCodeLine__lineNumber',
  caret: 'WarningDetailedCodeLine__caret',
};

// language=postcss
export const WarningDetailedCodeLineStyles = styled(Box)(({ theme }) => `
  & {
    display: block;
  }

  &.${warningDetailedCodeLineClasses.active} {
    background: ${alpha(theme.palette.warning.main, 0.15)};
  }

  & .${warningDetailedCodeLineClasses.lineNumber} {
    color: ${theme.palette.text.secondary};
  }

  & .${warningDetailedCodeLineClasses.caret} {
    color: ${theme.palette.warning.dark};
  }
`);
