import type { OnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';
import { useEffect, useState } from 'react';

/**
 * Keeps source text in the pending appearance until Monaco can colorize it.
 */
export function useIsCodeEditorSyntaxReady(
  editor: Parameters<OnMount>[0] | null,
  language: string,
  canInitialize: boolean,
): boolean {
  const [readyLanguage, setReadyLanguage] = useState<string>();
  const isReady = readyLanguage === language;

  useEffect(() => {
    if (!editor || !canInitialize || isReady) {
      return;
    }

    const model = editor.getModel();
    const editorElement = editor.getDomNode();

    if (!model || !editorElement) {
      return;
    }

    let isDisposed = false;
    let tokenObserver: MutationObserver | undefined;

    const finishInitialization = (): void => {
      if (isDisposed) {
        return;
      }

      tokenObserver?.disconnect();
      setReadyLanguage(language);
    };

    const lastVisibleLine = editor.getVisibleRanges().at(-1)?.endLineNumber ?? 1;
    const previewEndLine = Math.min(model.getLineCount(), 20);
    const sourcePreview = model.getValueInRange({
      endColumn: model.getLineMaxColumn(previewEndLine),
      endLineNumber: previewEndLine,
      startColumn: 1,
      startLineNumber: 1,
    });

    void monaco.editor.colorize(
      sourcePreview,
      language,
      {},
    ).catch(() => '').then((coloredPreview) => {
      if (isDisposed) {
        return;
      }

      const hasJsonValues = language === 'json' && /["\d]/.test(
        sourcePreview,
      );
      const hasPreviewColors = /class="mtk(?!1(?:\s|"))\d+/.test(
        coloredPreview,
      );
      const shouldWaitForColoredTokens = hasJsonValues || hasPreviewColors;
      const hasColoredTokens = (): boolean => Boolean(
        editorElement.querySelector('.view-line span[class*="mtk"]:not(.mtk1)'),
      );

      if (shouldWaitForColoredTokens) {
        tokenObserver = new MutationObserver(() => {
          if (hasColoredTokens()) {
            finishInitialization();
          }
        });
        tokenObserver.observe(editorElement, {
          attributes: true,
          attributeFilter: ['class'],
          childList: true,
          subtree: true,
        });
      }

      monaco.editor.setModelLanguage(model, language);
      monaco.editor.colorizeModelLine(model, lastVisibleLine);
      editor.render(true);

      if (!shouldWaitForColoredTokens || hasColoredTokens()) {
        finishInitialization();
      }
    });

    return () => {
      isDisposed = true;
      tokenObserver?.disconnect();
    };
  }, [
    canInitialize,
    editor,
    isReady,
    language,
  ]);

  return isReady;
}
