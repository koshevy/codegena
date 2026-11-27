import Editor, { type OnMount } from '@monaco-editor/react';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';

import { CodeEditorFrame } from './code-editor-frame';
import { createCodeEditorOptions } from './create-code-editor-options';
import {
  codegenaMonacoThemeName,
  defineCodegenaMonacoTheme,
} from './monaco-setup';
import { useIsCodeEditorSyntaxReady } from './use-is-code-editor-syntax-ready';

export interface MonacoCodeEditorProps {
  ariaLabel: string;
  compactLineNumbers?: boolean;
  defaultValue?: string;
  glyphMargin?: boolean;
  height?: number | string;
  language: string;
  onMount?: OnMount;
  readOnly?: boolean;
  syntaxReady?: boolean;
  value?: string;
}

export function MonacoCodeEditor({
  ariaLabel,
  compactLineNumbers = false,
  defaultValue,
  glyphMargin = false,
  height = '100%',
  language,
  onMount,
  readOnly = false,
  syntaxReady = true,
  value,
}: MonacoCodeEditorProps): ReactElement {
  const theme = useTheme();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const [editor, setEditor] = useState<Parameters<OnMount>[0] | null>(null);
  const isSyntaxReady = useIsCodeEditorSyntaxReady(
    editor,
    language,
    syntaxReady,
  );

  const options = useMemo(() => createCodeEditorOptions({
    ariaLabel,
    compactLineNumbers,
    glyphMargin,
    readOnly,
  }), [
    ariaLabel,
    compactLineNumbers,
    glyphMargin,
    readOnly,
  ]);

  const handleMount = useCallback<OnMount>((mountedEditor, monaco) => {
    editorRef.current = mountedEditor;
    setEditor(mountedEditor);
    onMount?.(mountedEditor, monaco);
  }, [onMount]);

  const handleBeforeMount = useCallback((): void => {
    defineCodegenaMonacoTheme(theme);
  }, [theme]);

  useEffect(() => {
    defineCodegenaMonacoTheme(theme);
  }, [theme]);

  return (
    <CodeEditorFrame
      editorRef={editorRef}
      height={height}
      isPending={!isSyntaxReady}
      readOnly={readOnly}
    >
      <Editor
        defaultValue={defaultValue}
        height="100%"
        language="plaintext"
        loading={<CircularProgress color="secondary" />}
        onMount={handleMount}
        beforeMount={handleBeforeMount}
        options={options}
        theme={codegenaMonacoThemeName}
        value={value}
        width="100%"
      />
    </CodeEditorFrame>
  );
}
