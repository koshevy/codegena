import type { ThemeMode } from '@codegena/ui-unified/menus';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback } from 'react';

import { ThemeChoiceStyles } from './theme-choice.styles';
import { useAppearance } from '../../appearance';

interface ThemeChoiceProps {
  label: string;
  mode: ThemeMode;
  onSelect: () => void;
}

const icons = { dark: Moon, light: Sun, system: Monitor } as const;

export function ThemeChoice({
  label,
  mode,
  onSelect,
}: ThemeChoiceProps): ReactElement {
  const {
    mode: currentMode,
    setMode,
  } = useAppearance();

  const handleSelect = useCallback((): void => {
    setMode(mode);
    onSelect();
  }, [
    mode,
    onSelect,
    setMode,
  ]);

  const Icon = icons[mode];

  return (
    <ThemeChoiceStyles
      onClick={handleSelect}
      selected={currentMode === mode}
      value={mode}
    >
      <Icon
        aria-hidden
        size={20}
        strokeWidth={1.5}
      />
      {label}
    </ThemeChoiceStyles>
  );
}
