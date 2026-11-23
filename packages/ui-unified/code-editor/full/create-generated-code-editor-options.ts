import type { editor } from 'monaco-editor';

import { createCodeEditorOptions } from './create-code-editor-options';

export function createGeneratedCodeEditorOptions(
  ariaLabel: string,
  isOverviewCursorHidden: boolean,
): editor.IStandaloneEditorConstructionOptions {
  return {
    ...createCodeEditorOptions({
      ariaLabel,
      compactLineNumbers: true,
      glyphMargin: true,
      readOnly: true,
    }),
    codeLens: false,
    colorDecorators: false,
    foldingStrategy: 'indentation',
    hover: { enabled: false },
    hideCursorInOverviewRuler: isOverviewCursorHidden,
    inlayHints: { enabled: 'off' },
    inlineSuggest: { enabled: false },
    links: false,
    matchBrackets: 'never',
    occurrencesHighlight: 'off',
    parameterHints: { enabled: false },
    quickSuggestions: false,
    renderValidationDecorations: 'off',
    selectionHighlight: false,
    showFoldingControls: 'always',
    stickyScroll: { enabled: false },
    suggestOnTriggerCharacters: false,
    wordBasedSuggestions: 'off',
  };
}
