import type { ThemeMode } from '@codegena/ui-unified/menus';

/**
 * A host-owned appearance shared by Playground and its surrounding views.
 */
export interface PlaygroundAppearance {
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}
