import type { MonacoCodeEditorProps } from './full';
import type { HighlightCodeEditorProps } from './minimal';

export type CodeEditorMode = 'full' | 'minimal';

interface FullCodeEditorProps extends MonacoCodeEditorProps {
  mode?: 'full';
}

interface MinimalCodeEditorProps extends HighlightCodeEditorProps {
  mode: 'minimal';
}

/**
 * Full mode supports Monaco actions and lifecycle callbacks.
 * Minimal mode renders highlighted source with native text input when editable.
 */
export type CodeEditorProps = FullCodeEditorProps | MinimalCodeEditorProps;
