import type { IconButtonProps } from '@mui/material/IconButton';
import type { ReactNode } from 'react';

export type DeclarationGlyphKind = (
  'Interface'
  | 'Namespace'
  | 'Union'
  | 'Intersection'
  | 'Array'
  | 'Record'
  | 'Literal'
  | 'Scalar'
  | 'Alias'
);

export interface DeclarationTypeIconProps extends Omit<
  IconButtonProps,
  'aria-label' | 'children' | 'className' | 'size' | 'title'
> {
  ariaLabel?: string;
  asButton?: boolean;
  declarationType: DeclarationGlyphKind;
  iconSize?: number | string;
  noHoverStyles?: boolean;
  title?: ReactNode;
}
