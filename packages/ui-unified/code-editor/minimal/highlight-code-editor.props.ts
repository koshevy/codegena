export interface HighlightCodeEditorProps {
  ariaLabel: string;
  compactLineNumbers?: boolean;
  defaultValue?: string;
  glyphMargin?: boolean;
  height?: number | string;
  highlightActiveLine?: boolean;
  language: string;
  maxHeight?: number;
  padding?: number;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  value?: string;
}
