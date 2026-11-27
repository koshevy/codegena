import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';
import {
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { CodeEditorFrame } from './code-editor-frame';
import { CodeEditorGlyphPortal } from './code-editor-glyph-portal';
import { createGeneratedCodeEditorOptions } from './create-generated-code-editor-options';
import { defineCodegenaMonacoTheme } from './monaco-setup';
import { useGeneratedCodeSyntaxReady } from './use-generated-code-syntax-ready';
import { useOverviewCursorVisibility } from './use-overview-cursor-visibility';

export interface CodeEditorGlyph {
  content: ReactNode;
  line: number;
}

const emptyGlyphs: CodeEditorGlyph[] = [];

export interface MonacoGeneratedCodeEditorProps {
  ariaLabel: string;
  glyphs?: CodeEditorGlyph[];
  height: number | string;
  /**
   * Hide the overview cursor marker while retaining other editor decorations.
   */
  isOverviewCursorHidden?: boolean;
  selectedLine?: number;
  syntaxReady: boolean;
  value: string;
}

export function MonacoGeneratedCodeEditor({
  ariaLabel,
  glyphs = emptyGlyphs,
  height,
  isOverviewCursorHidden = false,
  selectedLine,
  syntaxReady,
  value,
}: MonacoGeneratedCodeEditorProps): ReactElement {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const initialValueRef = useRef(value);
  const editorOptionsRef = useRef(createGeneratedCodeEditorOptions(
    ariaLabel,
    isOverviewCursorHidden,
  ));

  useOverviewCursorVisibility(editor, isOverviewCursorHidden);

  const { isReady: isSyntaxReady } = useGeneratedCodeSyntaxReady(
    editor,
    syntaxReady,
  );

  useEffect(() => {
    defineCodegenaMonacoTheme(theme);
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const model = monaco.editor.createModel(
      initialValueRef.current,
      'plaintext',
    );

    // The React wrapper resets Monaco's global theme whenever an editor mounts.
    const createdEditor = monaco.editor.create(container, {
      ...editorOptionsRef.current,
      model,
    });

    editorRef.current = createdEditor;
    setEditor(createdEditor);

    return () => {
      editorRef.current = null;
      createdEditor.dispose();
      model.dispose();
    };
  }, []);

  useEffect(() => {
    const model = editorRef.current?.getModel();

    if (model && model.getValue() !== value) {
      model.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    const mountedEditor = editorRef.current;

    if (!mountedEditor || selectedLine === undefined) {
      return;
    }

    const position = { column: 1, lineNumber: selectedLine };

    mountedEditor.setPosition(position);
    mountedEditor.revealPositionInCenter(position);
  }, [
    editor,
    selectedLine,
  ]);

  const renderedGlyphs = editor && glyphs.map(({ content, line }) => (
    <CodeEditorGlyphPortal
      editor={editor}
      key={line}
      line={line}
    >
      {content}
    </CodeEditorGlyphPortal>
  ));

  return (
    <CodeEditorFrame
      editorRef={editorRef}
      height={height}
      isPending={!isSyntaxReady}
      readOnly
    >
      <Box
        ref={containerRef}
        sx={{ height: '100%', width: '100%' }}
      />
      {renderedGlyphs}
    </CodeEditorFrame>
  );
}
