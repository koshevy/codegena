import Tooltip from '@mui/material/Tooltip';
import { SunMoon } from 'lucide-react';
import type { ReactElement } from 'react';

import { ThemeModeSwitcherStyles } from './theme-mode-switcher.styles';
import { useThemeMenuAnchor } from './use-theme-menu-anchor';
import { type ThemeMode, ThemeModeMenu } from '../theme-mode-menu';

interface ThemeModeSwitcherProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

const themeLabels = { dark: 'Dark', light: 'Light', system: 'System' } as const;

export function ThemeModeSwitcher({
  mode,
  onChange,
}: ThemeModeSwitcherProps): ReactElement {
  const {
    anchor,
    handleClose,
    handleOpen,
  } = useThemeMenuAnchor();

  const label = `Theme: ${themeLabels[mode]}`;

  const renderedButton = (
    <ThemeModeSwitcherStyles
      aria-expanded={!!anchor}
      aria-haspopup="menu"
      aria-label={label}
      onClick={handleOpen}
    >
      <SunMoon
        aria-hidden
        size={20}
        strokeWidth={1.5}
      />
    </ThemeModeSwitcherStyles>
  );

  return (
    <>
      <Tooltip title={label}>{renderedButton}</Tooltip>
      <ThemeModeMenu
        anchor={anchor}
        mode={mode}
        onChange={onChange}
        onClose={handleClose}
      />
    </>
  );
}
