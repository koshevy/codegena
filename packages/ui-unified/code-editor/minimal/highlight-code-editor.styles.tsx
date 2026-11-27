import '@fontsource/jetbrains-mono/400.css';
import { styled } from '@mui/material/styles';

import { createScrollbarColors, scrollbarSize } from '../../scrolling/scrollbar-theme';
import { codeEditorMetrics, getCodeEditorColors } from '../appearance';

export const highlightCodeEditorClasses = {
  indentGuides: 'HighlightCodeEditor__indentGuides',
  input: 'HighlightCodeEditor__input',
  lineText: 'HighlightCodeEditor__lineText',
  viewport: 'HighlightCodeEditor__viewport',
} as const;

// language=postcss
export const HighlightCodeEditorStyles = styled('div')(({ theme }) => {
  const { palette } = theme;
  const scrollbarColors = createScrollbarColors(theme);
  const colors = getCodeEditorColors(theme);

  return `
    & {
      --editor-paper: var(--code-editor-background, ${palette.background.paper});
      --editor-digit-width: calc(var(--editor-line-number-digits) * 1ch);
      --editor-line-number-width: round(nearest, var(--editor-digit-width), 1px);
      --editor-glyph-width: 0px;
      --editor-decoration-width: ${codeEditorMetrics.lineDecorationsWidth}px;
      --editor-gutter-width: calc(
        var(--editor-glyph-width) + var(--editor-line-number-width)
        + var(--editor-decoration-width)
      );

      background: var(--editor-paper);
      color: ${palette.text.primary};
      font-family: ${codeEditorMetrics.fontFamily};
      font-size: ${codeEditorMetrics.fontSize}px;
      font-variant-ligatures: none;
      font-weight: ${codeEditorMetrics.fontWeight};
      letter-spacing: ${codeEditorMetrics.letterSpacing}px;
      line-height: ${codeEditorMetrics.lineHeight}px;
      min-height: 0;
      position: relative;
      tab-size: 4;
    }

    &::after {
      border-left: 1px solid ${palette.divider};
      content: var(--code-editor-overlay-scrollbar-divider, '');
      inset-block: 0;
      pointer-events: none;
      position: absolute;
      right: ${scrollbarSize.vertical - 1}px;
    }

    &[data-glyph-margin='true'] {
      --editor-glyph-width: ${codeEditorMetrics.lineHeight}px;
    }

    .${highlightCodeEditorClasses.viewport}:focus-visible,
    &:has(.${highlightCodeEditorClasses.input}:focus-visible) {
      outline: 1px solid ${palette.primary.main};
      outline-offset: -1px;
    }

    .${highlightCodeEditorClasses.viewport},
    .${highlightCodeEditorClasses.input} {
      background: transparent;
      border: 0;
      border-radius: 0;
      box-sizing: border-box;
      font: inherit;
      height: 100%;
      letter-spacing: inherit;
      margin: 0;
      max-height: inherit;
      overflow: auto;
      padding-block: var(--editor-padding, ${codeEditorMetrics.paddingBlock}px);
      padding-inline: var(--editor-padding, 0px);
      white-space: pre;
      width: 100%;
    }

    .${highlightCodeEditorClasses.viewport}::-webkit-scrollbar,
    .${highlightCodeEditorClasses.input}::-webkit-scrollbar {
      height: ${scrollbarSize.horizontal}px;
      width: ${scrollbarSize.vertical}px;
    }

    &:hover .${highlightCodeEditorClasses.viewport}::-webkit-scrollbar-thumb,
    &:hover .${highlightCodeEditorClasses.input}::-webkit-scrollbar-thumb {
      background: ${scrollbarColors.normal};
    }

    &:hover .${highlightCodeEditorClasses.viewport}::-webkit-scrollbar-thumb:hover,
    &:hover .${highlightCodeEditorClasses.input}::-webkit-scrollbar-thumb:hover {
      background: ${scrollbarColors.hover};
    }

    &:hover .${highlightCodeEditorClasses.viewport}::-webkit-scrollbar-thumb:active,
    &:hover .${highlightCodeEditorClasses.input}::-webkit-scrollbar-thumb:active {
      background: ${scrollbarColors.active};
    }

    .${highlightCodeEditorClasses.viewport} > code {
      background: transparent;
      border: 0;
      color: inherit;
      display: block;
      font: inherit;
      letter-spacing: inherit;
      min-width: 100%;
      padding: 0;
      width: max-content;
    }

    [data-line] {
      display: block;
      height: ${codeEditorMetrics.lineHeight}px;
      position: relative;
    }

    .${highlightCodeEditorClasses.indentGuides} {
      background: repeating-linear-gradient(
        90deg,
        ${palette.divider} 0 1px,
        transparent 1px calc(var(--editor-indent-size) * 1ch)
      );
      inset-block: 0;
      left: var(--editor-gutter-width);
      pointer-events: none;
      position: absolute;
    }

    &[data-line-numbers='false'] {
      --editor-line-number-width: 0px;
      --editor-decoration-width: 0px;
    }

    [data-line]::before {
      background: var(--editor-paper);
      box-sizing: content-box;
      color: ${palette.text.disabled};
      content: attr(data-line) / "";
      display: inline-block;
      left: 0;
      padding-inline: var(--editor-glyph-width) var(--editor-decoration-width);
      position: sticky;
      text-align: right;
      user-select: none;
      width: var(--editor-line-number-width);
    }

    &[data-line-numbers='false'] [data-line]::before {
      content: '';
    }

    [data-active='true'] {
      background: ${palette.action.hover};
    }

    [data-active='true']::before {
      color: ${palette.text.secondary};
    }

    @supports (background-clip: text) {
      .${highlightCodeEditorClasses.lineText} {
        background-image: linear-gradient(
          90deg,
          ${palette.secondary.main} 0%,
          ${palette.primary.main} 25%,
          ${palette.secondary.main} 50%,
          ${palette.primary.main} 75%,
          ${palette.success.main} 100%
        );
        background-size: 200% 100%;
        background-clip: text;
      }
    }

    [data-token='comment'] { color: ${colors.comment}; }
    [data-token='invalid'] { color: ${colors.invalid}; }
    [data-token='command'],
    [data-token='keyword'] { color: ${colors.keyword}; }
    [data-token='number'] { color: ${colors.number}; }
    [data-token='regexp'] { color: ${colors.regexp}; }
    [data-token='string'] { color: ${colors.string}; }
    [data-token='tag'],
    [data-token='type'] { color: ${colors.type}; }
    [data-token='attr'],
    [data-token='variable'] { color: ${colors.number}; }

    &[data-editable='true'] .${highlightCodeEditorClasses.viewport} {
      overflow: hidden;
      pointer-events: none;
    }

    .${highlightCodeEditorClasses.input} {
      caret-color: ${palette.primary.main};
      color: transparent;
      inset: 0;
      outline: 0;
      padding-inline-start: calc(var(--editor-gutter-width) + var(--editor-padding, 0px));
      position: absolute;
      resize: none;
    }

    .${highlightCodeEditorClasses.input}::selection {
      background: ${palette.action.selected};
      color: transparent;
    }
  `;
});
