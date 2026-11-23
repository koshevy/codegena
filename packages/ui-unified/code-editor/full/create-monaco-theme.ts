import { rgbToHex, type Theme } from '@mui/material/styles';
import type { editor } from 'monaco-editor';

import { createScrollbarColors } from '../../scrolling/scrollbar-theme';
import { getCodeEditorColors } from '../appearance';

function tokenColor(color: string): string {
  return color.replace('#', '');
}

export function createMonacoTheme(theme: Theme): editor.IStandaloneThemeData {
  const { palette } = theme;
  const scrollbarColors = createScrollbarColors(theme);

  const colors = getCodeEditorColors(theme);
  const {
    keyword: primary,
    number: info,
    regexp: warning,
    string: success,
    type: secondary,
  } = colors;

  return {
    base: palette.mode === 'dark' ? 'vs-dark' : 'vs',
    inherit: false,
    rules: [
      { token: '', foreground: tokenColor(colors.foreground) },
      { token: 'comment', foreground: tokenColor(colors.comment) },
      { token: 'delimiter', foreground: tokenColor(colors.foreground) },
      { token: 'invalid', foreground: tokenColor(colors.invalid) },
      { token: 'keyword', foreground: tokenColor(primary) },
      { token: 'number', foreground: tokenColor(info) },
      { token: 'regexp', foreground: tokenColor(warning) },
      { token: 'string', foreground: tokenColor(success) },
      { token: 'string.key.json', foreground: tokenColor(secondary) },
      { token: 'string.value.json', foreground: tokenColor(success) },
      { token: 'type', foreground: tokenColor(secondary) },
    ],
    colors: {
      'editor.background': palette.background.paper,
      'editor.foreground': palette.text.primary,
      'editor.lineHighlightBackground': palette.action.hover,
      'editor.rangeHighlightBackground': palette.action.hover,
      'editor.selectionBackground': palette.action.selected,
      'editor.selectionHighlightBackground': palette.action.hover,
      'editor.inactiveSelectionBackground': palette.action.hover,
      'editor.findMatchBackground': palette.action.selected,
      'editor.findMatchHighlightBackground': palette.action.hover,
      'editor.findRangeHighlightBackground': palette.action.hover,
      'editor.hoverHighlightBackground': palette.action.hover,
      'editor.wordHighlightBackground': palette.action.hover,
      'editor.wordHighlightStrongBackground': palette.action.selected,
      'editor.wordHighlightTextBackground': palette.action.hover,
      'editorBracketHighlight.foreground1': primary,
      'editorBracketHighlight.foreground2': secondary,
      'editorBracketHighlight.foreground3': info,
      'editorBracketHighlight.foreground4': success,
      'editorBracketHighlight.foreground5': warning,
      'editorBracketHighlight.foreground6': palette.text.secondary,
      'editorBracketHighlight.unexpectedBracket.foreground': palette.error.main,
      'editorBracketMatch.background': palette.action.hover,
      'editorBracketMatch.border': palette.primary.main,
      'editorBracketPairGuide.activeBackground1': primary,
      'editorBracketPairGuide.activeBackground2': secondary,
      'editorBracketPairGuide.activeBackground3': info,
      'editorError.foreground': palette.error.main,
      'editorInfo.foreground': palette.info.main,
      'editorWarning.foreground': palette.warning.main,
      'editorHint.foreground': palette.text.secondary,
      'editorCursor.foreground': palette.primary.main,
      'editorGutter.background': palette.background.paper,
      'editorGutter.foldingControlForeground': palette.text.secondary,
      'editorIndentGuide.background1': palette.divider,
      'editorIndentGuide.activeBackground1': palette.text.secondary,
      'editorLineNumber.foreground': palette.text.disabled,
      'editorLineNumber.activeForeground': palette.text.secondary,
      'editorLink.activeForeground': primary,
      'editorLightBulb.foreground': palette.warning.main,
      'editorLightBulbAutoFix.foreground': palette.primary.main,
      'editorOverviewRuler.border': palette.divider,
      'editorOverviewRuler.rangeHighlightForeground': palette.primary.main,
      'editorOverviewRuler.errorForeground': palette.error.main,
      'editorOverviewRuler.warningForeground': palette.warning.main,
      'editorOverviewRuler.infoForeground': palette.info.main,
      'editorStickyScrollHover.background': palette.action.hover,
      'editorWhitespace.foreground': palette.divider,
      'editorWidget.background': palette.background.paper,
      'editorWidget.foreground': palette.text.primary,
      'editorWidget.border': palette.divider,
      'editorHoverWidget.background': palette.background.paper,
      'editorHoverWidget.foreground': palette.text.primary,
      'editorHoverWidget.border': palette.divider,
      'focusBorder': palette.primary.main,
      'icon.foreground': palette.text.secondary,
      'input.background': palette.background.paper,
      'input.foreground': palette.text.primary,
      'input.border': palette.divider,
      'list.activeSelectionBackground': palette.action.selected,
      'list.activeSelectionForeground': palette.text.primary,
      'list.hoverBackground': palette.action.hover,
      'list.highlightForeground': primary,
      'scrollbar.shadow': palette.action.hover,
      'scrollbarSlider.background': rgbToHex(scrollbarColors.normal),
      'scrollbarSlider.hoverBackground': rgbToHex(scrollbarColors.hover),
      'scrollbarSlider.activeBackground': rgbToHex(scrollbarColors.active),
      'textLink.foreground': primary,
      'textLink.activeForeground': palette.primary.main,
    },
  };
}
