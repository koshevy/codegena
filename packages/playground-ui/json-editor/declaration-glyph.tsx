import type { GraphPayloadLog } from '@codegena/graph-core';
import {
  codeEditorGlyphButtonClasses,
  CodeEditorGlyphButtonStyles,
} from '@codegena/ui-unified/code-editor';
import { DeclarationTypeIcon, WarningIcon } from '@codegena/ui-unified/icons';
import { ContextMenu } from '@codegena/ui-unified/menus';
import { Ellipsis } from 'lucide-react';
import { type MouseEvent, type ReactElement, useCallback, useState } from 'react';

import type { DeclarationGlyphLine } from './create-declaration-glyph-lines';
import { DeclarationGlyphWarningStyles } from './declaration-glyph.styles';
import { useContextMenuItems } from './use-context-menu-items';

export interface DeclarationGlyphProps {
  onRevealNode?: (nodeId: string) => void;
  onRevealWarning?: (log: GraphPayloadLog) => void;
  sourceLine: DeclarationGlyphLine;
}

export function DeclarationGlyph({
  onRevealNode,
  onRevealWarning,
  sourceLine,
}: DeclarationGlyphProps): ReactElement {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const { items, line, logs } = sourceLine;
  const hasWarnings = logs.length > 0;
  const hasChoices = items.length + Number(hasWarnings) > 1;
  const hasToShowStandaloneWarning = items.length === 0;
  const hasToShowChoiceWarning = hasWarnings && hasChoices;
  const glyphClassName = hasToShowStandaloneWarning
    ? codeEditorGlyphButtonClasses.noHoverBackground
    : undefined;
  const isMenuExpanded = anchorElement ? true : undefined;
  const popupType = hasChoices ? 'menu' : undefined;

  const onlyItem = items.length === 1
    ? items[0]
    : undefined;

  const menuHeader = items.length > 0
    ? 'Generated declarations'
    : undefined;

  const onlyVisibleItem = !hasChoices
    ? onlyItem
    : undefined;

  const handleClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    if (onlyItem && !hasChoices && onRevealNode) {
      onRevealNode(onlyItem.id);
      return;
    }

    if (!items.length && logs[0]) {
      onRevealWarning?.(logs[0]);
      return;
    }

    setAnchorElement(event.currentTarget);
  }, [
    hasChoices,
    items.length,
    logs,
    onRevealNode,
    onRevealWarning,
    onlyItem,
  ]);

  const handleClose = useCallback((): void => {
    setAnchorElement(null);
  }, []);

  const menuItems = useContextMenuItems(
    sourceLine,
    onRevealNode,
    onRevealWarning,
  );

  const ariaLabel = hasWarnings
    ? `Show generated declarations and warnings for line ${line}`
    : `Reveal generated declarations for line ${line}`;

  const renderedDeclarationIcon = onlyVisibleItem && (
    <DeclarationTypeIcon
      ariaLabel={ariaLabel}
      declarationType={onlyVisibleItem.data.declarationType}
      onClick={handleClick}
      sx={{ ml: 1 }}
      title="Click to reveal generated code and hierarchy"
      type="button"
    />
  );

  const renderedChoicesIcon = hasChoices && (
    <Ellipsis
      aria-hidden
      size={16}
    />
  );

  const renderedStandaloneWarning = hasToShowStandaloneWarning && (
    <WarningIcon
      aria-hidden
      size="0.8rem"
    />
  );

  const renderedChoiceWarning = hasToShowChoiceWarning && (
    <DeclarationGlyphWarningStyles>
      <WarningIcon
        aria-hidden
        size={13}
      />
    </DeclarationGlyphWarningStyles>
  );

  const renderedChoicesOrWarning = !onlyVisibleItem && (
    <CodeEditorGlyphButtonStyles
      aria-expanded={isMenuExpanded}
      aria-haspopup={popupType}
      aria-label={ariaLabel}
      className={glyphClassName}
      onClick={handleClick}
      type="button"
    >
      {renderedChoicesIcon}
      {renderedStandaloneWarning}
      {renderedChoiceWarning}
    </CodeEditorGlyphButtonStyles>
  );

  return (
    <>
      {renderedDeclarationIcon}
      {renderedChoicesOrWarning}
      <ContextMenu
        anchor={anchorElement}
        ariaLabel={`Line ${line} results`}
        header={menuHeader}
        items={menuItems}
        onClose={handleClose}
      />
    </>
  );
}
