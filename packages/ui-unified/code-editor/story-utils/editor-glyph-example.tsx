import {
  CodeEditor,
  CodeEditorGlyphPortal,
  GeneratedCodeEditor,
} from '@codegena/ui-unified/code-editor';
import { DeclarationTypeIcon } from '@codegena/ui-unified/icons';
import Box from '@mui/material/Box';
import type { editor as MonacoEditor } from 'monaco-editor';
import { type ReactElement, useCallback, useState } from 'react';

export interface EditorGlyphExampleProps {
  onGlyphClick: () => void;
  variant: 'editable' | 'generated';
}

export function EditorGlyphExample({
  onGlyphClick,
  variant,
}: EditorGlyphExampleProps): ReactElement {
  const [editor, setEditor] = useState<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [isActivated, setIsActivated] = useState(false);

  const handleGlyphClick = useCallback((): void => {
    setIsActivated(true);
    onGlyphClick();
    editor?.setPosition({ column: 1, lineNumber: 2 });
    editor?.focus();
  }, [
    editor,
    onGlyphClick,
  ]);

  const renderedGlyph = (
    <DeclarationTypeIcon
      ariaLabel="Reveal Interface on line 2"
      declarationType="Interface"
      onClick={handleGlyphClick}
      title="Reveal Interface on line 2"
    />
  );

  const renderedEditableGlyph = editor && (
    <CodeEditorGlyphPortal
      editor={editor}
      line={2}
    >
      {renderedGlyph}
    </CodeEditorGlyphPortal>
  );

  const renderedEditableEditor = variant === 'editable' && (
    <>
      <CodeEditor
        ariaLabel="Editable editor with glyph"
        defaultValue={'{\n  "symbol": "Example"\n}\n'}
        glyphMargin
        height={240}
        language="json"
        onMount={setEditor}
      />
      {renderedEditableGlyph}
    </>
  );

  const renderedGeneratedEditor = variant === 'generated' && (
    <GeneratedCodeEditor
      ariaLabel="Generated editor with glyph"
      glyphs={[{ content: renderedGlyph, line: 2 }]}
      height={240}
      selectedLine={isActivated ? 2 : undefined}
      syntaxReady
      value={'export interface Example {\n  symbol: string;\n}\n'}
    />
  );

  return (
    <Box>
      {renderedEditableEditor}
      {renderedGeneratedEditor}
      <Box role="status">
        {isActivated ? 'Symbol on line 2 revealed' : 'Select the line 2 glyph'}
      </Box>
    </Box>
  );
}
