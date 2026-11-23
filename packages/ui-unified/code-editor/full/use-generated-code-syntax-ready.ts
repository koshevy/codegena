import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';
import { useEffect, useState } from 'react';

/**
 * Releases the pending appearance after Monaco loads the TypeScript tokenizer
 * and renders the editor with that language.
 * A ready editor keeps its colors while the surrounding list scrolls.
 */
export function useGeneratedCodeSyntaxReady(
  editor: monaco.editor.IStandaloneCodeEditor | null,
  canInitialize: boolean,
): { isReady: boolean } {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!editor || !canInitialize || isReady) {
      return;
    }

    const model = editor.getModel();

    if (!model) {
      return;
    }

    let isDisposed = false;

    const finishInitialization = (): void => {
      if (isDisposed) {
        return;
      }

      monaco.editor.setModelLanguage(model, 'typescript');

      const lastVisibleLine = editor.getVisibleRanges().at(-1)?.endLineNumber ?? 1;

      monaco.editor.colorizeModelLine(model, lastVisibleLine);
      editor.render(true);
      setIsReady(true);
    };

    // A failed tokenizer must not leave the editor in pending state forever.
    void monaco.editor.colorize(
      model.getLineContent(1),
      'typescript',
      {},
    ).catch(() => '').then(finishInitialization);

    return () => {
      isDisposed = true;
    };
  }, [
    canInitialize,
    editor,
    isReady,
  ]);

  return { isReady };
}
