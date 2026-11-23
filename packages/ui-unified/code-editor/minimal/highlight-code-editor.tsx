import { type ReactElement, useMemo } from 'react';

import { highlightCode } from './highlight-code';
import type { HighlightCodeEditorProps } from './highlight-code-editor.props';
import {
  highlightCodeEditorClasses,
  HighlightCodeEditorStyles,
} from './highlight-code-editor.styles';
import { HighlightedCodeLine } from './highlighted-code-line';
import { useHighlightEditorInput } from './use-highlight-editor-input';

export function HighlightCodeEditor({
  ariaLabel,
  compactLineNumbers = false,
  defaultValue,
  glyphMargin = false,
  height = '100%',
  language,
  readOnly = false,
  value,
}: HighlightCodeEditorProps): ReactElement {
  const {
    activeLine,
    handleChange,
    handleScroll,
    handleSelect,
    source,
    viewportRef,
  } = useHighlightEditorInput(value, defaultValue);

  const lines = useMemo(() => highlightCode(source, language), [
    language,
    source,
  ]);

  const renderedInput = !readOnly && (
    <textarea
      aria-label={ariaLabel}
      autoCapitalize="off"
      className={highlightCodeEditorClasses.input}
      onChange={handleChange}
      onScroll={handleScroll}
      onSelect={handleSelect}
      spellCheck={false}
      value={source}
      wrap="off"
    />
  );

  const renderedLines = useMemo(() => lines.map((line) => (
    <HighlightedCodeLine
      isActive={line.number === activeLine}
      key={line.number}
      line={line}
    />
  )), [
    activeLine,
    lines,
  ]);

  const minimumDigits = compactLineNumbers ? 2 : 5;
  const lineNumberDigits = Math.max(minimumDigits, String(lines.length).length);
  const indentWidth = source.match(/^ +(?=\S)/m)?.[0].length ?? 4;
  const indentSize = Math.min(indentWidth, 4);

  return (
    <HighlightCodeEditorStyles
      data-editable={!readOnly}
      data-glyph-margin={glyphMargin}
      sx={{
        height,
        '--editor-indent-size': indentSize,
        '--editor-line-number-digits': lineNumberDigits,
      }}
    >
      <pre
        aria-hidden={!readOnly}
        aria-label={readOnly ? ariaLabel : undefined}
        className={highlightCodeEditorClasses.viewport}
        ref={viewportRef}
        role={readOnly ? 'region' : undefined}
        tabIndex={readOnly ? 0 : undefined}
      >
        <code>{renderedLines}</code>
      </pre>
      {renderedInput}
    </HighlightCodeEditorStyles>
  );
}
