import type { ReactElement } from 'react';

import type { HighlightedLine } from './highlight-code';
import { highlightCodeEditorClasses } from './highlight-code-editor.styles';

interface HighlightedCodeLineProps {
  isActive: boolean;
  line: HighlightedLine;
}

export function HighlightedCodeLine({
  isActive,
  line: { indentColumns, number, tokens },
}: HighlightedCodeLineProps): ReactElement {
  const renderedIndentGuides = indentColumns > 0 && (
    <span
      aria-hidden
      className={highlightCodeEditorClasses.indentGuides}
      style={{ width: `${indentColumns}ch` }}
    />
  );

  return (
    <span
      data-active={isActive}
      data-line={number}
    >
      {renderedIndentGuides}
      <span className={highlightCodeEditorClasses.lineText}>
        {tokens.map(({ offset, style, value }) => (
          <span
            data-token={style}
            key={offset}
          >
            {value}
          </span>
        ))}
      </span>
    </span>
  );
}
