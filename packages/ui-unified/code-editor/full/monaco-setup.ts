import type { Theme } from '@mui/material/styles';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';

import { createMonacoTheme } from './create-monaco-theme';

export const codegenaMonacoThemeName = 'codegena';

interface MonacoThemeEntry {
  data: ReturnType<typeof createMonacoTheme>;
  serializedData: string;
}

interface MonacoThemeCache {
  entries: WeakMap<Theme, MonacoThemeEntry>;
  configuredData?: string;
}

const themeCache: MonacoThemeCache = { entries: new WeakMap() };

export function defineCodegenaMonacoTheme(theme: Theme): void {
  let themeEntry = themeCache.entries.get(theme);

  if (!themeEntry) {
    const data = createMonacoTheme(theme);

    themeEntry = { data, serializedData: JSON.stringify(data) };
    themeCache.entries.set(theme, themeEntry);
  }

  if (themeCache.configuredData === themeEntry.serializedData) {
    return;
  }

  monaco.editor.defineTheme(codegenaMonacoThemeName, themeEntry.data);
  monaco.editor.setTheme(codegenaMonacoThemeName);
  themeCache.configuredData = themeEntry.serializedData;
}
