import type { GraphPayload } from '@codegena/graph-core';
import type { GeneratedView } from '@codegena/playground-ui/preferences';
import type { ThemeMode } from '@codegena/ui-unified/menus';
import type { ComponentType, ReactNode } from 'react';

export interface PlaygroundProps {
  defaultGeneratedView?: GeneratedView;
  defaultSourceOpen?: boolean;
  /**
   * Initial appearance when no saved preference exists.
   */
  defaultThemeMode?: ThemeMode;
  graph: GraphPayload;
  /**
   * Mounts a notification transport inside the active Playground theme.
   */
  notificationProvider?: ComponentType<{ children: ReactNode }>;
  /**
   * Shows the host's navigation button after GitHub when supplied.
   */
  onSandwichButtonClick?: () => void;
  persistenceKey?: string | null;
  sourceSchemaText: string;
}
