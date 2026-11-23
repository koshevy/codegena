import type { GraphPayloadLog } from '@codegena/graph-core';
import { NestedItemsCount } from '@codegena/ui-unified/counts';
import {
  ProgrammingLanguageIcon,
  resolveProgrammingLanguage,
  WarningIconButton,
} from '@codegena/ui-unified/icons';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { type MouseEvent, type ReactElement, useCallback } from 'react';

import type { VirtualFileRow } from './flatten-visible-tree';
import {
  GeneratedFilesListExpandButtonStyles,
} from '../items/generated-files-list-expand-button.styles';
import {
  generatedFilesListFileItemClasses,
} from '../items/generated-files-list-file-item.styles';

interface VirtualFileRowLabelProps {
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onWarningClick: (nodeId: string, log: GraphPayloadLog) => void;
  row: VirtualFileRow;
  shouldShowFullFilePath: boolean;
}

export function VirtualFileRowLabel({
  isExpanded,
  onToggle,
  onWarningClick,
  row,
  shouldShowFullFilePath,
}: VirtualFileRowLabelProps): ReactElement {
  const { group, items, warning } = row.entry;
  const fileName = group.data.fileName;
  const language = resolveProgrammingLanguage(
    group.data.programmingLanguage ?? 'TypeScript',
  );

  const displayName = shouldShowFullFilePath
    ? fileName
    : fileName.split('/').at(-1);

  const handleToggle = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    onToggle(group.id);
  }, [group.id, onToggle]);

  const handleWarningClick = useCallback((event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();

    if (warning) {
      onWarningClick(group.id, warning);
    }
  }, [group.id, onWarningClick, warning]);

  const ExpandIcon = isExpanded ? ChevronDown : ChevronRight;
  const renderedExpandIcon = (
    <ExpandIcon
      aria-hidden
      size="1.1rem"
    />
  );

  const renderedCount = items.length > 1 && (
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

  return (
    <>
      <GeneratedFilesListExpandButtonStyles
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${fileName}`}
        onClick={handleToggle}
        size="small"
      >
        {renderedExpandIcon}
      </GeneratedFilesListExpandButtonStyles>
      <span className={generatedFilesListFileItemClasses.row}>
        <span className={generatedFilesListFileItemClasses.icon}>
          <ProgrammingLanguageIcon
            language={language}
            size="0.95rem"
          />
        </span>
        <span className={generatedFilesListFileItemClasses.text}>
          {displayName}
        </span>
        {renderedCount}
        {renderedWarningIcon}
      </span>
    </>
  );
}
