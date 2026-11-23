import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import {
  ALargeSmall,
  ArrowBigRightDash,
  Blend,
  Braces,
  Brackets,
  CircleDot,
  Layers,
  Network,
  TableProperties,
} from 'lucide-react';
import type { ReactElement } from 'react';

import type {
  DeclarationGlyphKind,
  DeclarationTypeIconProps,
} from './declaration-type-icon.props';
import {
  declarationTypeIconClasses,
  DeclarationTypeIconButtonStyles,
  DeclarationTypeIconStyles,
} from './declaration-type-icon.styles';

function renderDeclarationIcon(
  declarationType: DeclarationGlyphKind,
  iconSize: number | string,
): ReactElement {
  switch (declarationType) {
    case 'Interface':
      return (
        <TableProperties
          aria-hidden
          size={iconSize}
        />
      );
    case 'Namespace':
      return (
        <Network
          aria-hidden
          size={iconSize}
        />
      );
    case 'Union':
      return (
        <Layers
          aria-hidden
          size={iconSize}
        />
      );
    case 'Intersection':
      return (
        <Blend
          aria-hidden
          size={iconSize}
        />
      );
    case 'Array':
      return (
        <Brackets
          aria-hidden
          size={iconSize}
        />
      );
    case 'Record':
      return (
        <Braces
          aria-hidden
          size={iconSize}
        />
      );
    case 'Literal':
      return (
        <ALargeSmall
          aria-hidden
          size={iconSize}
        />
      );
    case 'Scalar':
      return (
        <CircleDot
          aria-hidden
          size={iconSize}
        />
      );
    case 'Alias':
      return (
        <ArrowBigRightDash
          aria-hidden
          size={iconSize}
        />
      );
  }
}

export function DeclarationTypeIcon({
  ariaLabel,
  asButton = true,
  declarationType,
  disabled,
  iconSize = '.9rem',
  noHoverStyles = false,
  title,
  ...buttonProps
}: DeclarationTypeIconProps): ReactElement {
  const defaultTitle = `Kind of declaration: ${declarationType}`;
  const requestedTitle = title === undefined ? defaultTitle : title;
  const tooltipTitle = disabled ? null : requestedTitle;
  const iconLabel = asButton ? declarationType : undefined;
  const iconRole = asButton ? 'img' : undefined;

  const renderedIcon = (
    <DeclarationTypeIconStyles
      aria-hidden={!asButton}
      aria-label={iconLabel}
      className={clsx({
        [declarationTypeIconClasses.root]: true,
        [declarationTypeIconClasses.noHoverStyles]: noHoverStyles,
      })}
      role={iconRole}
    >
      {renderDeclarationIcon(declarationType, iconSize)}
    </DeclarationTypeIconStyles>
  );

  const renderedButton = asButton && (
    <DeclarationTypeIconButtonStyles
      aria-label={ariaLabel ?? defaultTitle}
      data-declaration-type-glyph=""
      disabled={disabled}
      size="small"
      {...buttonProps}
    >
      {renderedIcon}
    </DeclarationTypeIconButtonStyles>
  );

  const renderedControl = renderedButton || renderedIcon;

  return (
    <Tooltip title={tooltipTitle}>
      {renderedControl}
    </Tooltip>
  );
}
