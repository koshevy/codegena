import Box from '@mui/material/Box';
import { lazy, type ReactElement, Suspense } from 'react';

import type { GeneratedCodeEditorProps } from './generated-code-editor.props';
import { loadMonacoEditors } from './load-monaco-editors';

const MonacoGeneratedCodeEditor = lazy(async () => {
  const { MonacoGeneratedCodeEditor: Editor } = await loadMonacoEditors();

  return { default: Editor };
});

const HighlightGeneratedCodeEditor = lazy(async () => {
  const { HighlightGeneratedCodeEditor: Editor } = await import(
    /* webpackChunkName: "code-editor-minimal" */ './minimal'
  );

  return { default: Editor };
});

export function GeneratedCodeEditor(props: GeneratedCodeEditorProps): ReactElement {
  const renderedPending = <Box sx={{ height: props.height }} />;
  const renderedEditor = props.mode === 'minimal'
    ? <HighlightGeneratedCodeEditor {...props} />
    : <MonacoGeneratedCodeEditor {...props} />;

  return (
    <Suspense fallback={renderedPending}>
      {renderedEditor}
    </Suspense>
  );
}
