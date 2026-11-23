import { alpha, type Theme } from '@mui/material/styles';

export const scrollbarSize = {
  horizontal: 6,
  vertical: 7,
};

export function createScrollbarColors(theme: Theme): {
  active: string;
  hover: string;
  normal: string;
  trackBorder: string;
} {
  return {
    active: theme.palette.primary.main,
    hover: alpha(theme.palette.text.primary, 0.54),
    normal: alpha(theme.palette.text.primary, 0.34),
    trackBorder: alpha(theme.palette.text.disabled, 0.1),
  };
}
