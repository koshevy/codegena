import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';

export function addCodeEditorGlyphWidget(
  editor: monaco.editor.IStandaloneCodeEditor,
  line: number,
  domNode: HTMLDivElement,
): () => void {
  const widget: monaco.editor.IGlyphMarginWidget = {
    getDomNode: () => domNode,
    getId: () => `ui-unified-glyph-line-${line}`,
    getPosition: () => ({
      lane: monaco.editor.GlyphMarginLane.Center,
      range: new monaco.Range(line, 1, line, 1),
      zIndex: 1,
    }),
  };

  editor.addGlyphMarginWidget(widget);

  // Monaco hides the margin from accessibility APIs, including our buttons.
  domNode.closest('.margin')?.removeAttribute('aria-hidden');

  return () => editor.removeGlyphMarginWidget(widget);
}
