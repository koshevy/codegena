import { lazy, type ReactElement, Suspense } from 'react';

import type { CodeEditorGlyphPortalProps } from './full';
import { loadMonacoEditors } from './load-monaco-editors';

const MonacoGlyphPortal = lazy(async () => {
  const { CodeEditorGlyphPortal: Portal } = await loadMonacoEditors();

  return { default: Portal };
});

export function CodeEditorGlyphPortal(props: CodeEditorGlyphPortalProps): ReactElement {
  return (
    <Suspense>
      <MonacoGlyphPortal {...props} />
    </Suspense>
  );
}
