import Box from '@mui/material/Box';
import { lazy, type ReactElement, Suspense } from 'react';

import type { CodeEditorProps } from './code-editor.props';
import { loadMonacoEditors } from './load-monaco-editors';

const MonacoCodeEditor = lazy(async () => {
  const { MonacoCodeEditor: Editor } = await loadMonacoEditors();

  return { default: Editor };
});

const HighlightCodeEditor = lazy(async () => {
  const { HighlightCodeEditor: Editor } = await import(
    /* webpackChunkName: "code-editor-minimal" */ './minimal'
  );

  return { default: Editor };
});

export function CodeEditor(props: CodeEditorProps): ReactElement {
  const renderedPending = <Box sx={{ height: props.height ?? '100%' }} />;
  const renderedEditor = props.mode === 'minimal'
    ? <HighlightCodeEditor {...props} />
    : <MonacoCodeEditor {...props} />;

  return (
    <Suspense fallback={renderedPending}>
      {renderedEditor}
    </Suspense>
  );
}
