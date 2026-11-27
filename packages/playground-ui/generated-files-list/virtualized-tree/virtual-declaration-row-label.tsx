import type { GraphPayloadLog } from '@codegena/graph-core';
import { getWarningLog } from '@codegena/playground-ui/graph-utils';
import { DeclarationTypeIcon, WarningIconButton } from '@codegena/ui-unified/icons';
import { type MouseEvent, type ReactElement, useCallback } from 'react';

import type { VirtualDeclarationRow } from './flatten-visible-tree';
import {
  generatedFilesListDatatypeItemClasses,
} from '../items/generated-files-list-datatype-item.styles';

interface VirtualDeclarationRowLabelProps {
  onWarningClick: (nodeId: string, log: GraphPayloadLog) => void;
  row: VirtualDeclarationRow;
}

export function VirtualDeclarationRowLabel({
  onWarningClick,
  row,
}: VirtualDeclarationRowLabelProps): ReactElement {
  const { item } = row;
  const { col, fileName, line } = item.data.sourceLocation;
  const declarationName = item.data.label;
  const sourceFileName = fileName.split(/[/\\]/).at(-1) ?? fileName;
  const warning = getWarningLog(item.data.logs);

  const handleWarningClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();

    if (warning) {
      onWarningClick(item.id, warning);
    }
  }, [item.id, onWarningClick, warning]);

  const renderedWarningIcon = warning && (
    <WarningIconButton
      ariaLabel={`Reveal warnings for ${declarationName}`}
      onClick={handleWarningClick}
      title="Has warnings (click to reveal)"
    />
  );

  return (
    <span className={generatedFilesListDatatypeItemClasses.datatype}>
      <span className={generatedFilesListDatatypeItemClasses.icon}>
        <DeclarationTypeIcon
          ariaLabel={`Select ${declarationName} declaration`}
          declarationType={item.data.declarationType}
          iconSize="0.9rem"
          title="Click to reveal source line in specification and generated code"
        />
      </span>
      <span className={generatedFilesListDatatypeItemClasses.info}>
        <span className={generatedFilesListDatatypeItemClasses.titleRow}>
          <span className={generatedFilesListDatatypeItemClasses.text}>
            {declarationName}
          </span>
          {renderedWarningIcon}
        </span>
        <span
          className={generatedFilesListDatatypeItemClasses.source}
          title={`${fileName}:${line}:${col}`}
        >
          {sourceFileName}:{line}:{col}
        </span>
      </span>
    </span>
  );
}
