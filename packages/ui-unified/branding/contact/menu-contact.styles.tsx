import Box from '@mui/material/Box';
import { alpha, styled } from '@mui/material/styles';

export const menuContactClasses = {
  social: 'MenuContact__social',
} as const;

// language=postcss
export const MenuContactStyles = styled(Box)(({ theme }) => `
  & {
    align-items: flex-end;
    color: ${theme.palette.text.secondary};
    display: flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 0.45rem;
  }

  & a {
    color: ${theme.palette.text.primary};
    text-decoration-color: ${alpha(theme.palette.info.main, 0.45)};
  }

  .${menuContactClasses.social} {
    display: flex;
    gap: 0.35rem;
    margin-bottom: 0.4rem;
  }

  .${menuContactClasses.social} .MuiIconButton-root:hover {
    background: ${alpha(theme.palette.info.main, 0.13)};
    color: ${theme.palette.info.dark};
  }

  .${menuContactClasses.social} svg {
    height: 20px;
    width: 20px;
  }
`);
