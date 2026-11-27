import Button from '@mui/material/Button';
import type { Meta, StoryObj } from '@storybook/react';
import { type MouseEvent, type ReactElement, useCallback, useState } from 'react';

import { ThemeModeMenu } from './theme-mode-menu';
import type { ThemeMode } from './theme-mode-menu.props';

const meta: Meta<typeof ThemeModeMenu> = {
  component: ThemeModeMenu,
  title: 'Codegena/Unified UI/Menus/Theme Mode Menu',
};

export default meta;

function ThemeModeMenuExample(): ReactElement {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [mode, setMode] = useState<ThemeMode>('system');

  const handleOpen = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    setAnchor(event.currentTarget);
  }, []);

  const handleClose = useCallback((): void => {
    setAnchor(null);
  }, []);

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outlined"
      >
        Appearance: {mode}
      </Button>
      <ThemeModeMenu
        anchor={anchor}
        mode={mode}
        onChange={setMode}
        onClose={handleClose}
      />
    </>
  );
}

export const RadioSelection: StoryObj<typeof ThemeModeMenu> = {
  render: () => <ThemeModeMenuExample />,
};
