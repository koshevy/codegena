import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const bulletsClasses = {
  bullet: 'Bullets__bullet',
  button: 'Bullets__button',
} as const;

// language=postcss
export const BulletsStyles = styled(Box)(({
  theme,
}) => `
  & {
    align-items: center;
    display: flex;
    gap: ${theme.spacing(0.25)};
    justify-content: center;
  }

  .${bulletsClasses.button} {
    height: 24px;
    width: 24px;
  }

  .${bulletsClasses.bullet} {
    background: ${theme.palette.text.secondary};
    border-radius: 50%;
    height: 6px;
    width: 6px;
  }

  .${bulletsClasses.button}[aria-current='true'] .${bulletsClasses.bullet} {
    background: ${theme.palette.info.dark};
    height: 8px;
    width: 8px;
  }
`);
