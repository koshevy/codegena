import type { ThemeMode } from '@codegena/ui-unified/menus';
import { createContext } from 'react';

export interface DocumentationLocation {
  hash: string;
  pathname: string;
  search: string;
  state: unknown;
}

export interface DocumentationNavigation {
  action: 'POP' | 'PUSH' | 'REPLACE';
  block: (canNavigate: (
    location: DocumentationLocation,
    action: DocumentationNavigation['action'],
  ) => boolean) => () => void;
  go: (delta: number) => void;
  location: DocumentationLocation;
  navigate: (path: string, options?: { replace?: boolean; state?: unknown }) => void;
}

export interface DocumentationHostProps {
  appearance?: {
    mode: ThemeMode;
    onModeChange: (mode: ThemeMode) => void;
  };
  navigation?: DocumentationNavigation;
}

export const DocumentationHostContext = createContext<DocumentationHostProps>({});
