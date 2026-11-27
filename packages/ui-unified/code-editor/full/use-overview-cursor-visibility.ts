import type { editor } from 'monaco-editor';
import { useEffect } from 'react';

export function useOverviewCursorVisibility(
  codeEditor: editor.IStandaloneCodeEditor | null,
  isHidden: boolean,
): void {
  useEffect(() => {
    codeEditor?.updateOptions({ hideCursorInOverviewRuler: isHidden });
  }, [
    codeEditor,
    isHidden,
  ]);
}
