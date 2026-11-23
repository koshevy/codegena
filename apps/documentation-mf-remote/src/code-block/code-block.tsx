import { CodeEditor } from '@codegena/ui-unified/code-editor-minimal';
import type { ReactElement } from 'react';

import { DocumentationCodeBlockStyles } from './code-block.styles';

export interface DocumentationCodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

export function DocumentationCodeBlock({
  children,
  className,
  language,
}: DocumentationCodeBlockProps): ReactElement {
  const editorLanguage = language ?? className?.replace('language-', '') ?? 'plaintext';
  const source = children.trimEnd();
  const lineCount = source.split('\n').length;
  const height = Math.min(480, lineCount * 22 + 32);
  const label = `${editorLanguage} code example`;

  return (
    <DocumentationCodeBlockStyles elevation={0}>
      <CodeEditor
        ariaLabel={label}
        height={height}
        language={editorLanguage}
        readOnly
        value={source}
      />
    </DocumentationCodeBlockStyles>
  );
}
