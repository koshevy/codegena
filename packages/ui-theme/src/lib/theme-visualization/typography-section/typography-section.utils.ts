import type {
  TypographyStyleOptions,
  CSSProperties,
} from '@mui/material/styles/createTypography';
import type { CSSProperties as ReactCSSProperties } from 'react';

export function formatTypographySpec(
  styles: (
    | TypographyStyleOptions
    | CSSProperties
    | ReactCSSProperties
    | undefined
  ),
): string {
  if (!styles) {
    return '';
  }

  const parts = [
    styles.fontSize,
    'lineHeight' in styles ? `/ ${styles.lineHeight}` : null,
    'fontWeight' in styles ? `· ${styles.fontWeight}` : null,
  ].filter(Boolean);

  return parts.join(' ');
}
