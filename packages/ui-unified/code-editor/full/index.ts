// Register full Monaco contributions before either editor mounts.
import 'monaco-editor/esm/vs/editor/edcore.main.js';

export {
  CodeEditorGlyphPortal,
  type CodeEditorGlyphPortalProps,
} from './code-editor-glyph-portal';
export { MonacoCodeEditor, type MonacoCodeEditorProps } from './monaco-code-editor';
export {
  MonacoGeneratedCodeEditor,
  type CodeEditorGlyph,
  type MonacoGeneratedCodeEditorProps,
} from './monaco-generated-code-editor';
