import IconButton from '@mui/material/IconButton';
import { alpha, styled } from '@mui/material/styles';

// language=postcss
export const GeneratedFilesListExpandButtonStyles = styled(IconButton)(({ theme }) => `
  & {
    color: ${theme.palette.text.secondary};
    flex: 0 0 1.4rem;
    height: 1.4rem;
    padding: 0;
    width: 1.4rem;
  }

  &:hover {
    background: ${alpha(theme.palette.action.active, 0.32)};
    color: ${theme.palette.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.palette.primary.main};
    outline-offset: 1px;
  }

  & svg {
    font-size: 1.1rem;
  }
`);
