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
  const fencedLanguage = className?.match(/(?:^|\s)language-(\S+)/)?.[1];
  const editorLanguage = language ?? fencedLanguage ?? 'plaintext';
  const shellLanguages = ['bash', 'cmd', 'console', 'sh', 'shell', 'zsh'];
  const isShell = shellLanguages.includes(editorLanguage.toLowerCase());
  const source = children.trimEnd();
  const label = `${editorLanguage} code example`;

  return (
    <DocumentationCodeBlockStyles elevation={0}>
      <CodeEditor
        ariaLabel={label}
        compactLineNumbers
        height="auto"
        highlightActiveLine={false}
        language={editorLanguage}
        maxHeight={480}
        padding={16}
        readOnly
        showLineNumbers={!isShell}
        value={source}
      />
    </DocumentationCodeBlockStyles>
  );
}
