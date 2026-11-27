import { styled } from '@mui/material/styles';
import SvgIcon from '@mui/material/SvgIcon';

export const logoClasses = {
  primary: 'HeroLogo__primary',
  info: 'HeroLogo__info',
  secondary: 'HeroLogo__secondary',
} as const;

// language=postcss
export const LogoStyles = styled(SvgIcon)(({ theme }) => `
  & {
    display: block;
    height: 100%;
    scale: 0.729;
    width: 100%;
  }

  .${logoClasses.primary} {
    stop-color: ${theme.palette.primary.dark};
  }

  .${logoClasses.info} {
    stop-color: ${theme.palette.info.dark};
  }

  .${logoClasses.secondary} {
    stop-color: ${theme.palette.secondary.dark};
  }
`);
