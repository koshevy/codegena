import { Monitor, Moon, Sun } from 'lucide-react';
import { type ReactElement, useMemo } from 'react';

import type { ThemeMode } from './theme-mode-menu.props';
import type { ContextMenuChoiceItem } from '../context-menu';

const themeModeOptions: {
  icon: ReactElement;
  label: string;
  mode: ThemeMode;
}[] = [
  { icon: <Sun />, label: 'Light', mode: 'light' },
  { icon: <Moon />, label: 'Dark', mode: 'dark' },
  { icon: <Monitor />, label: 'System', mode: 'system' },
];

export function useContextMenuItems(
  mode: ThemeMode,
  onChange: (mode: ThemeMode) => void,
): ContextMenuChoiceItem[] {
  return useMemo(() => themeModeOptions.map((option) => ({
    selected: mode === option.mode,
    icon: option.icon,
    id: option.mode,
    label: option.label,
    onSelect: () => {
      setTimeout(() => {
        onChange(option.mode);
      });
    },
    type: 'choice',
  })), [
    mode,
    onChange,
  ]);
}
