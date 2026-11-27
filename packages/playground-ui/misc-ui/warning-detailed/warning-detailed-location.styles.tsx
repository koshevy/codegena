import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const warningDetailedLocationClasses = {
  code: 'WarningDetailedLocation__code',
};

// language=postcss
export const WarningDetailedLocationStyles = styled(Box)(({ theme }) => `
  & .${warningDetailedLocationClasses.code} {
    background: ${alpha(theme.palette.warning.main, 0.06)};
    border: 0;
    color: ${theme.palette.text.primary};
    cursor: pointer;
    display: block;
    font-family: "JetBrains Mono", SFMono-Regular, Consolas, monospace;
    font-size: 12px;
    margin-top: ${theme.spacing(1)};
    max-width: 100%;
    overflow-x: auto;
    padding: ${theme.spacing(1)};
    text-align: left;
    white-space: pre;
    width: 100%;
  }
`);
