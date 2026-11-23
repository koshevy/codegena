import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

// language=postcss
export const WarningIconButtonStyles = styled(IconButton)(() => `
  & {
    background: none;
    flex-shrink: 0;
    padding: 0;
  }

  &:hover {
    background: none;
  }
`);
