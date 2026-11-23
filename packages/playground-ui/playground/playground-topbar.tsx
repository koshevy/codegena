import { PlaygroundPreferencesButton } from '@codegena/playground-ui/preferences';
import { CodegenaLogo } from '@codegena/ui-unified/branding';
import { GitHubInvertocatIcon } from '@codegena/ui-unified/icons';
import type { ThemeMode } from '@codegena/ui-unified/menus';
import { HeaderIconButton } from '@codegena/ui-unified/panels';
import Box from '@mui/material/Box';
import { Menu } from 'lucide-react';
import { type ReactElement, useMemo } from 'react';

import {
  playgroundTopbarClasses,
  PlaygroundTopbarStyles,
} from './playground-topbar.styles';

interface PlaygroundTopbarProps {
  colorMode: ThemeMode;
  onChangeColorMode: (mode: ThemeMode) => void;
  onSandwichButtonClick?: () => void;
}

export function PlaygroundTopbar({
  colorMode,
  onChangeColorMode,
  onSandwichButtonClick,
}: PlaygroundTopbarProps): ReactElement {
  const renderedSandwich = useMemo(() => {
    if (!onSandwichButtonClick) {
      return null;
    }

    return (
      <HeaderIconButton
        icon={<Menu aria-hidden />}
        label="Open navigation menu"
        onClick={onSandwichButtonClick}
      />
    );
  }, [onSandwichButtonClick]);

  return (
    <PlaygroundTopbarStyles
      aria-label="Playground toolbar"
      component="header"
      role="group"
    >
      <CodegenaLogo subtitle="Schema playground" />
      <Box
        className={playgroundTopbarClasses.actions}
      >
        <PlaygroundPreferencesButton
          mode={colorMode}
          onChangeMode={onChangeColorMode}
        />
        <HeaderIconButton
          href="https://github.com/koshevy/codegena"
          icon={<GitHubInvertocatIcon />}
          label="View project on GitHub"
          target="_blank"
        />
        {renderedSandwich}
      </Box>
    </PlaygroundTopbarStyles>
  );
}
