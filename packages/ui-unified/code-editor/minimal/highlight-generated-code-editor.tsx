import type { ReactElement } from 'react';

import { HighlightCodeEditor } from './highlight-code-editor';

export interface HighlightGeneratedCodeEditorProps {
  ariaLabel: string;
  height: number | string;
  value: string;
}

export function HighlightGeneratedCodeEditor({
  ariaLabel,
  height,
  value,
}: HighlightGeneratedCodeEditorProps): ReactElement {
  return (
    <HighlightCodeEditor
      ariaLabel={ariaLabel}
      compactLineNumbers
      glyphMargin
      height={height}
      language="typescript"
      readOnly
      value={value}
    />
  );
}
