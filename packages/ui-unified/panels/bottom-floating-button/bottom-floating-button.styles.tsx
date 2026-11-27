import Button from '@mui/material/Button';
import { darken, styled } from '@mui/material/styles';

export const bottomFloatingButtonClasses = {
  fixed: 'BottomFloatingButton__fixed',
} as const;

// language=postcss
export const BottomFloatingButtonStyles = styled(Button)(({ theme }) => `
  & {
    border-radius: ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0;
    bottom: 0;
    box-shadow: ${theme.shadows[3]};
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
    z-index: 2;
  }

  &.MuiButton-containedWarning {
    background: ${darken(theme.palette.warning.main, 0.05)};
    color: ${theme.palette.getContrastText(theme.palette.warning.dark)};
  }

  &.${bottomFloatingButtonClasses.fixed} {
    position: fixed;
  }
`);
