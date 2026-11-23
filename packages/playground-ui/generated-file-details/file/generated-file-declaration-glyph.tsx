import type {
  GraphPayloadItemNode,
  GraphPayloadSourceLocation,
} from '@codegena/graph-core';
import { DeclarationTypeIcon } from '@codegena/ui-unified/icons';
import { type ReactElement, useCallback } from 'react';

interface GeneratedFileDeclarationGlyphProps {
  item: GraphPayloadItemNode;
  onNavigateToSource?: (
    location: GraphPayloadSourceLocation,
    generatedDeclarationId?: string,
  ) => void;
}

export function GeneratedFileDeclarationGlyph({
  item,
  onNavigateToSource,
}: GeneratedFileDeclarationGlyphProps): ReactElement {
  const label = [
    `Reveal ${item.data.label} in source schema`,
    `at line ${item.data.sourceLocation.line}`,
  ].join(' ');

  const handleClick = useCallback((): void => {
    onNavigateToSource?.(item.data.sourceLocation, item.id);
  }, [
    item,
    onNavigateToSource,
  ]);

  return (
    <DeclarationTypeIcon
      ariaLabel={label}
      declarationType={item.data.declarationType}
      disabled={!onNavigateToSource}
      onClick={handleClick}
      sx={{ ml: 1 }}
      title="Click to reveal source line in specification and hierarchy"
      type="button"
    />
  );
}
