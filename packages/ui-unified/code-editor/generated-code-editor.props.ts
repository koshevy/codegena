import type { MonacoGeneratedCodeEditorProps } from './full';
import type { HighlightGeneratedCodeEditorProps } from './minimal';

interface FullGeneratedCodeEditorProps extends MonacoGeneratedCodeEditorProps {
  mode?: 'full';
}

interface MinimalGeneratedCodeEditorProps extends HighlightGeneratedCodeEditorProps {
  mode: 'minimal';
}

/**
 * Configures the read-only view of a generated TypeScript file.
 */
export type GeneratedCodeEditorProps
  = FullGeneratedCodeEditorProps | MinimalGeneratedCodeEditorProps;
