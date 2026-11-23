import type {
  GraphPayload,
  GraphPayloadLog,
  GraphPayloadSourceLocation,
} from '@codegena/graph-core';
import { CodeEditor, CodeEditorGlyphPortal } from '@codegena/ui-unified/code-editor';
import type { OnMount } from '@monaco-editor/react';
import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { createDeclarationGlyphLines } from './create-declaration-glyph-lines';
import { DeclarationGlyph } from './declaration-glyph';
import { JsonEditorStyles } from './json-editor.styles';
import { useJsonRefDefinitions } from './reference-navigation';
import { useCodegenaMarkers } from './use-codegena-markers';

export interface JsonEditorProps {
  graph?: GraphPayload;
  logLevels?: readonly string[];
  navigationTarget?: GraphPayloadSourceLocation;
  onMount?: OnMount;
  onRevealNode?: (nodeId: string) => void;
  onRevealWarning?: (log: GraphPayloadLog) => void;
  sourceSchemaText: string;
  visible?: boolean;
}

const defaultLogLevels = ['warn', 'error'];

export function JsonEditor({
  graph,
  logLevels = defaultLogLevels,
  navigationTarget,
  onMount,
  onRevealNode,
  onRevealWarning,
  sourceSchemaText,
  visible = true,
}: JsonEditorProps): ReactElement {
  const [editor, setEditor] = useState<Parameters<OnMount>[0] | null>(null);
  const lineCount = editor?.getModel()?.getLineCount() ?? 0;
  const glyphLines = useMemo(() => (
    graph
      ? createDeclarationGlyphLines(graph, lineCount, logLevels)
      : []
  ), [
    graph,
    lineCount,
    logLevels,
  ]);

  useCodegenaMarkers(
    editor,
    logLevels,
    graph?.logs,
    onRevealWarning,
  );
  useJsonRefDefinitions(editor);

  const handleMount = useCallback<OnMount>((mountedEditor, monaco) => {
    // Monaco permanently disables tokenization for oversized models at creation.
    mountedEditor.setValue(sourceSchemaText);
    setEditor(mountedEditor);
    onMount?.(mountedEditor, monaco);
  }, [onMount, sourceSchemaText]);

  useEffect(() => {
    if (!editor || !navigationTarget || !visible) {
      return;
    }

    const position = {
      column: navigationTarget.col,
      lineNumber: navigationTarget.line,
    };

    editor.layout();
    editor.setPosition(position);
    editor.revealPositionInCenter(position);
  }, [
    editor,
    navigationTarget,
    visible,
  ]);

  const hasGlyphMargin = Boolean(graph);
  const hasToShowGlyphs = editor !== null;
  const renderedGlyphs = hasToShowGlyphs && glyphLines.map((sourceLine) => (
    <CodeEditorGlyphPortal
      editor={editor}
      key={sourceLine.line}
      line={sourceLine.line}
    >
      <DeclarationGlyph
        onRevealNode={onRevealNode}
        onRevealWarning={onRevealWarning}
        sourceLine={sourceLine}
      />
    </CodeEditorGlyphPortal>
  ));

  return (
    <JsonEditorStyles>
      <CodeEditor
        ariaLabel="Source schema code editor"
        compactLineNumbers
        defaultValue=""
        glyphMargin={hasGlyphMargin}
        language="json"
        onMount={handleMount}
      />
      {renderedGlyphs}
    </JsonEditorStyles>
  );
}
