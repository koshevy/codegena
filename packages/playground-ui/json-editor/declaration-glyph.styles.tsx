import { styled } from '@mui/material/styles';

// language=postcss
export const DeclarationGlyphWarningStyles = styled('span')(({ theme }) => `
  & {
    align-items: center;
    background: ${theme.palette.background.paper};
    border-radius: 50%;
    bottom: -4px;
    display: flex;
    height: 14px;
    justify-content: center;
    position: absolute;
    right: -5px;
    width: 14px;
    z-index: 1;
  }
`);
