import type { ThemeMode } from '@codegena/ui-unified/menus';
import { createContext } from 'react';

export interface Appearance {
  readonly mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const AppearanceContext = createContext<Appearance | null>(null);
