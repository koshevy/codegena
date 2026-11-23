import type { ThemeMode } from '@codegena/ui-unified/menus';

import type { GeneratedFileDetailsScope } from './generated-file-details-scope';
import type { GeneratedFileSortMode } from './generated-file-sort-mode';
import type { GeneratedView } from './generated-view';

export type PlaygroundPanelWidths = Record<'source' | 'generated' | 'details', number>;

export interface PlaygroundPreferences {
  detailsOpenWidth: number;
  detailsScope: GeneratedFileDetailsScope;
  generatedView: GeneratedView;
  layout: PlaygroundPanelWidths;
  sortMode: GeneratedFileSortMode;
  sourceOpenWidth: number;
  themeMode: ThemeMode;
}

export interface InitialPlaygroundPreferences {
  preferences: PlaygroundPreferences;
  restored: boolean;
}
