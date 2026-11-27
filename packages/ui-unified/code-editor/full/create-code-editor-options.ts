import type { editor } from 'monaco-editor';

import { scrollbarSize } from '../../scrolling/scrollbar-theme';
import { codeEditorMetrics } from '../appearance';

interface CodeEditorOptions {
  ariaLabel: string;
  compactLineNumbers?: boolean;
  glyphMargin?: boolean;
  readOnly?: boolean;
}

export function createCodeEditorOptions({
  ariaLabel,
  compactLineNumbers = false,
  glyphMargin = false,
  readOnly = false,
}: CodeEditorOptions): editor.IStandaloneEditorConstructionOptions {
  return {
    automaticLayout: true,
    ariaLabel,
    contextmenu: false,
    fontFamily: codeEditorMetrics.fontFamily,
    fontSize: codeEditorMetrics.fontSize,
    fontWeight: codeEditorMetrics.fontWeight,
    folding: true,
    glyphMargin,
    letterSpacing: codeEditorMetrics.letterSpacing,
    lineDecorationsWidth: codeEditorMetrics.lineDecorationsWidth,
    lineHeight: codeEditorMetrics.lineHeight,
    lineNumbersMinChars: compactLineNumbers ? 2 : 5,
    minimap: { enabled: false },
    padding: {
      top: codeEditorMetrics.paddingBlock,
      bottom: codeEditorMetrics.paddingBlock,
    },
    readOnly,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
      horizontalScrollbarSize: scrollbarSize.horizontal,
      verticalScrollbarSize: scrollbarSize.vertical,
    },
    scrollBeyondLastLine: false,
    stickyScroll: { enabled: true },
  };
}
