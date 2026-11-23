import type {
  GraphPayloadGroupNode,
  GraphPayloadItemNode,
  GraphPayloadLog,
} from '@codegena/graph-core';
import { NestedItemsCount } from '@codegena/ui-unified/counts';
import {
  ProgrammingLanguageIcon,
  resolveProgrammingLanguage,
  WarningIconButton,
} from '@codegena/ui-unified/icons';
import {
  type MouseEvent,
  type ReactElement,
  useCallback,
} from 'react';

import { GeneratedFilesListDatatypeItem } from './generated-files-list-datatype-item';
import {
  GeneratedFilesListExpandButtonStyles,
} from './generated-files-list-expand-button.styles';
import {
  generatedFilesListFileItemClasses,
  GeneratedFilesListFileItemStyles,
} from './generated-files-list-file-item.styles';
import { stopPropagation } from './stop-propagation';

interface GeneratedFilesListFileItemProps {
  contextMenuNodeId?: string;
  group: GraphPayloadGroupNode;
  isExpanded: boolean;
  items: GraphPayloadItemNode[];
  onWarningClick: (nodeId: string, log: GraphPayloadLog) => void;
  shouldShowFullFilePath: boolean;
  warning?: GraphPayloadLog;
}

export function GeneratedFilesListFileItem({
  contextMenuNodeId,
  group,
  isExpanded,
  items,
  onWarningClick,
  shouldShowFullFilePath,
  warning,
}: GeneratedFilesListFileItemProps): ReactElement {
  const handleWarningClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();

    if (warning) {
      onWarningClick(group.id, warning);
    }
  }, [
    group.id,
    onWarningClick,
    warning,
  ]);

  const fileName = group.data.fileName;
  const language = resolveProgrammingLanguage(
    group.data.programmingLanguage ?? 'TypeScript',
  );

  const expandLabel = `${isExpanded ? 'Collapse' : 'Expand'} ${fileName}`;
  const displayName = shouldShowFullFilePath
    ? fileName
    : fileName.split('/').at(-1);

  const hasMultipleDataTypes = items.length > 1;
  const renderedCount = hasMultipleDataTypes && (
    <NestedItemsCount
      items={[
        { count: items.length, singular: 'data type', plural: 'data types' },
      ]}
    />
  );

  const renderedWarningIcon = warning && (
    <WarningIconButton
      ariaLabel={`Reveal warnings for ${fileName}`}
      onClick={handleWarningClick}
      title="Has warnings (click to reveal)"
    />
  );

  const renderedLabel = (
    <span
      className={generatedFilesListFileItemClasses.row}
    >
      <span
        className={generatedFilesListFileItemClasses.icon}
      >
        <ProgrammingLanguageIcon
          size="0.95rem"
          language={language}
        />
      </span>
      <span
        className={generatedFilesListFileItemClasses.text}
      >
        {displayName}
      </span>
      {renderedCount}
      {renderedWarningIcon}
    </span>
  );

  return (
    <GeneratedFilesListFileItemStyles
      data-context-menu-open={contextMenuNodeId === group.id}
      data-node-id={group.id}
      itemId={group.id}
      label={renderedLabel}
      slotProps={{
        iconContainer: {
          'aria-label': expandLabel,
          'onClick': stopPropagation,
          'onKeyDown': stopPropagation,
        },
        groupTransition: { timeout: 0 },
      }}
      slots={{ iconContainer: GeneratedFilesListExpandButtonStyles }}
    >
      {items.map((item) => (
        <GeneratedFilesListDatatypeItem
          contextMenuNodeId={contextMenuNodeId}
          item={item}
          key={item.id}
          onWarningClick={onWarningClick}
        />
      ))}
    </GeneratedFilesListFileItemStyles>
  );
}
