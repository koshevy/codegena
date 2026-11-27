import type { editor as MonacoEditor } from 'monaco-editor';
import { type ReactElement, type ReactNode, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

import { addCodeEditorGlyphWidget } from './add-code-editor-glyph-widget';
import { CodeEditorGlyphPortalStyles } from './code-editor-glyph-portal.styles';

export interface CodeEditorGlyphPortalProps {
  children: ReactNode;
  editor: MonacoEditor.IStandaloneCodeEditor;
  line: number;
}

export function CodeEditorGlyphPortal({
  children,
  editor,
  line,
}: CodeEditorGlyphPortalProps): ReactElement {
  const domNode = useMemo(() => document.createElement('div'), []);

  useEffect(() => (
    addCodeEditorGlyphWidget(editor, line, domNode)
  ), [
    domNode,
    editor,
    line,
  ]);

  return createPortal(
    <CodeEditorGlyphPortalStyles>
      {children}
    </CodeEditorGlyphPortalStyles>,
    domNode,
  );
}
