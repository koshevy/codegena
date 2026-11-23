import type { Theme } from '@mui/material/styles';

interface CodeEditorColors {
  comment: string;
  foreground: string;
  invalid: string;
  keyword: string;
  number: string;
  regexp: string;
  string: string;
  type: string;
}

export function getCodeEditorColors({ palette }: Theme): CodeEditorColors {
  return {
    comment: palette.text.secondary,
    foreground: palette.text.primary,
    invalid: palette.error.main,
    keyword: palette.primary.dark,
    number: palette.info.dark,
    regexp: palette.warning.dark,
    string: palette.success.dark,
    type: palette.secondary.dark,
  };
}
