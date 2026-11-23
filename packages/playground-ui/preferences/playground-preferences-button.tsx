import { ThemeModeMenu, type ThemeMode } from '@codegena/ui-unified/menus';
import { HeaderIconButton } from '@codegena/ui-unified/panels';
import { SunMoon } from 'lucide-react';
import {
  type MouseEvent,
  type ReactElement,
  useCallback,
  useState,
} from 'react';

interface PlaygroundPreferencesButtonProps {
  mode: ThemeMode;
  onChangeMode: (mode: ThemeMode) => void;
}

export function PlaygroundPreferencesButton({
  mode,
  onChangeMode,
}: PlaygroundPreferencesButtonProps): ReactElement {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const handleOpen = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    setAnchor(event.currentTarget);
  }, []);

  const handleClose = useCallback((): void => {
    setAnchor(null);
  }, []);

  const isExpanded = Boolean(anchor);

  return (
    <>
      <HeaderIconButton
        expanded={isExpanded}
        icon={(
          <SunMoon
            aria-hidden
            strokeWidth={2.75}
          />
        )}
        label="Appearance preferences"
        onClick={handleOpen}
      />
      <ThemeModeMenu
        anchor={anchor}
        mode={mode}
        onChange={onChangeMode}
        onClose={handleClose}
      />
    </>
  );
}
