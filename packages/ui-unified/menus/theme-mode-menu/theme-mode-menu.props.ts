export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeModeMenuProps {
  anchor: HTMLElement | null;
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  onClose: () => void;
}
