import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

export const declarationTypeIconClasses = {
  root: 'DeclarationTypeIcon__root',
  noHoverStyles: 'DeclarationTypeIcon__noHoverStyles',
};

// language=postcss
export const DeclarationTypeIconStyles = styled(Box)(({ theme }) => `
  & {
    align-items: center;
    color: ${theme.palette.secondary.main};
    display: inline-flex;
    flex-shrink: 0;
    justify-content: center;
    vertical-align: middle;
  }

  &:hover,
  button:hover & {
    color: ${theme.palette.secondary.dark};
  }

  &.${declarationTypeIconClasses.noHoverStyles},
  button:hover &.${declarationTypeIconClasses.noHoverStyles} {
    color: ${theme.palette.secondary.main};
  }
`);

// language=postcss
export const DeclarationTypeIconButtonStyles = styled(IconButton)(({ theme }) => `
  & {
    background: none;
    color: ${theme.palette.secondary.main};
    padding: 0;
  }

  &:hover {
    background: none;
  }

  &:focus-visible {
    outline: 2px solid ${theme.palette.primary.main};
    outline-offset: 2px;
  }
`);
