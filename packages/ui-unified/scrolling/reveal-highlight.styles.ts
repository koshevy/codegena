import { alpha, type Theme } from '@mui/material/styles';

export const revealHighlightClass = 'RevealHighlight--active';
export const revealHighlightDurationMs = 400;

export function getRevealHighlightCss(
  theme: Theme,
): string {
  const highlight = alpha(theme.palette.warning.light, 0.3);

  // language=postcss
  return `
    &.${revealHighlightClass} > .${revealHighlightClass} {
      animation: codegena-reveal-blink ${revealHighlightDurationMs}ms ease-in-out both;
      animation-delay: 100ms;
      background: ${highlight};
      inset: 0;
      pointer-events: none;
      position: absolute;
    }

    @keyframes codegena-reveal-blink {
      0% { opacity: 0; }
      50% { opacity: 0.4; }
      100% { opacity: 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      &.${revealHighlightClass} > .${revealHighlightClass} {
        animation: none;
        opacity: 0;
      }
    }
  `;
}
